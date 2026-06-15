import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cuello } from '../models/cuello.model';

@Injectable({
  providedIn: 'root'
})
export class CuelloService {

  // 🚪 Puerta Blindada (Solo Admin/Dueño)
  private adminUrl = 'http://localhost:8080/api/admin/cuellos'; 
  
  // 🚪 Puerta Pública (Clientes en el cotizador)
  private catalogoUrl = 'http://localhost:8080/api/catalogo/cuellos';

  constructor(private http: HttpClient) { }

  // ✅ GET: Obtiene todos los cuellos (Usa el CATÁLOGO para que el cliente no sea bloqueado)
  getAllCuellos(): Observable<Cuello[]> {
    return this.http.get<Cuello[]>(this.catalogoUrl);
  }

  // ✅ GET por ID: Puede usar admin o catálogo dependiendo de quién lo consulte
  getCuelloById(id: number): Observable<Cuello> {
    return this.http.get<Cuello>(`${this.adminUrl}/${id}`);
  }

  // 🔒 POST: Crea un nuevo cuello (Usa ADMIN)
  createCuello(formData: FormData): Observable<Cuello> {
    return this.http.post<Cuello>(this.adminUrl, formData);
  }

  // 🔒 PUT: Actualiza un cuello existente (Usa ADMIN)
  updateCuello(id: number, formData: FormData): Observable<Cuello> {
    return this.http.put<Cuello>(`${this.adminUrl}/${id}`, formData);
  }

  // 🔒 DELETE: Elimina un cuello (Usa ADMIN)
  deleteCuello(id: number): Observable<any> {
    return this.http.delete<any>(`${this.adminUrl}/${id}`);
  }
}