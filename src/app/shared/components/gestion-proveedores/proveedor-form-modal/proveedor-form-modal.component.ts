import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Proveedor } from '../../../../models/proveedor.model';
import { CategoriaInventario } from '../../../../models/categoriaInventario.model';
import { CategoriaService } from '../../../../services/categoria.service';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-proveedor-form-modal',
  templateUrl: './proveedor-form-modal.component.html',
  styleUrls: ['./proveedor-form-modal.component.scss'],
})
export class ProveedorFormModalComponent implements OnInit {
  proveedorForm!: FormGroup;
  modoEdicion = false;
  categoriasDisponibles: CategoriaInventario[] = [];
  cargandoCategorias = true;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProveedorFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Proveedor | null,
    private categoriaService: CategoriaService,
    private snackBar: MatSnackBar
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.proveedorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      nombreEmpresa: ['', [Validators.required]],
      contacto: ['', [Validators.required]],
      direccion: [''],
      imagenUrl: [''],
      categoriasOfrecidasIds: [[], Validators.required]
    });

    if (this.data) {
      this.modoEdicion = true;
      this.proveedorForm.patchValue(this.data);
      // Mapeamos las categorías a sus IDs para inicializar el select
      if (this.data.categoriasOfrecidas) {
        this.proveedorForm.get('categoriasOfrecidasIds')?.setValue(this.data.categoriasOfrecidas.map(c => c.id));
      }
    }
    
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.cargandoCategorias = true;
    this.categoriaService.listarPrincipales().pipe(
      switchMap((principales: CategoriaInventario[]) => {
        const subcategoriaObservables = principales
          .filter(principal => principal.id !== undefined) // Filtramos los que no tienen ID
          .map(principal =>
            this.categoriaService.listarSubcategorias(principal.id!).pipe(
              map(subcategorias => ({ principal, subcategorias })),
              catchError(() => of({ principal, subcategorias: [] }))
            )
          );

        if (subcategoriaObservables.length === 0) {
          return of({ principales, resultados: [] });
        }
        
        return forkJoin(subcategoriaObservables).pipe(
          map(resultados => ({ principales, resultados }))
        );
      })
    ).subscribe({
      next: ({ principales, resultados }) => {
        let categoriasCompletas: CategoriaInventario[] = [];
        
        principales.forEach(p => {
          categoriasCompletas.push({
            ...p,
            nombre: `${p.nombre} (Principal)`
          });
        });

        resultados.forEach(res => {
          res.subcategorias?.forEach(sub => {
            categoriasCompletas.push({
              ...sub,
              nombre: `${res.principal.nombre} > ${sub.nombre}`
            });
          });
        });

        this.categoriasDisponibles = categoriasCompletas;
        this.cargandoCategorias = false;
      },
      error: (err) => {
        console.error('Error al cargar las categorías:', err);
        this.mostrarError('No se pudieron cargar las categorías.');
        this.cargandoCategorias = false;
      }
    });
  }

  guardar(): void {
    this.proveedorForm.markAllAsTouched();

    if (this.proveedorForm.invalid) {
      return;
    }

    const dto = {
      ...this.proveedorForm.value,
    };

    this.dialogRef.close(dto);
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  private mostrarError(error: string): void {
    this.snackBar.open(error, 'Cerrar', {
      duration: 4000,
      panelClass: ['snackbar-error']
    });
  }
}
