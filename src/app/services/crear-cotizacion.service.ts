import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PackPublico, PackDetalle, CotizacionPayload, TelaInfo, UsuarioInfo } from '../models/crear-cotizacion.model';

@Injectable({
  providedIn: 'root'
})
export class CrearCotizacionService {
  private readonly API_BASE_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // 1. Obtener Packs (Apuntaremos a un nuevo controlador que crearemos en el Paso 2)
  getPacksDisponibles(): Observable<PackPublico[]> {
    return this.http.get<PackPublico[]>(`${this.API_BASE_URL}/catalogo/packs`);
  }

  getPackDetalle(id: number): Observable<PackDetalle> {
    return this.http.get<PackDetalle>(`${this.API_BASE_URL}/catalogo/packs/${id}`);
  }

  getMiInformacion(): Observable<UsuarioInfo> {
    return this.http.get<UsuarioInfo>(`${this.API_BASE_URL}/usuarios/me`);
  }

  // ✨ CORRECCIÓN: Apuntando a /cotizaciones-cliente como dice tu Backend
  crearCotizacion(payload: CotizacionPayload): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/cotizaciones-cliente`, payload); 
  }

  // ✨ CORRECCIÓN: Apuntando a la ruta exacta de Telas en tu CotizacionClienteController
  getTelasSugeridasPorPack(id: number): Observable<{ superior: TelaInfo[], inferior: TelaInfo[] }> {
    return this.http.get<{ superior: TelaInfo[], inferior: TelaInfo[] }>(
      `${this.API_BASE_URL}/cotizaciones-cliente/pack/${id}/telas-disponibles`
    );
  }

  buscarPorCodigo(codigo: string): Observable<CotizacionPayload> {
    return this.http.get<CotizacionPayload>(`${this.API_BASE_URL}/cotizaciones/buscar/${codigo}`);
  }
}