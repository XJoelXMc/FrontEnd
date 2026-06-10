import { Injectable } from '@angular/core';
import { CotizacionCache } from '../models/crear-cotizacion.model';

/**
 * Servicio "Singleton" para mantener los datos de la cotización
 * mientras navegamos desde el formulario a la página de resumen.
 */
@Injectable({
  providedIn: 'root'
})
export class CotizacionCacheService {

  private cache: CotizacionCache | null = null;

  constructor() { }

  /**
   * Guarda los datos de la cotización en la caché.
   * Se llama desde 'CrearCotizacionComponent'.
   */
  setDatos(datos: CotizacionCache): void {
    this.cache = datos;
  }

  /**
   * Obtiene los datos de la cotización.
   * Se llama desde 'DetalleCotizacionComponent'.
   * NOTA: No limpiamos la caché aquí para permitir "Editar" (volver atrás).
   */
  getDatos(): CotizacionCache | null {
    return this.cache;
  }

  /**
   * Limpia la caché.
   * Se llama desde 'DetalleCotizacionComponent' después de enviar el pedido.
   */
  limpiarDatos(): void {
    this.cache = null;
  }
}