import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PedidoProveedorDTO, PedidoProveedorResponseDTO } from '../models/pedido-proveedor.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoProveedorService {

  private baseUrl = '/api/pedidos-proveedor';

  constructor(private http: HttpClient) {}

  crearPedido(pedido: PedidoProveedorDTO): Observable<PedidoProveedorResponseDTO> {
    return this.http.post<PedidoProveedorResponseDTO>(this.baseUrl, pedido);
  }
  obtenerPedidos(): Observable<PedidoProveedorResponseDTO[]> {
  return this.http.get<PedidoProveedorResponseDTO[]>('/api/pedidos-proveedor');
}
//actualizar
actualizarPedido(id: number, pedido: PedidoProveedorDTO): Observable<PedidoProveedorResponseDTO> {
  console.log('estamos entrando')
  const token = localStorage.getItem('token');
  return this.http.put<PedidoProveedorResponseDTO>(
    `${this.baseUrl}/${id}`, 
    pedido,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
}


  // Puedes agregar método para listar todos los pedidos
}
