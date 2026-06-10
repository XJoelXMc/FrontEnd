import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Modelo } from "../models/modelos.model";
import { ModeloDTO } from "../models/modelo.dto";

@Injectable({ providedIn: 'root' })
export class ModeloService {
  private apiUrl = '/api/modelos';

  constructor(private http: HttpClient) {}

  getPorCategoria(categoria: string): Observable<Modelo[]> {
    return this.http.get<Modelo[]>(`${this.apiUrl}/categoria/${categoria}`);
  }

  crear(modelo: ModeloDTO): Observable<Modelo> {
    return this.http.post<Modelo>(this.apiUrl, modelo);
  }

  actualizar(id: number, modelo: ModeloDTO): Observable<Modelo> {
    return this.http.put<Modelo>(`${this.apiUrl}/${id}`, modelo);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTodos(): Observable<Modelo[]> {
    return this.http.get<Modelo[]>(this.apiUrl);
  }
}
