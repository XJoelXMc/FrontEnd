import { Cuello } from './cuello.model';

export interface UsuarioInfo {
  id: number;
  email: string;
  rol: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  direccion: string;
  celular: string;
}

export interface PackPublico {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  componentes: { nombre: string; imagenes: string[]; }[];
}

export interface PackDetalle extends PackPublico {
  incluyeParteSuperior: boolean;
  incluyeParteInferior: boolean;
}

export interface TelaInfo {
  id: number;
  nombreMaterial: string;
  color: string;
}

export interface TallaCantidad {
  talla: string;
  cantidad: number;
}

export enum TipoSponsorTecnica {
  SUBLIMADO = "SUBLIMADO",
  DTF = "DTF",
  BORDADO = "BORDADO",
  SIZER = "SIZER",
}

export interface SponsorPayload {
  tecnica: TipoSponsorTecnica;
  descripcion: string;
}

// --- Payload para Enviar al Backend ---

/**
 * Este es el objeto que se envía a la API para crear la cotización.
 * Coincide con tu formulario actual.
 */
export interface CotizacionPayload {
  clienteInfo: { 
    nombre: string; 
    apellido: string;
    email: string; 
    celular: string;
  };
  packId: number;
  cuelloId: number;
  seleccionTelas: {
    superior: { telaSeleccionada: number | null },
    inferior: { telaSeleccionada: number | null }
  };
  tallas: TallaCantidad[];
  sponsors: SponsorPayload[];
  conMangasLargas: boolean;
  conBolsillos: boolean;
}


// --- Modelos para la NUEVA Página de Resumen ---

/**
 * Representa una sola fila en la tabla de desglose.
 */
export interface DesgloseTallaItem {
  talla: string;
  cantidad: number;
  precioUnitario: number; // Precio final (con ajustes de talla)
  subtotal: number;       // precioUnitario * cantidad
}

/**
 * Datos de "solo lectura" para mostrar en el resumen (nombres, etc.)
 */
export interface SeleccionesVisibles {
  packNombre: string;
  packPrecio: number;
  telaSuperior?: string;
  telaInferior?: string;
  cuello?: Cuello;
  conMangasLargas: boolean;
  conBolsillos: boolean;
  sponsors: SponsorPayload[];
}

/**
 * Objeto completo que guardamos en la caché para pasar a la
 * página de resumen.
 */
export interface CotizacionCache {
  payload: CotizacionPayload;       // Los datos crudos para el backend
  selecciones: SeleccionesVisibles; // Los datos bonitos para la UI
  desglosePorTalla: DesgloseTallaItem[]; // La tabla de precios
  totalFinal: number;
}