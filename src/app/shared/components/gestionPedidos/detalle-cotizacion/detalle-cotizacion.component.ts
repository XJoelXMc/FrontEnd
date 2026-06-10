import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { CrearCotizacionService } from '../../../../services/crear-cotizacion.service';
import { CotizacionCache, DesgloseTallaItem, SponsorPayload, TipoSponsorTecnica } from '../../../../models/crear-cotizacion.model';
import { CotizacionCacheService } from '../../../../services/cotizacion-cache.service';

@Component({
  selector: 'app-detalle-cotizacion',
  templateUrl: './detalle-cotizacion.component.html',
  styleUrls: ['./detalle-cotizacion.component.scss']
})
export class DetalleCotizacionComponent implements OnInit {

  @ViewChild('modalExito') modalExito!: TemplateRef<any>;

  public cotizacion: CotizacionCache | null = null;
  public isLoading: boolean = false;
  public cantidadTotalPrendas: number = 0; 
  
  // ✅ NUEVO: Variable para guardar el ID de la cotización creada
  private idCotizacionCreada: number | null = null;

  displayedColumns: string[] = ['talla', 'cantidad', 'precioUnitario', 'subtotal'];
  dataSource = new MatTableDataSource<DesgloseTallaItem>();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cacheService: CotizacionCacheService,
    private cotizacionService: CrearCotizacionService
  ) {}

  ngOnInit(): void {
    this.cotizacion = this.cacheService.getDatos();

    if (!this.cotizacion) {
      this.router.navigate(['/crear-cotizacion']);
      return;
    }

    this.dataSource.data = this.cotizacion.desglosePorTalla;
    this.cantidadTotalPrendas = this.cotizacion.desglosePorTalla.reduce(
      (sum, t) => sum + t.cantidad, 0
    );
  }

  enviarCotizacion(): void {
    if (!this.cotizacion) return;
    
    this.isLoading = true;

    this.cotizacionService.crearCotizacion(this.cotizacion.payload).subscribe({
      next: (response: any) => { 
        this.isLoading = false;
        
        // ✅ 1. CAPTURAR EL ID (El backend devuelve CotizacionSimpleDTO que tiene id y codigo)
        this.idCotizacionCreada = response.id; 

        // Abrir Modal
        this.dialog.open(this.modalExito, {
          width: '550px', // Un poco más ancho para los botones
          disableClose: true,
          data: { 
            codigo: response.codigo, 
            email: this.cotizacion?.payload.clienteInfo.email 
          }
        });

        this.cacheService.limpiarDatos();
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.snackBar.open(err.error?.message || 'Error al enviar la cotización.', 'Cerrar', { duration: 4000 });
      }
    });
  }

  // ✅ NUEVO: Método para ir a Personalizar
  irAPersonalizacion(): void {
    this.dialog.closeAll();
    if (this.idCotizacionCreada) {
      // Navegamos a la ruta con el ID
      this.router.navigate(['/personalizaTuPedido', this.idCotizacionCreada]);
    }
  }

  // ✅ NUEVO: Método para salir (si no quiere personalizar ahora)
  finalizarProceso(): void {
    this.dialog.closeAll();
    this.router.navigate(['/']); // Ir al Home o a Mis Cotizaciones
  }

  editarCotizacion(): void {
    this.router.navigate(['/crear-cotizacion']);
  }

  // ... (Resto de métodos getSponsorsLegibles, getSponsorCosto igual) ...
  getSponsorsLegibles(): string[] {
    if (!this.cotizacion?.selecciones.sponsors.length) return ['Ninguno'];
    return this.cotizacion.selecciones.sponsors.map(s => `${s.tecnica}: ${s.descripcion}`);
  }

  public getSponsorCosto(sponsor: SponsorPayload): string {
    let costo = 0;
    switch (sponsor.tecnica) {
      case TipoSponsorTecnica.BORDADO: costo = 10; break;
      case TipoSponsorTecnica.SIZER: costo = 10; break;
      case TipoSponsorTecnica.DTF: costo = 5; break;
      default: costo = 0; break;
    }
    return costo > 0 ? `+Bs. ${costo.toFixed(2)}` : 'Gratis';
  }
}