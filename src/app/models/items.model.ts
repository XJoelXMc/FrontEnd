export interface ItemPedidoDTO {
  id?: number;                  // Puede ser opcional al crear un nuevo ítem
  categoriaId: number;           // ID de la categoría o subcategoría
  nombreMaterial: string;        // Nombre del material
  cantidad: number;              // Cantidad de unidades
  unidadPresentacion?: string;   // Rollo(s), paquete(s), etc.
  cantidadTotal?: number;        // Cantidad total en la unidad de medida
  unidadMedida?: string;         // mts, kg, litros, etc.
  color?: string;                // Color en hex
}