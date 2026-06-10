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

 
  getPacksDisponibles(): Observable<PackPublico[]> {
    return this.http.get<PackPublico[]>(`${this.API_BASE_URL}/catalogo/packs`);
  }

  
  getPackDetalle(id: number): Observable<PackDetalle> {
    return this.http.get<PackDetalle>(`${this.API_BASE_URL}/catalogo/packs/${id}`);
  }
  getMiInformacion(): Observable<UsuarioInfo> {
    return this.http.get<UsuarioInfo>(`${this.API_BASE_URL}/usuarios/me`);
  }

   crearCotizacion(payload: CotizacionPayload): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/cotizaciones`, payload);
  }
getTelasSugeridasPorPack(id: number): Observable<{ superior: TelaInfo[], inferior: TelaInfo[] }> {
  return this.http.get<{ superior: TelaInfo[], inferior: TelaInfo[] }>(
    `${this.API_BASE_URL}/catalogo/packs/${id}/telas-sugeridas`
  );
}
buscarPorCodigo(codigo: string): Observable<CotizacionPayload> {
    return this.http.get<CotizacionPayload>(`${this.API_BASE_URL}/cotizaciones/buscar/${codigo}`);
  }


}

