import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Proveedor } from '../../../models/proveedor.model';
import { ProveedorService } from '../../../services/proveedor.service';
import { ProveedorFormModalComponent } from './proveedor-form-modal/proveedor-form-modal.component';
import { GestionarPedidosComponent } from './gestionar-pedidos/gestionar-pedidos.component';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-gestion-proveedores',
  templateUrl: './gestion-proveedores.component.html',
  styleUrls: ['./gestion-proveedores.component.scss']
})
export class GestionProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  dataSource = new MatTableDataSource<Proveedor>();
  // ✨ CORRECCIÓN: 'categorias' se ha cambiado por 'materiales'
  columnas: string[] = ['nombre', 'nombreEmpresa', 'materiales', 'contacto', 'acciones'];
// ✨ NUEVO: Decorador para obtener una referencia al 'ng-template' en el HTML
  @ViewChild('confirmacionEliminarModal') confirmacionEliminarModal!: TemplateRef<any>;
  constructor(
    private proveedorService: ProveedorService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.obtenerProveedores();
  }

  obtenerProveedores(): void {
    this.proveedorService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.dataSource.data = data;
      },
      error: () => {
        this.mostrarError('Error al cargar los proveedores.');
      }
    });
  }

  abrirModalAgregar(): void {
    const dialogRef = this.dialog.open(ProveedorFormModalComponent, {
      width: '600px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.proveedorService.crearProveedor(result).subscribe({
          next: () => {
            this.obtenerProveedores();
            this.mostrarMensaje('Proveedor creado exitosamente.');
          },
          error: (err) => {
            this.mostrarError(err.error?.message || 'Error al crear proveedor.');
          }
        });
      }
    });
  }

  abrirModalEditar(proveedor: Proveedor): void {
    const dialogRef = this.dialog.open(ProveedorFormModalComponent, {
      width: '600px',
      data: proveedor
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.proveedorService.actualizarProveedor(proveedor.id!, result).subscribe({
          next: () => {
            this.obtenerProveedores();
            this.mostrarMensaje('Proveedor actualizado correctamente.');
          },
          error: (err) => {
            this.mostrarError(err.error?.message || 'Error al actualizar proveedor.');
          }
        });
      }
    });
  }
  getMaterialesString(proveedor: Proveedor): string {
    return proveedor.categoriasOfrecidas?.map(c => c.nombre).join(', ') || '';
  }
  /**
   * Elimina un proveedor después de la confirmación.
   * Ahora usa un `ng-template` definido en el mismo HTML.
   */
   
  eliminarProveedor(id: number): void {
    // ✨ CORRECCIÓN: Se abre el 'ng-template' con la referencia obtenida por @ViewChild
    const dialogRef = this.dialog.open(this.confirmacionEliminarModal, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(confirmacion => {
      if (confirmacion) {
        this.proveedorService.eliminarProveedor(id).subscribe({
          next: () => {
            this.obtenerProveedores();
            this.mostrarMensaje('Proveedor eliminado.');
          },
          error: (err) => {
            this.mostrarError(err.error?.message || 'Error al eliminar proveedor.');
          }
        });
      }
    });
  }

  abrirGestionPedidos(): void {
    this.dialog.open(GestionarPedidosComponent, {
      width: '800px'
    });
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }

  private mostrarError(error: string): void {
    this.snackBar.open(error, 'Cerrar', {
      duration: 4000,
      panelClass: ['snackbar-error']
    });
  }
}
