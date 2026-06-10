import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Categoria } from '../../../models/categoria.enum';
import { ModeloDTO } from '../../../models/modelo.dto';

@Component({
  selector: 'app-modelo-dialog',
  templateUrl: './modelo-dialog.component.html',
  styleUrls: ['./modelo-dialog.component.scss']  
})
export class ModeloDialogComponent {
  form: FormGroup;
  categorias = Categoria;
  errorDelServidor: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModeloDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.errorDelServidor = data.errorMensaje || null;

    this.form = this.fb.group({
      nombre: [data.nombre || '', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9\s]+$/)
      ]],
      imagenUrl: [data.imagenUrl || '', [
        Validators.required,
        Validators.pattern(/^https:\/\/res\.cloudinary\.com\/.+$/)
      ]],
      categoria: [data.categoria || '', Validators.required]
    });
  }

  imagenYaExiste(): boolean {
    const url = this.form.get('imagenUrl')?.value;
    return this.data.modelosExistentes?.some((m: ModeloDTO) =>
      m.imagenUrl === url && m.id !== this.data.id
    );
  }

  guardar() {
    this.errorDelServidor = null;

    if (this.imagenYaExiste()) {
      this.form.get('imagenUrl')?.setErrors({ duplicada: true });
      return;
    }

    if (this.form.valid) {
      this.dialogRef.close(this.form.value as ModeloDTO);
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}

