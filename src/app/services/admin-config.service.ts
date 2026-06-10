import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DatosCreacionPackDTO,
  PackCreacionDTO,
  MoldeResponseDTO, // <-- Se importa la interfaz correcta
  TelaSimpleDTO
} from '../models/admin-config.models';

@Injectable({
  providedIn: 'root'
})
export class AdminConfigService {
  private readonly API_BASE_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // --- PACKS ---
  getDatosParaCreacion(): Observable<DatosCreacionPackDTO> {
    return this.http.get<DatosCreacionPackDTO>(`${this.API_BASE_URL}/admin/packs/datos-creacion`);
  }

  createPack(packData: PackCreacionDTO): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/admin/packs`, packData);
  }

  // --- GAMAS Y TELAS ---
  createGamaTela(nombre: string): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/admin/gamas`, { nombre });
  }

  createOrUpdateTela(telaData: { materialInventarioId: number; gamaIds: number[]; sublimable: boolean }): Observable<any> {
  return this.http.post(`${this.API_BASE_URL}/admin/telas-catalogo`, telaData);
}


  updateGama(gamaId: number, nombre: string, telaIds: number[]): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/admin/gamas/${gamaId}`, { nombre, telaIds });
  }
  getTelasSublimablesByGama(gamaId: number): Observable<TelaSimpleDTO[]> {
  return this.http.get<TelaSimpleDTO[]>(`${this.API_BASE_URL}/admin/gamas/${gamaId}/telas-sublimables`);
}
  // --- MOLDES ---
  getAllMoldes(): Observable<MoldeResponseDTO[]> {
    return this.http.get<MoldeResponseDTO[]>(`${this.API_BASE_URL}/admin/moldes`);
  }
 createMolde(formData: FormData): Observable<MoldeResponseDTO> {
  return this.http.post<MoldeResponseDTO>(`${this.API_BASE_URL}/admin/moldes`, formData);
}

updateMolde(id: number, formData: FormData): Observable<MoldeResponseDTO> {
  return this.http.put<MoldeResponseDTO>(`${this.API_BASE_URL}/admin/moldes/${id}`, formData);
}

  deleteMolde(id: number): Observable<any> {
    return this.http.delete(`${this.API_BASE_URL}/admin/moldes/${id}`);
  }
}

