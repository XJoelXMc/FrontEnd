import { Component, OnInit, OnDestroy } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Categoria } from '../../../models/categoria.enum';
import { ModeloService } from '../../../services/modelos.service';
import { ModeloDialogComponent } from '../modelo-dialog/modelo-dialog.component';
import { ModeloDTO } from '../../../models/modelo.dto';
import { Modelo } from '../../../models/modelos.model';

@Component({
  selector: 'app-gestion-de-ventas',
  templateUrl: './gestion-de-ventas.component.html',
  styleUrls: ['./gestion-de-ventas.component.scss']
})
export class GestionDeVentasComponent implements OnInit, OnDestroy {
  rolUsuario = '';
  categorias = [
    { titulo: 'Modelo camisetas de básquet', imagen: 'assets/KOBE.jpg', categoria: Categoria.BASQUET},
    { titulo: 'Modelo camisetas de fútbol', imagen: 'assets/Futbol.jpg', categoria: Categoria.FUTBOL },
    { titulo: 'Modelo de camperas', imagen: 'assets/campera.jpg', categoria: Categoria.CAMPERA },
    { titulo: 'Modelo de conjuntos', imagen: 'assets/conjunto.jpg', categoria: Categoria.CONJUNTO },
    { titulo: 'Modelos de camisetas polo', imagen: 'assets/polo.jpg', categoria: Categoria.CAMISETA_POLO }
  ];
  categoriaSeleccionada: any = null;
  subscription: any;

  constructor(
    private modeloSvc: ModeloService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.rolUsuario = localStorage.getItem('rol') || '';
  }

  seleccionarCategoria(cat: any) {
    this.categoriaSeleccionada = { ...cat, modelos: [] };
    this.subscription = this.modeloSvc.getPorCategoria(cat.categoria).subscribe(data => {
      this.categoriaSeleccionada.modelos = data;
    });
  }

  isAdminOrOwner() {
    return this.rolUsuario === 'ADMINISTRADOR' || this.rolUsuario === 'DUENO';
  }

  descargarImagen(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop() || 'imagen.jpg';
    a.click();
  }

  abrirDialogo() {
  const dialogRef = this.dialog.open(ModeloDialogComponent, {
    width: '500px',
    data: {
      categoria: this.categoriaSeleccionada.categoria,
      modelosExistentes: this.categoriaSeleccionada.modelos // ← para validación local
    }
  });

  dialogRef.afterClosed().subscribe((dto: ModeloDTO) => {
    if (dto) {
      this.modeloSvc.crear(dto).subscribe({
        next: () => this.seleccionarCategoria(this.categoriaSeleccionada),
        error: (err) => {
          if (err.status === 409) {
            this.dialog.open(ModeloDialogComponent, {
              width: '500px',
              data: {
                ...dto,
                errorMensaje: err.error,
                modelosExistentes: this.categoriaSeleccionada.modelos
              }
            });
          }
        }
      });
    }
  });
}


  editarModelo(modelo: Modelo) {
    const dialogRef = this.dialog.open(ModeloDialogComponent, {
      width: '400px',
      data: modelo
    });
    dialogRef.afterClosed().subscribe((dto: ModeloDTO) => {
      if (dto) {
        this.modeloSvc.actualizar(modelo.id, dto)
          .subscribe(() => this.seleccionarCategoria(this.categoriaSeleccionada));
      }
    });
  }

  eliminarModelo(id: number) {
    this.modeloSvc.eliminar(id).subscribe(() => this.seleccionarCategoria(this.categoriaSeleccionada));
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
