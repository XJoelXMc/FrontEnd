import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CategoriaInventario } from '../models/categoriaInventario.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private baseUrl = '/api/categorias-inventario';

  constructor(private http: HttpClient) {}

getCategorias(): Observable<CategoriaInventario[]> {
  return this.http.get<CategoriaInventario[]>(this.baseUrl).pipe(
    tap(categorias => {
      console.log("Categorias recibidas del backend:", categorias);
    })
  );
}

listarPrincipales(): Observable<CategoriaInventario[]> {
  const params = new HttpParams().set('esPrincipal', 'true');
  return this.http.get<CategoriaInventario[]>(`${this.baseUrl}`, { params }).pipe(
    tap(data => console.log("Categorias principales recibidas:", data))
  );
}

listarSubcategorias(parentId: number): Observable<CategoriaInventario[]> {
  return this.http.get<CategoriaInventario[]>(`${this.baseUrl}/${parentId}/subcategorias`).pipe(
    tap(subs => console.log(`Subcategorías del parentId=${parentId}:`, subs))
  );
}


  getParentId(id: number): Observable<number | null> {
    return this.http.get<number>(`${this.baseUrl}/${id}/parent-id`).pipe(
      catchError(err => {
        if (err.status === 204) {
          return of(null);
        }
        return throwError(() => new Error('Error al obtener el parent ID'));
      })
    );
  }

  crear(categoria: CategoriaInventario): Observable<CategoriaInventario> {
    if (categoria.parent_id) {
      return this.http.post<CategoriaInventario>(
        `${this.baseUrl}/${categoria.parent_id}/subcategorias`, 
        categoria
      );
    }
    // Si no tiene parentId, se crea como categoría principal
    return this.http.post<CategoriaInventario>(`${this.baseUrl}`, categoria);
  }
  crearSubcategoria(parentId: number, subcategoria: CategoriaInventario): Observable<CategoriaInventario> {
    if (!parentId) {
      throw new Error("Debes seleccionar una categoría principal válida");
    }
    return this.http.post<CategoriaInventario>(
      `${this.baseUrl}/${parentId}/subcategorias`,
      subcategoria
    );
  }

  actualizar(id: number, categoria: CategoriaInventario): Observable<CategoriaInventario> {
    return this.http.put<CategoriaInventario>(`${this.baseUrl}/${id}`, categoria);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  
}
