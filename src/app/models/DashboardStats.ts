export interface DashboardStatsDTO {
  porcentajeEntregasATiempo: number;
  tasaErroresPersonalizacion: number;
  topDisenos: TopDisenoDTO[];
  flujoProduccion: { [key: string]: number }; // Mapa ej: { "CORTE": 5, "DISEÑO": 2 }
  estadoStock: StockMaterialDTO[];
}

export interface TopDisenoDTO {
  nombrePack: string;
  cantidadVendida: number;
}

export interface StockMaterialDTO {
  nombreMaterial: string;
  estado: 'LOW_STOCK' | 'SUFFICIENT';
  cantidad: number; // ✅ Nuevo campo
}
export interface SankeyLinkDTO {
  from: string;   // Origen
  to: string;     // Destino
  weight: number; // Cantidad
}
export interface DashboardCompleto extends DashboardStatsDTO {
  flujoSankey?: SankeyLinkDTO[];
}
