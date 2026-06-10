import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PedidoProveedorResponseDTO } from '../../../../../models/pedido-proveedor.model';

@Component({
  selector: 'app-detalle-pedido-proveedor',
  templateUrl: './detalle-pedido-proveedor.component.html',
  styleUrls: ['./detalle-pedido-proveedor.component.scss']
})
export class DetallePedidoProveedorComponent {
  displayedColumns: string[] = [
  'nombreMaterial',
  'tipoMaterial',
  'cantidad',
  'unidadPresentacion',
  'cantidadTotal',
  'unidadMedida',
  'color'
];

  constructor(@Inject(MAT_DIALOG_DATA) public pedido: PedidoProveedorResponseDTO) {}
}
