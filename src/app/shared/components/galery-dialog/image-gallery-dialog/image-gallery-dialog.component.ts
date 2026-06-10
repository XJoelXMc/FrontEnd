import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Interfaz para definir los datos que espera este diálogo
export interface GalleryDialogData {
  nombreMolde: string;
  imagenes: string[];
}

@Component({
  selector: 'app-image-gallery-dialog',
  templateUrl: './image-gallery-dialog.component.html',
  styleUrls: ['./image-gallery-dialog.component.scss']
})
export class ImageGalleryDialogComponent {
  // Inyectamos los datos pasados desde el componente padre
  constructor(
    public dialogRef: MatDialogRef<ImageGalleryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GalleryDialogData
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}
