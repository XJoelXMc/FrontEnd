// ==========================================
// 1. DTOs PARA EL DISEÑADOR (Personalización)
// ==========================================

// --- LO QUE RECIBIMOS DEL BACKEND (GET /preparar-personalizacion) ---
export interface DatosPersonalizacionDTO {
  cotizacionId: number;
  nombrePack: string;
  moldes: MoldeVisualDTO[];
  cuello: CuelloVisualDTO | null;
  desgloseTallas: TallaCantidadDTO[];

  // ✅ NUEVOS CAMPOS PARA RECUPERACIÓN DE DATOS
  // Son opcionales (?) porque si es un pedido nuevo, vendrán nulos o vacíos.
  logosGuardados?: LogoPosicionDTO[];     
  jugadoresGuardados?: JugadorDetalleDTO[];
}

export interface MoldeVisualDTO {
  id: number;
  nombre: string;
  tipoParte: string; // 'SUPERIOR', 'INFERIOR', etc.
  urlsImagenes: string[]; // Lista de URLs (Frente, Espalda, etc.)
}

export interface CuelloVisualDTO {
  id: number;
  nombre: string;
  urlImagen: string;
}

export interface TallaCantidadDTO {
  talla: string;
  cantidad: number;
}

// --- LO QUE ENVIAMOS AL BACKEND (POST /crear-pedido) ---
export interface CrearPedidoDTO {
  cotizacionId: number;
  posicionesLogos: LogoPosicionDTO[];
  listaJugadores: JugadorDetalleDTO[];
}

export interface LogoPosicionDTO {
  moldeId: number;
  nombreImagen: string; // Para saber si es "Frente" o "Espalda"
  logoUrl: string;      // URL de Cloudinary
  x: number;
  y: number;
  ancho: number;        // Opcional, por defecto 100
}

export interface JugadorDetalleDTO {
  talla: string;
  nombre: string;
  numero: string;
}

// ==========================================
// 2. DTOs PARA EL CONTROL DE PEDIDOS (Dashboard)
// ==========================================

/**
 * ✅ NUEVO: DTO para el resumen que ve el Cliente y el Admin.
 * Se usa en ControlarPedidoService.
 */
export interface ResumenPedidoDTO {
  idPedido?: number;       // Puede ser null si solo es cotización
  cotizacionId: number;    // Siempre existe
  codigo: string;          // El código visible (COT-XY123)
  clienteNombre: string;
  packNombre: string;
  total: number;
  estado: string;          // 'PENDIENTE', 'COMPLETADA', 'EN_PRODUCCION'
  tienePersonalizacion: boolean; // true = Ya existe pedido, false = Solo cotización
  fecha: string;           // ISO Date String
  cantidadPrendas?: number; // Opcional, para vista de admin
}