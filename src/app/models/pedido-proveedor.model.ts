import { CategoriaInventario } from "./categoriaInventario.model";
import { ItemPedidoDTO } from "./items.model";
import { Proveedor } from "./proveedor.model";
import { Usuario } from "./Usuario.model";

export interface PedidoProveedorDTO {
  proveedorId: number;
  solicitanteId: number;
  fecha: string;
  items: ItemPedidoDTO[];
}

export interface PedidoProveedorResponseDTO {
  id: number;
  fecha: string;
  proveedor: Proveedor;
  // Rompemos la referencia circular.
  solicitanteId: number;
  solicitanteNombre: string;
  items: ItemPedidoDTO[];
}
