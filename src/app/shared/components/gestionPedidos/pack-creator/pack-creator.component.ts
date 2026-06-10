import { Component, OnInit } from '@angular/core';
import { AdminConfigService } from '../../../../services/admin-config.service';
import { DatosCreacionPackDTO, PackCreacionDTO } from '../../../../models/admin-config.models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pack-creator',
  templateUrl: './pack-creator.component.html',
  styleUrls: ['./pack-creator.component.scss']
})
export class PackCreatorComponent implements OnInit {

  datos: DatosCreacionPackDTO | null = null;
  loading = false;

  // ✨ Actualizado: ahora incluye el campo "precio"
  packRequest: PackCreacionDTO = {
  nombre: '',
  descripcion: '',
  precio: 0,
  moldeIds: [],
  incluyeParteSuperior: false,
  incluyeParteInferior: false,
  parteSuperiorSublimada: false,
  parteInferiorSublimada: false
};


  constructor(
    private adminConfigService: AdminConfigService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.adminConfigService.getDatosParaCreacion().subscribe({
      next: data => this.datos = data,
      error: () => this.snackBar.open('Error al cargar los moldes disponibles.', 'Cerrar', { duration: 3000 })
    });
  }

  // ✅ Selección visual de moldes
  toggleMoldeSelection(moldeId: number): void {
    const index = this.packRequest.moldeIds.indexOf(moldeId);
    if (index > -1) {
      this.packRequest.moldeIds.splice(index, 1);
    } else {
      this.packRequest.moldeIds.push(moldeId);
    }
  }

  isMoldeSelected(moldeId: number): boolean {
    return this.packRequest.moldeIds.includes(moldeId);
  }

  // ✅ Validación del formulario
  isFormValid(): boolean {
    const hasNombre = this.packRequest.nombre.trim() !== '';
    const hasMoldes = this.packRequest.moldeIds.length > 0;
    const hasPrecio = this.packRequest.precio > 0;
    return hasNombre && hasMoldes && hasPrecio;
  }

  private resetForm(): void {
  this.packRequest = {
    nombre: '',
    descripcion: '',
    precio: 0,
    moldeIds: [],
    incluyeParteSuperior: false,
    incluyeParteInferior: false,
    parteSuperiorSublimada: false,
    parteInferiorSublimada: false
  };
}


  crearPack(): void {
    if (!this.isFormValid()) {
      this.snackBar.open('Complete el nombre, precio y seleccione al menos un molde.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.adminConfigService.createPack(this.packRequest).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open(`Pack "${this.packRequest.nombre}" creado exitosamente.`, 'OK', { duration: 3000 });
        this.resetForm();
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Error al crear el pack.', 'Cerrar', { duration: 4000 });
      }
    });
  }
}
