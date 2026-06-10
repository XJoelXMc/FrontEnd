import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PedidoProveedorService } from '../../../../services/pedido-proveedor.service';
import { NuevoPedidoProveedorComponent } from './nuevo-pedido-proveedor/nuevo-pedido-proveedor.component';
import { PedidoProveedorResponseDTO } from '../../../../models/pedido-proveedor.model';
import { DetallePedidoProveedorComponent } from './detalle-pedido-proveedor/detalle-pedido-proveedor.component';
import { getUserIdFromToken } from '../../../../Utils/jwt.utils';
import { EditarPedidoProveedorComponent } from './editar-pedido-proveedor/editar-pedido-proveedor.component';


@Component({
  selector: 'app-gestionar-pedidos',
  templateUrl: './gestionar-pedidos.component.html',
  styleUrls: ['./gestionar-pedidos.component.scss']
})
export class GestionarPedidosComponent implements OnInit {

  columnas: string[] = ['fecha', 'proveedor', 'solicitante', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  usuarioId = getUserIdFromToken();

  constructor(
    private pedidoProveedorService: PedidoProveedorService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerPedidos();
    this.usuarioId = getUserIdFromToken();
    console.log('usuario id:', this.usuarioId)
  }

  obtenerPedidos(): void {
    this.pedidoProveedorService.obtenerPedidos().subscribe({
      next: (pedidos) => {  
        this.dataSource.data = pedidos;
      },
      error: (err) => {
        console.error('Error al obtener pedidos:', err);
      }
    });
  }

  abrirModalNuevoPedido(): void {
  const dialogRef = this.dialog.open(NuevoPedidoProveedorComponent, {
    width: '600px'
  });

  dialogRef.afterClosed().subscribe((pedido) => {
    if (pedido) {
      this.pedidoProveedorService.crearPedido(pedido).subscribe(() => {
        this.obtenerPedidos();
      });
    }
  });
}


  verDetalle(pedido: PedidoProveedorResponseDTO): void {
  this.dialog.open(DetallePedidoProveedorComponent, {
    width: '600px',
    data: pedido
  });
}
abrirModalEditarPedido(pedido: PedidoProveedorResponseDTO) {
  console.log('este es el pedido: '+ pedido.id)
  const dialogRef = this.dialog.open(EditarPedidoProveedorComponent, { // Cambiado aquí
    width: '800px',
    data: { pedido }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.pedidoProveedorService.actualizarPedido(pedido.id, result).subscribe({
        next: () => this.obtenerPedidos(),
        error: err => alert(err.error?.message || 'Error al actualizar pedido')
      });
    }
  });
}
}

