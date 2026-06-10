import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStatsDTO, SankeyLinkDTO } from '../models/DashboardStats';
import { ResumenPedidoDTO } from '../models/personalizacion.model';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  // Asegúrate que este puerto coincida con tu backend
  private readonly API_URL = 'http://localhost:8080/api/admin/dashboard';

  constructor(private http: HttpClient) { }

  getMetrics(): Observable<DashboardStatsDTO> {
    return this.http.get<DashboardStatsDTO>(`${this.API_URL}/metrics`);
  }
  getPedidosPorPack(nombrePack: string): Observable<ResumenPedidoDTO[]> {
    return this.http.get<ResumenPedidoDTO[]>(`${this.API_URL}/pedidos-por-pack?nombrePack=${nombrePack}`);
  }
  getSankeyFlow(): Observable<any[]> {
  // El backend devuelve una lista de objetos {from, to, weight}
  return this.http.get<any[]>(`${this.API_URL}/sankey-flow`);
}
}