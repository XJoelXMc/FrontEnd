import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cuello } from '../models/cuello.model';

@Injectable({
  providedIn: 'root'
})
export class CuelloService {

  private apiUrl = '/api/admin/cuellos';

  constructor(private http: HttpClient) { }

  // Obtiene todos los cuellos
  getAllCuellos(): Observable<Cuello[]> {
    return this.http.get<Cuello[]>(this.apiUrl);
  }

  // Obtiene un cuello por su ID
  getCuelloById(id: number): Observable<Cuello> {
    return this.http.get<Cuello>(`${this.apiUrl}/${id}`);
  }

  // Crea un nuevo cuello (envía FormData por las imágenes)
  createCuello(formData: FormData): Observable<Cuello> {
    return this.http.post<Cuello>(this.apiUrl, formData);
  }

  // Actualiza un cuello existente (envía FormData por las imágenes)
  updateCuello(id: number, formData: FormData): Observable<Cuello> {
    return this.http.put<Cuello>(`${this.apiUrl}/${id}`, formData);
  }

  // Elimina un cuello
  deleteCuello(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
