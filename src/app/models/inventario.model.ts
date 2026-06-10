// src/app/models/inventario.model.ts

import { CategoriaInventario } from './categoriaInventario.model';

export interface InventarioModel {
  id: number;
  nombreMaterial: string; // ✨ CAMBIO: Ahora se llama nombreMaterial, como en el backend
  cantidadDisponible: number;
  unidad: string; // Ej: mts, lts, uds
  descripcion?: string;
  color?: string;
  categoria: CategoriaInventario; // ✨ CAMBIO: Incluimos la relación con la categoría completa
}