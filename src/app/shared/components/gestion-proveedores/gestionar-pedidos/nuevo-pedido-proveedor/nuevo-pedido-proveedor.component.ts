import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProveedorService } from '../../../../../services/proveedor.service';
import { Proveedor } from '../../../../../models/proveedor.model';
import { getUserIdFromToken } from '../../../../../Utils/jwt.utils';
import { PedidoProveedorDTO } from '../../../../../models/pedido-proveedor.model';
import { CategoriaInventario } from '../../../../../models/categoriaInventario.model';
import { CategoriaService } from '../../../../../services/categoria.service';
import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, switchMap, forkJoin, map, catchError, Subscription, takeUntil, Subject, take } from 'rxjs';

@Component({
  selector: 'app-nuevo-pedido-proveedor',
  templateUrl: './nuevo-pedido-proveedor.component.html',
  styleUrls: ['./nuevo-pedido-proveedor.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideInDown', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('staggerFade', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'scale(0.8)' }),
          stagger('50ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('slideInUpStagger', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('shake', [
      transition('* => *', [
        animate('500ms ease-in-out', keyframes([
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
        ]))
      ])
    ]),
    trigger('pulse', [
      transition('* => *', [
        animate('1.5s ease-in-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.05)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class NuevoPedidoProveedorComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  proveedores: Proveedor[] = [];
  allCategorias: CategoriaInventario[] = [];
  categoriasDisponibles: CategoriaInventario[] = [];
  isLoading = false;

  subcategoriasPorItem: CategoriaInventario[][] = [];
  private subscriptions: Subscription[] = [];
  private unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private proveedorService: ProveedorService,
    private categoriaService: CategoriaService,
    private dialogRef: MatDialogRef<NuevoPedidoProveedorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initializeForm();

    forkJoin({
      proveedores: this.loadProveedores(),
      allCategorias: this.loadAllCategorias()
    }).pipe(take(1)).subscribe(() => {
      // Add an item after data is loaded to start with an empty row
      this.agregarItem();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadAllCategorias(): any {
    return this.categoriaService.getCategorias().pipe(
      map((data: CategoriaInventario[]) => {
        this.allCategorias = data;
      }),
      catchError(err => {
        console.error('Error al cargar todas las categorías:', err);
        return of(null);
      })
    );
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      fecha: [new Date(), [Validators.required, this.fechaNoFuturaValidator]],
      proveedorId: [null, Validators.required],
      items: this.fb.array([])
    });

    const proveedorSubscription = this.form.get('proveedorId')?.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(proveedorId => {
      this.items.clear();
      this.subcategoriasPorItem = [];
      this.categoriasDisponibles = [];
      if (proveedorId) {
        const proveedorSeleccionado = this.proveedores.find(p => p.id === proveedorId);
        if (proveedorSeleccionado && proveedorSeleccionado.categoriasOfrecidas) {
          this.categoriasDisponibles = proveedorSeleccionado.categoriasOfrecidas.filter(c => !c.parent_id);
          // Add a new item when a provider is selected
          this.agregarItem();
        }
      }
    });

    if (proveedorSubscription) {
      this.subscriptions.push(proveedorSubscription);
    }
  }

  loadProveedores(): any {
    return this.proveedorService.getProveedores().pipe(
      map(data => {
        this.proveedores = data;
      }),
      catchError(err => {
        console.error('Error al cargar proveedores:', err);
        return of(null);
      })
    );
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  agregarItem(): void {
    const itemGroup = this.fb.group({
      id: [null],
      categoriaId: ['', Validators.required],
      subcategoriaId: [null],
      nombreMaterial: ['', Validators.required],
      cantidad: [null, [Validators.required, Validators.min(1)]],
      unidadPresentacion: ['', Validators.required],
      cantidadTotal: [null, [Validators.required, Validators.min(0.1)]],
      unidadMedida: ['', Validators.required],
      color: ['#000000']
    });

    const categoriaIdControl = itemGroup.get('categoriaId');
    const index = this.items.length;
    this.subcategoriasPorItem[index] = [];

    if (categoriaIdControl) {
      const sub = categoriaIdControl.valueChanges.pipe(
        takeUntil(this.unsubscribe$),
        switchMap(categoriaId => {
          if (categoriaId) {
            itemGroup.get('subcategoriaId')?.setValue(null);
            //OJO CON ESTO DEL ID COMO NUMERO ANTES ESTABA COMO caTEGORIAiD
            const idComoNumero = parseInt(categoriaId, 10);
            return this.categoriaService.listarSubcategorias(idComoNumero).pipe(
              catchError(err => {
                console.error(`Error al cargar subcategorías para la categoría ${idComoNumero}:`, err);
                return of([]);
              })
            );
          } else {
            return of([]);
          }
        })
      ).subscribe(subcategorias => {
        this.subcategoriasPorItem[index] = subcategorias;
      });
      this.subscriptions.push(sub);
    }

    this.items.push(itemGroup);
  }

  eliminarItem(index: number): void {
    this.items.removeAt(index);
    this.subcategoriasPorItem.splice(index, 1);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.items.controls.forEach(control => control.markAllAsTouched());
      console.error('Formulario inválido');
      this.snackBar.open('Error: El formulario contiene errores, por favor revíselo.', 'Cerrar', { duration: 4000 });
      return;
    }

    const formValue = this.form.getRawValue();

    const userId = getUserIdFromToken();
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario');
      this.snackBar.open('Error: No se pudo obtener el ID del usuario.', 'Cerrar', { duration: 4000 });
      return;
    }

    const pedido: PedidoProveedorDTO = {
      fecha: formValue.fecha.toISOString().split('T')[0],
      proveedorId: formValue.proveedorId,
      solicitanteId: userId,
      items: formValue.items.map((item: any) => ({
        id: item.id,
        categoriaId: item.subcategoriaId || item.categoriaId,
        nombreMaterial: item.nombreMaterial,
        cantidad: item.cantidad,
        unidadPresentacion: item.unidadPresentacion,
        cantidadTotal: item.cantidadTotal,
        unidadMedida: item.unidadMedida,
        color: item.color
      }))
    };

    this.dialogRef.close(pedido);
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  fechaNoFuturaValidator(control: AbstractControl): { [key: string]: any } | null {
    const hoy = new Date();
    const fecha = new Date(control.value);
    return fecha > hoy ? { fechaFutura: true } : null;
  }
}
