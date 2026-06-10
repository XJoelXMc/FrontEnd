export enum TipoParte {
  SUPERIOR = 'SUPERIOR',
  INFERIOR = 'INFERIOR'
}
export interface MoldeResponseDTO {
  id?: number;
  nombre: string;
  tipoParte: TipoParte;
  consumoPorTalla: DetalleMoldeTallaDTO[];
  urlsImagenes: string[];
  gamaTelaId: number;
  gamaTelaNombre?: string;
}


export enum UnidadMedida {
    CM = "CM",
    M = "M",
    MM = "MM"
}
export interface DetalleMoldeTallaDTO {
  talla: string;
  unidadMedida: UnidadMedida; // Unidad general para la talla, puede ser un default
  piezas: PiezaMoldeDTO[]; // Array de las piezas para esta talla
  consumoEnMetrosLineales?: number;
}
export enum TipoPieza {
  DELANTERA = "DELANTERA",
  TRASERA = "TRASERA",
  MANGA = "MANGA",
  PIERNA = "PIERNA",
  CUELLO = "CUELLO",
  BOLSILLO = "BOLSILLO",
  OTRO = "OTRO"
}
export interface PiezaMoldeDTO {
  nombrePieza: string;
  tipoPieza: TipoPieza;
  ancho: number;
  alto: number;
  margen: number;
  unidadMedida: UnidadMedida; // La unidad se puede definir por pieza o por talla
}
export interface TelaSimpleDTO {
  id: number;
  nombre: string;
}

export interface GamaTelaDTO {
  id: number;
  nombre: string;
  telas: TelaSimpleDTO[];
}

export interface DatosCreacionPackDTO {
  // ✨ CORRECCIÓN: Ahora usa la interfaz unificada.
  todosLosMoldes: MoldeResponseDTO[];
  todasLasGamasConTelas: GamaTelaDTO[];
}

export interface TelaInventarioDTO {
  id: number;
  nombreMaterial: string;
  color: string;
  cantidadDisponible: number;
  unidad: string;
}

// Interfaces para datos que enviamos al Backend
export interface PackCreacionDTO {
  nombre: string;
  descripcion: string;
  precio: number;
  moldeIds: number[];
  // ✅ Nuevos campos
  incluyeParteSuperior: boolean;
  incluyeParteInferior: boolean;
  parteSuperiorSublimada: boolean;
  parteInferiorSublimada: boolean;
}


