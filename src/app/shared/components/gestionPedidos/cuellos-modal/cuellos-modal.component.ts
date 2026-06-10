import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Cuello } from '../../../../models/cuello.model';
import { CuelloService } from '../../../../services/cuello.service';

@Component({
  selector: 'app-cuellos-modal',
  templateUrl: './cuellos-modal.component.html',
  styleUrl: './cuellos-modal.component.scss'
})
export class CuellosModalComponent implements OnInit{

  form: FormGroup;
  modoEdicion: boolean;
  imagenesExistentes: string[] = [];
  nuevasImagenes: File[] = [];
  previews: string[] = [];
  imagenesAEliminar: string[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CuellosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Cuello | null,
    private cuelloService: CuelloService,
    private snackBar: MatSnackBar
  ) {
    this.modoEdicion = !!this.data;
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      precio: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.modoEdicion && this.data) {
      this.form.patchValue(this.data);
      this.imagenesExistentes = [...this.data.urlsImagenes];
      this.previews = [...this.data.urlsImagenes];
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        this.nuevasImagenes.push(file);
        const reader = new FileReader();
        reader.onload = () => this.previews.push(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  }

  removerPreview(index: number): void {
    const previewUrl = this.previews[index];
    
    // Verificar si es una imagen existente o una nueva
    if (this.imagenesExistentes.includes(previewUrl)) {
      this.imagenesAEliminar.push(previewUrl);
      this.imagenesExistentes = this.imagenesExistentes.filter(url => url !== previewUrl);
    } else {
      const newImageIndex = this.previews.indexOf(previewUrl) - this.imagenesExistentes.length;
      if(newImageIndex >= 0) {
        this.nuevasImagenes.splice(newImageIndex, 1);
      }
    }
    
    this.previews.splice(index, 1);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    formData.append('nombre', this.form.get('nombre')?.value);
    formData.append('precio', this.form.get('precio')?.value);

    this.nuevasImagenes.forEach(file => formData.append('nuevasImagenes', file));
    this.imagenesAEliminar.forEach(url => formData.append('imagenesAEliminar', url));
    
    if (this.modoEdicion && this.data) {
      // Modo Edición
      formData.delete('imagenes'); // Remove old key if present
      this.nuevasImagenes.forEach(file => formData.append('nuevasImagenes', file));
      this.imagenesAEliminar.forEach(url => formData.append('imagenesAEliminar', url));
      
      this.cuelloService.updateCuello(this.data.id, formData).subscribe(this.handleResponse);
    } else {
      // Modo Creación
      this.nuevasImagenes.forEach(file => formData.append('imagenes', file));
      this.cuelloService.createCuello(formData).subscribe(this.handleResponse);
    }
  }
  
  private handleResponse = {
    next: (res: any) => {
      this.isLoading = false;
      this.mostrarMensaje(`Cuello ${this.modoEdicion ? 'actualizado' : 'creado'} exitosamente.`);
      this.dialogRef.close(res);
    },
    error: (err: any) => {
      this.isLoading = false;
      this.mostrarError(`Error al ${this.modoEdicion ? 'actualizar' : 'crear'} el cuello.`);
      console.error(err);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000
    });
  }

  private mostrarError(error: string): void {
    this.snackBar.open(error, 'Cerrar', {
      duration: 4000
    });
  }

}
