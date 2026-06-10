import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProveedorService } from '../../../../../services/proveedor.service';
import { Proveedor } from '../../../../../models/proveedor.model';
import { getUserIdFromToken } from '../../../../../Utils/jwt.utils';
import { PedidoProveedorDTO, PedidoProveedorResponseDTO } from '../../../../../models/pedido-proveedor.model';
import { CategoriaInventario } from '../../../../../models/categoriaInventario.model';
import { CategoriaService } from '../../../../../services/categoria.service';
import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, switchMap, forkJoin, Subscription, takeUntil, Subject, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { PedidoProveedorService } from '../../../../../services/pedido-proveedor.service';

@Component({
  selector: 'app-editar-pedido-proveedor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './editar-pedido-proveedor.component.html',
  styleUrls: ['./editar-pedido-proveedor.component.scss'],
  animations: [
    trigger('fadeIn', [transition(':enter', [style({ opacity: 0 }), animate('300ms ease-out', style({ opacity: 1 }))])]),
    trigger('slideInDown', [transition(':enter', [style({ transform: 'translateY(-20px)', opacity: 0 }), animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))])]),
    trigger('fadeInUp', [transition(':enter', [style({ transform: 'translateY(20px)', opacity: 0 }), animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))])]),
    trigger('staggerFade', [transition('* => *', [query(':enter', [style({ opacity: 0, transform: 'scale(0.8)' }), stagger('50ms', [animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))])], { optional: true })])]),
    trigger('slideInUpStagger', [transition(':enter', [style({ transform: 'translateY(20px)', opacity: 0 }), animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))])]),
    trigger('shake', [transition('* => *', [animate('500ms ease-in-out', keyframes([
      style({ transform: 'translateX(0)', offset: 0 }),
      style({ transform: 'translateX(-5px)', offset: 0.1 }),
      style({ transform: 'translateX(5px)', offset: 0.2 }),
      style({ transform: 'translateX(-5px)', offset: 0.3 }),
      style({ transform: 'translateX(5px)', offset: 0.4 }),
      style({ transform: 'translateX(-5px)', offset: 0.5 }),
      style({ transform: 'translateX(5px)', offset: 0.6 }),
      style({ transform: 'translateX(-5px)', offset: 0.7 }),
      style({ transform: 'translateX(5px)', offset: 0.8 }),
      style({ transform: 'translateX(-5px)', offset: 0.9 }),
      style({ transform: 'translateX(0)', offset: 1 })
    ]))])]),
    trigger('pulse', [transition('* => *', [animate('1.5s ease-in-out', keyframes([
      style({ transform: 'scale(1)', offset: 0 }),
      style({ transform: 'scale(1.05)', offset: 0.5 }),
      style({ transform: 'scale(1)', offset: 1 })
    ]))])])
  ]
})
export class EditarPedidoProveedorComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  proveedores: Proveedor[] = [];
  allCategorias: CategoriaInventario[] = [];
  categoriasDisponibles: CategoriaInventario[] = [];
  pedidoOriginal: PedidoProveedorResponseDTO | null = null;
  isLoading = false;

  subcategoriasPorItem: { [key: number]: CategoriaInventario[] } = {};
  private subscriptions: Subscription[] = [];
  private unsubscribe$ = new Subject<void>();
  esEdicion = true;
  pedidoId!: number;
  proveedorNombreEmpresa: string = '';

  constructor(
    private fb: FormBuilder,
    private proveedorService: ProveedorService,
    private categoriaService: CategoriaService,
    private pedidoProveedorService: PedidoProveedorService,
    private dialogRef: MatDialogRef<EditarPedidoProveedorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pedido: PedidoProveedorResponseDTO },
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.pedidoOriginal = this.data?.pedido || null;

    if (!this.pedidoOriginal) {
      console.error('❌ Pedido inválido.');
      this.dialogRef.close();
      return;
    }

    const solicitanteId = getUserIdFromToken();
    console.log('id recibido:', solicitanteId)
    console.log('id para comparar:', this.pedidoOriginal!.id)
    if (solicitanteId !== this.pedidoOriginal!.solicitanteId) {
      this.snackBar.open('No tienes permisos para editar este pedido.', 'Cerrar', { duration: 4000 });
      this.dialogRef.close();
      return;
    }

    this.initializeForm();

    forkJoin({
      proveedores: this.proveedorService.getProveedores(),
      categorias: this.categoriaService.getCategorias()
    }).pipe(take(1)).subscribe({
      next: ({ proveedores, categorias }) => {
        this.proveedores = proveedores;
        this.allCategorias = categorias;
        this.cargarDatosDelPedido(this.pedidoOriginal!);
      },
      error: (err) => {
        console.error('Error al cargar datos iniciales:', err);
        this.snackBar.open('Error al cargar los datos necesarios.', 'Cerrar', { duration: 4000 });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      fecha: [{ value: new Date(), disabled: true }, [Validators.required, this.fechaNoFuturaValidator]],
      proveedorId: [{ value: null, disabled: true }, Validators.required],
      items: this.fb.array([])
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  agregarItem(itemExistente?: any): void {
    const itemGroup = this.fb.group({
      id: [itemExistente?.id || null],
      categoriaId: [{ value: itemExistente?.categoria?.parent_id || itemExistente?.categoria?.id || '', disabled: false }, Validators.required],
      subcategoriaId: [{ value: itemExistente?.categoria?.parent_id ? itemExistente?.categoria.id : null, disabled: false }],
      nombreMaterial: [itemExistente?.categoria?.nombreSubcategoria || itemExistente?.categoria?.nombre || '', Validators.required],
      cantidad: [itemExistente?.cantidad || null, [Validators.required, Validators.min(1)]],
      unidadPresentacion: [{ value: itemExistente?.unidadPresentacion || '', disabled: true }, Validators.required],
      cantidadTotal: [itemExistente?.cantidadTotal || null, [Validators.required, Validators.min(0.1)]],
      unidadMedida: [{ value: itemExistente?.unidadMedida || '', disabled: true }, Validators.required],
      color: [itemExistente?.color || '#000000']
    });

    const categoriaIdControl = itemGroup.get('categoriaId');
    const subcategoriaIdControl = itemGroup.get('subcategoriaId');
    const itemIndex = this.items.length;

    if (categoriaIdControl) {
      const sub = categoriaIdControl.valueChanges.pipe(
        takeUntil(this.unsubscribe$),
        switchMap(categoriaId => {
          if (!categoriaId) return of([]);
          subcategoriaIdControl?.setValue(null);

          const catIdNum = parseInt(categoriaId, 10);
          if (isNaN(catIdNum)) return of([]);

          const proveedorId = this.form.get('proveedorId')?.value;

          // 🔹 Filtrado correcto usando proveedorIds
          const subcategorias = this.allCategorias.filter(c =>
            c.parent_id === catIdNum && c.proveedorIds?.includes(proveedorId)
          );

          return of(subcategorias);
        })
      ).subscribe(subcategorias => {
        this.subcategoriasPorItem[itemIndex] = subcategorias;
        subcategorias.length ? subcategoriaIdControl?.enable() : subcategoriaIdControl?.disable();
      });
      this.subscriptions.push(sub);
    }

    this.items.push(itemGroup);
  }

  guardar(): void {
    if (this.form.invalid || !this.pedidoOriginal) {
    return;
  }

  // Usar getRawValue() en cada item para incluir campos deshabilitados
  const itemsFormRaw = this.items.controls.map(ctrl => ctrl.getRawValue());

  const pedidoActualizado: PedidoProveedorDTO = {
    fecha: this.form.getRawValue().fecha,
    proveedorId: this.pedidoOriginal.proveedor.id, // puedes mantener esto o usar this.form.getRawValue().proveedorId
    solicitanteId: this.pedidoOriginal.solicitanteId,
    items: itemsFormRaw.map((item: any) => ({
      id: item.id ?? null,
      // enviar el id correcto: si existe subcategoria usarla, si no la categoria principal
      categoriaId: item.subcategoriaId ?? item.categoriaId,
      nombreMaterial: item.nombreMaterial,
      cantidad: item.cantidad,
      cantidadTotal: item.cantidadTotal,
      unidadMedida: item.unidadMedida,          // ahora estará presente
      unidadPresentacion: item.unidadPresentacion, // ahora estará presente
      color: item.color
    }))
  };

    console.log('DTO a enviar:', pedidoActualizado);

    this.isLoading = true;
    this.pedidoProveedorService.actualizarPedido(this.pedidoId, pedidoActualizado)
      .pipe(take(1))
      .subscribe({
        next: res => {
          this.snackBar.open('Pedido actualizado correctamente', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(res);
          this.isLoading = false;
        },
        error: err => {
          const mensajeError = err.error?.message || err.error || 'Error al actualizar pedido';
          this.snackBar.open(mensajeError, 'Cerrar', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }


  private cargarDatosDelPedido(pedido: PedidoProveedorResponseDTO): void {
    this.pedidoId = pedido.id;
    this.proveedorNombreEmpresa = pedido.proveedor.nombre || pedido.proveedor.nombreEmpresa || '';
    this.form.patchValue({ fecha: pedido.fecha, proveedorId: pedido.proveedor.id });
    this.items.clear();

    // Creamos un arreglo de observables para cada ítem del pedido
    const itemDataObservables = pedido.items.map(item => {
      const categoriaId = item.categoriaId;
      // 1. Obtenemos el ID del padre (si existe)
      return this.categoriaService.getParentId(categoriaId).pipe(
        switchMap(parentId => {
          if (parentId) {
            // 2. Si es subcategoría, obtenemos las subcategorías hermanas
            return this.categoriaService.listarSubcategorias(parentId).pipe(
              take(1),
              // Devolvemos los datos del ítem junto con las subcategorías para el formulario
              switchMap(subcategorias => of({
                item,
                parentId,
                subcategorias,
                isSubcategoria: true
              }))
            );
          } else {
            // Si es categoría principal, solo devolvemos los datos del ítem
            return of({
              item,
              parentId: null,
              subcategorias: [],
              isSubcategoria: false
            });
          }
        })
      );
    });

    // Usamos forkJoin para ejecutar todas las llamadas en paralelo
    forkJoin(itemDataObservables).pipe(take(1)).subscribe({
      next: (results) => {
        results.forEach((result, index) => {
          // Se crea el grupo de formulario para cada ítem
          const itemGroup = this.fb.group({
            id: [result.item.id],
            nombreMaterial: [result.item.nombreMaterial, Validators.required],
            cantidad: [result.item.cantidad, [Validators.required, Validators.min(1)]],
            cantidadTotal: [result.item.cantidadTotal, [Validators.required, Validators.min(0.1)]],
            unidadPresentacion: [{ value: result.item.unidadPresentacion, disabled: true }, Validators.required],
            unidadMedida: [{ value: result.item.unidadMedida, disabled: true }, Validators.required],
            color: [result.item.color],
            categoriaId: [result.isSubcategoria ? result.parentId : result.item.categoriaId, Validators.required],
            subcategoriaId: [result.isSubcategoria ? result.item.categoriaId : null]
          });

          // Se asignan las subcategorías disponibles para este ítem
          this.subcategoriasPorItem[index] = result.subcategorias;

          this.items.push(itemGroup);
        });
        console.log("✅ Pedido cargado y formulario inicializado correctamente.");
      },
      error: (err) => {
        console.error("Error al cargar datos del pedido:", err);
        this.snackBar.open('Error al cargar datos del pedido.', 'Cerrar', { duration: 4000 });
      }
    });
  }
  getNombreCategoriaPadre(itemIndex: number): string {
    const item = this.items.at(itemIndex);
    if (!item) return '';
    const categoriaId = item.get('categoriaId')?.value;
    const categoria = this.categoriasDisponibles.find(c => c.id === categoriaId);
    return categoria?.nombre || 'Categoría Principal';
  }

  cancelar(): void { this.dialogRef.close(); }

  fechaNoFuturaValidator(control: AbstractControl): { [key: string]: any } | null {
    const fecha = new Date(control.value);
    return fecha > new Date() ? { fechaFutura: true } : null;
  }
}
