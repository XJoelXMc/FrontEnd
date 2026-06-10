// src/app/models/modelo.dto.ts

import { Categoria } from "./categoria.enum";
export interface ModeloDTO {
  id?: number;
  nombre: string;
  imagenUrl: string;
  categoria: Categoria;
}

