// src/app/models/modelo.model.ts
import { Categoria } from "./categoria.enum";
export interface Modelo {
  id: number;
  nombre: string;
  imagenUrl: string;
  categoria: Categoria;
  fechaCreacion: string; // tipo string porque viene como ISO desde el backend
}
