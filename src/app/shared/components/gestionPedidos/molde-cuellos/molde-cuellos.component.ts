import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CuelloService } from '../../../../services/cuello.service';
import { Cuello } from '../../../../models/cuello.model';
import { CuellosModalComponent } from '../cuellos-modal/cuellos-modal.component';



@Component({
  selector: 'app-molde-cuellos',
  templateUrl: './molde-cuellos.component.html',
  styleUrls: ['./molde-cuellos.component.scss']
})
export class MoldeCuellosComponent implements OnInit {

  dataSource = new MatTableDataSource<Cuello>();
  displayedColumns: string[] = ['nombre', 'precio', 'imagenes', 'acciones'];
  isLoading = true;

  constructor(
    private cuelloService: CuelloService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarCuellos();
  }

  cargarCuellos(): void {
    this.isLoading = true;
    this.cuelloService.getAllCuellos().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.mostrarError('Error al cargar los tipos de cuello.');
        console.error(err);
      }
    });
  }

  abrirModal(cuello?: Cuello): void {
    const dialogRef = this.dialog.open(CuellosModalComponent, {
      width: '500px',
      data: cuello ? { ...cuello } : null, // Enviar una copia para no modificar el original
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarCuellos(); // Recargar la tabla si hubo un cambio
      }
    });
  }

  eliminarCuello(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este tipo de cuello?')) {
      this.cuelloService.deleteCuello(id).subscribe({
        next: () => {
          this.mostrarMensaje('Cuello eliminado exitosamente.');
          this.cargarCuellos();
        },
        error: (err) => {
          this.mostrarError('Error al eliminar el cuello.');
          console.error(err);
        }
      });
    }
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: 'snackbar-success'
    });
  }

  private mostrarError(error: string): void {
    this.snackBar.open(error, 'Cerrar', {
      duration: 4000,
      panelClass: 'snackbar-error'
    });
  }
}
