// src/app/models/categoriaInventario.model.ts
export interface CategoriaInventario {
  id?: number;
  nombre: string;
  descripcion: string;
  imagen?: string;
  parent_id?: number | null;   // relación con categoría padre
  proveedorIds?: number[];     // relación con proveedores
}
