import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventarioModel } from '../models/inventario.model';
import { TelaInventarioDTO } from '../models/admin-config.models';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private baseUrl = '/api/inventario';

  constructor(private http: HttpClient) {}

// ✨ CAMBIO: Se ajusta el método para recibir el 'id' de la categoría en lugar del nombre.
  getInventarioPorCategoriaId(idCategoria: number): Observable<InventarioModel[]> {
    return this.http.get<InventarioModel[]>(`${this.baseUrl}/categoria/${idCategoria}`);
  }

  registrarManual(ajuste: InventarioModel): Observable<any> {
    return this.http.post(`${this.baseUrl}/manual`, ajuste);
  }
  /**
   * ✨ 2. NUEVO MÉTODO: Llama al endpoint del backend que devuelve solo las telas.
   * @returns Un Observable con la lista de telas del inventario.
   */
  getSoloTelas(): Observable<TelaInventarioDTO[]> {
    return this.http.get<TelaInventarioDTO[]>(`${this.baseUrl}/telas`);
  }
}
