import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { AdminConfigService } from '../../../../services/admin-config.service';
import { DatosCreacionPackDTO, MoldeResponseDTO, UnidadMedida, DetalleMoldeTallaDTO, PiezaMoldeDTO, TipoPieza } from '../../../../models/admin-config.models';
import { ImageGalleryDialogComponent } from '../../galery-dialog/image-gallery-dialog/image-gallery-dialog.component';

@Component({
  selector: 'app-molde-manager',
  templateUrl: './molde-manager.component.html',
  styleUrls: ['./molde-manager.component.scss']
})
export class MoldeManagerComponent implements OnInit {
  datos: DatosCreacionPackDTO | null = null;
  moldes: MoldeResponseDTO[] = [];
  moldeForm: FormGroup;
  moldeEnEdicionId: number | null = null;
  loading = false;

  previewUrls: string[] = [];
  selectedFiles: File[] = [];
  imagenesParaEliminar: string[] = [];
  isDragActive = false;

  unidadesMedida = Object.values(UnidadMedida);

  constructor(
    private fb: FormBuilder,
    private adminConfigService: AdminConfigService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.moldeForm = this.fb.group({
      nombre: ['', Validators.required],
      gamaTelaId: [null, Validators.required],
      tipoParte: ['SUPERIOR', Validators.required],
      llevaMangas: [true, Validators.required],
      detallesTalla: this.fb.array([], Validators.minLength(1))
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.onFormChanges();
  }

  get detallesTalla(): FormArray {
    return this.moldeForm.get('detallesTalla') as FormArray;
  }

  // En: molde-manager.component.ts

onFormChanges(): void {
  // Escuchamos los cambios del radio button
  this.moldeForm.get('tipoParte')?.valueChanges.subscribe(nuevoTipoDePrenda => {
    
    // ✨ LÍNEA CLAVE AÑADIDA ✨
    // Aquí sincronizamos el valor de 'tipoParte' con el del control que sí cambia.
    this.moldeForm.get('tipoParte')?.setValue(nuevoTipoDePrenda);

    // Tu lógica existente para limpiar las tallas
    if (this.detallesTalla.length > 0) {
      this.detallesTalla.clear();
      this.showNotification('El tipo de prenda cambió. Por favor, añada las tallas de nuevo.', 'info');
    }
  });

  // El resto de tu función...
  this.moldeForm.get('llevaMangas')?.valueChanges.subscribe(llevaMangas => {
    // ... tu lógica de mangas ...
  });
}

  loadInitialData(): void {
    this.adminConfigService.getDatosParaCreacion().subscribe(data => this.datos = data);
    this.adminConfigService.getAllMoldes().subscribe(moldes => this.moldes = moldes);
  }

  createPiezaGroup(piezaData: Partial<PiezaMoldeDTO>): FormGroup {
    return this.fb.group({
      nombrePieza: [piezaData.nombrePieza],
      tipoPieza: [piezaData.tipoPieza],
      ancho: [piezaData.ancho || null, [Validators.required, Validators.min(0.1)]],
      alto: [piezaData.alto || null, [Validators.required, Validators.min(0.1)]],
      margen: [piezaData.margen || 1.5, [Validators.required, Validators.min(0)]]
    });
  }

  addTalla(): void {
    const tipo = this.moldeForm.get('tipoParte')?.value;
    const mangas = this.moldeForm.get('llevaMangas')?.value;

    const nuevaTallaGroup = this.fb.group({
      talla: ['', Validators.required],
      unidadMedida: [UnidadMedida.CM, Validators.required],
      piezas: this.fb.array([])
    });

    const piezasArray = nuevaTallaGroup.get('piezas') as FormArray;

    if (tipo === 'SUPERIOR') {
      piezasArray.push(this.createPiezaGroup({ nombrePieza: 'Cara Delantera', tipoPieza: TipoPieza.DELANTERA }));
      piezasArray.push(this.createPiezaGroup({ nombrePieza: 'Cara Trasera', tipoPieza: TipoPieza.TRASERA }));
      piezasArray.push(this.createPiezaGroup({ nombrePieza: 'Manga', tipoPieza: TipoPieza.MANGA }));
    } else if (tipo === 'INFERIOR') {
      piezasArray.push(this.createPiezaGroup({ nombrePieza: 'Pierna', tipoPieza: TipoPieza.PIERNA }));
    }

    this.detallesTalla.push(nuevaTallaGroup);

    if (tipo === 'SUPERIOR' && !mangas) {
      const mangaGroup = piezasArray.controls.find(p => p.get('tipoPieza')?.value === TipoPieza.MANGA);
      mangaGroup?.get('ancho')?.disable();
      mangaGroup?.get('alto')?.disable();
      mangaGroup?.get('margen')?.disable();
    }
  }

  removeTalla(index: number): void {
    this.detallesTalla.removeAt(index);
  }

  getPiezas(tallaIndex: number): FormArray {
    return this.detallesTalla.at(tallaIndex).get('piezas') as FormArray;
  }

  editarMolde(molde: MoldeResponseDTO): void {
    this.moldeEnEdicionId = molde.id ?? null;
    const primerDetalle = molde.consumoPorTalla[0];

    let tipoDePrenda = 'SUPERIOR';
    let llevaMangas = false;
    if (primerDetalle?.piezas.some(p => p.tipoPieza === TipoPieza.PIERNA)) {
      tipoDePrenda = 'INFERIOR';
    }
    if (primerDetalle?.piezas.some(p => p.tipoPieza === TipoPieza.MANGA)) {
      llevaMangas = true;
    }

    this.moldeForm.patchValue({
      nombre: molde.nombre,
      gamaTelaId: molde.gamaTelaId,
      tipoParte: molde.tipoParte, // 👈 Carga el valor desde backend
      tipoDePrenda: tipoDePrenda,
      llevaMangas: llevaMangas
    });

    this.detallesTalla.clear();
    molde.consumoPorTalla.forEach(detalle => {
      const tallaGroup = this.fb.group({
        talla: [detalle.talla, Validators.required],
        unidadMedida: [detalle.unidadMedida, Validators.required],
        piezas: this.fb.array([])
      });
      const piezasArray = tallaGroup.get('piezas') as FormArray;
      detalle.piezas.forEach(pieza => {
        const piezaGroup = this.createPiezaGroup(pieza);
        if (pieza.tipoPieza === TipoPieza.MANGA && !llevaMangas) {
          piezaGroup.get('ancho')?.disable();
          piezaGroup.get('alto')?.disable();
          piezaGroup.get('margen')?.disable();
        }
        piezasArray.push(piezaGroup);
      });
      this.detallesTalla.push(tallaGroup);
    });

    this.previewUrls = [...molde.urlsImagenes];
    this.selectedFiles = [];
    this.imagenesParaEliminar = [];
    document.querySelector('.form-panel')?.scrollIntoView({ behavior: 'smooth' });
  }

  guardarMolde(): void {
    this.moldeForm.markAllAsTouched();
    if (this.moldeForm.invalid) {
      this.showNotification('Por favor, complete todos los campos requeridos.', 'error');
      return;
    }
    if (this.previewUrls.length === 0) {
      this.showNotification('Debe agregar al menos una imagen del molde.', 'error');
      return;
    }

    this.loading = true;
    const formData = new FormData();
    const formValue = this.moldeForm.getRawValue();

    formData.append('nombre', formValue.nombre);
    formData.append('gamaTelaId', formValue.gamaTelaId.toString());
    formData.append('tipoParte', formValue.tipoParte); // 👈 Nuevo campo al backend
    

    const consumoPorTallaParaEnviar = formValue.detallesTalla.map((detalle: any) => {
      const piezasFiltradas = detalle.piezas.filter((pieza: any) => {
        return pieza.tipoPieza !== TipoPieza.MANGA || formValue.llevaMangas;
      });

      return {
        talla: detalle.talla,
        unidadMedida: detalle.unidadMedida,
        piezas: piezasFiltradas.map((pieza: any) => ({
          ...pieza,
          unidadMedida: detalle.unidadMedida
        }))
      };
    });

    formData.append('consumoPorTalla', JSON.stringify(consumoPorTallaParaEnviar));

    const esEdicion = !!this.moldeEnEdicionId;
    let operation: Observable<any>;

    if (esEdicion) {
      this.selectedFiles.forEach(file => formData.append('nuevasImagenes', file));
      this.imagenesParaEliminar.forEach(url => formData.append('imagenesAEliminar', url));
      operation = this.adminConfigService.updateMolde(this.moldeEnEdicionId!, formData);
    } else {
      this.selectedFiles.forEach(file => formData.append('imagenes', file));
      operation = this.adminConfigService.createMolde(formData);
    }

    operation.subscribe({
      next: () => {
        this.showNotification(`Molde ${esEdicion ? 'actualizado' : 'creado'} correctamente.`, 'success');
        this.resetForm();
        this.loadInitialData();
      },
      error: (err) => this.showNotification(err.error?.message || 'Error al procesar la solicitud.', 'error'),
      complete: () => this.loading = false
    });
  }

  resetForm(): void {
    this.moldeForm.reset({
      nombre: '',
      gamaTelaId: null,
      tipoParte: 'SUPERIOR', // 👈 Valor por defecto
      llevaMangas: true
    });
    this.detallesTalla.clear();
    this.moldeEnEdicionId = null;
    this.previewUrls = [];
    this.selectedFiles = [];
    this.imagenesParaEliminar = [];
  }

  // --- Gestión de imágenes ---
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    if (this.previewUrls.length + files.length > 4) {
      this.showNotification('No se pueden subir más de 4 imágenes en total.', 'error');
      return;
    }
    this.selectedFiles.push(...files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrls.push(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  onDragOver(event: DragEvent) { event.preventDefault(); this.isDragActive = true; }
  onDragLeave(event: DragEvent) { event.preventDefault(); this.isDragActive = false; }
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragActive = false;
    if (event.dataTransfer?.files) {
      const pseudoEvent = { target: { files: event.dataTransfer.files } } as unknown as Event;
      this.onFileSelected(pseudoEvent);
    }
  }

  removerImagen(url: string, index: number): void {
    const originalUrl = this.moldeEnEdicionId ? (this.moldes.find(m => m.id === this.moldeEnEdicionId)?.urlsImagenes.includes(url)) : false;
    if (originalUrl) this.imagenesParaEliminar.push(url);
    this.previewUrls.splice(index, 1);
  }

  eliminarMolde(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este molde?')) return;
    this.adminConfigService.deleteMolde(id).subscribe({
      next: () => {
        this.showNotification('Molde eliminado correctamente.', 'success');
        this.loadInitialData();
      },
      error: (err) => this.showNotification(err.error?.message || 'Error al eliminar el molde.', 'error')
    });
  }

  visualizarImagenes(molde: MoldeResponseDTO): void {
    this.dialog.open(ImageGalleryDialogComponent, {
      width: '80vw',
      maxWidth: '900px',
      panelClass: 'image-gallery-dialog',
      data: {
        nombreMolde: molde.nombre,
        imagenes: molde.urlsImagenes
      }
    });
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    const panelClass = type === 'success' ? 'notification-success' : type === 'error' ? 'notification-error' : 'notification-info';
    this.snackBar.open(message, 'Cerrar', { duration: 4000, panelClass: [panelClass] });
  }
}
