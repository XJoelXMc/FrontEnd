import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatosPersonalizacionDTO, CrearPedidoDTO } from '../models/personalizacion.model';

@Injectable({
  providedIn: 'root'
})
export class PersonalizacionService {

  // Base URLs
  private readonly API_PEDIDOS = 'http://localhost:8080/api/pedidos';
  private readonly API_UPLOADS = 'http://localhost:8080/api/upload';

  constructor(private http: HttpClient) { }

  /**
   * 1. Obtiene datos para pintar el lienzo (GET)
   */
  obtenerDatosParaPersonalizar(cotizacionId: number): Observable<DatosPersonalizacionDTO> {
    return this.http.get<DatosPersonalizacionDTO>(`${this.API_PEDIDOS}/preparar-personalizacion/${cotizacionId}`);
  }

  /**
   * 2. Sube el logo a Cloudinary (Cuenta Secundaria) y devuelve la URL (POST)
   */
  subirLogo(archivo: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', archivo);
    return this.http.post<{ url: string }>(`${this.API_UPLOADS}/logo`, formData);
  }

  /**
   * 3. Guarda el pedido final (POST)
   */
  crearPedido(payload: CrearPedidoDTO): Observable<any> {
    return this.http.post(`${this.API_PEDIDOS}`, payload);
  }
}