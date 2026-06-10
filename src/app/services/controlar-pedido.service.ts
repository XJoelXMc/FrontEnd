import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResumenPedidoDTO } from '../models/personalizacion.model'; // O donde tengas el DTO

@Injectable({
  providedIn: 'root'
})
export class ControlarPedidoService {

  private readonly API_URL = 'http://localhost:8080/api/pedidos'; // ✅ Apunta a /api/pedidos

  constructor(private http: HttpClient) { }

  // CLIENTE
  buscarPorCodigo(codigo: string): Observable<ResumenPedidoDTO> {
    return this.http.get<ResumenPedidoDTO>(`${this.API_URL}/resumen/${codigo}`);
  }

  // ADMIN
  listarTodosLosPedidos(): Observable<ResumenPedidoDTO[]> {
    // ✅ Verifica que esta ruta coincida con el @GetMapping del Controller
    return this.http.get<ResumenPedidoDTO[]>(`${this.API_URL}/admin/listado`);
  }
}