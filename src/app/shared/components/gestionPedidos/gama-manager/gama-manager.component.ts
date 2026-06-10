import { Component, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminConfigService } from '../../../../services/admin-config.service';
import { InventarioService } from '../../../../services/inventario.service';
import { DatosCreacionPackDTO, TelaInventarioDTO, TelaSimpleDTO, GamaTelaDTO } from '../../../../models/admin-config.models';

@Component({
  selector: 'app-gama-manager',
  templateUrl: './gama-manager.component.html',
  styleUrls: ['./gama-manager.component.scss']
})
export class GamaManagerComponent implements OnInit {
  datos: DatosCreacionPackDTO | null = null;
  telasEnInventario: TelaInventarioDTO[] = [];
  isLoadingTelas = true;
  isDragging = false;
  activeDropZone: number | null = null;
  
  // ✅ Variables para el modal
  showSublimableModal = false;
  currentTela: TelaInventarioDTO | null = null;
  currentGamaId: number | null = null;
  esSublimable: boolean = false;

  constructor(
    private adminConfigService: AdminConfigService,
    private inventarioService: InventarioService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  /**
   * Carga todos los datos necesarios para la vista
   */
  loadInitialData(): void {
    this.isLoadingTelas = true;
    this.adminConfigService.getDatosParaCreacion().subscribe(data => this.datos = data);
    this.inventarioService.getSoloTelas().subscribe({
      next: (telas) => {
        this.telasEnInventario = telas;
        this.isLoadingTelas = false;
      },
      error: (err) => {
        console.error('Error al cargar las telas del inventario:', err);
        this.snackBar.open('No se pudieron cargar las telas del inventario.', 'Cerrar', { duration: 4000 });
        this.isLoadingTelas = false;
      }
    });
  }

  /**
   * Crea una nueva gama de tela
   */
  crearGama(nombre: string): void {
    if (!nombre || !nombre.trim()) {
      this.snackBar.open('El nombre de la gama no puede estar vacío.', 'Cerrar', { duration: 3000 });
      return;
    }
    this.adminConfigService.createGamaTela(nombre).subscribe({
      next: () => {
        this.snackBar.open(`Gama "${nombre}" creada exitosamente.`, 'OK', { duration: 3000 });
        this.loadInitialData();
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Error al crear la gama.', 'Cerrar', { duration: 3000 })
    });
  }

  /**
   * Maneja el evento de soltar una tela en una gama
   */
  onDrop(event: CdkDragDrop<TelaSimpleDTO[]>, gamaId: number): void {
    this.isDragging = false;
    this.activeDropZone = null;
    
    const droppedItem: TelaInventarioDTO = event.item.data;
    const targetGama = this.datos?.todasLasGamasConTelas.find(g => g.id === gamaId);
    
    if (!targetGama) return;

    // Previene duplicados
    const nombreCompletoTela = `${droppedItem.nombreMaterial} (${droppedItem.color})`;
    if (targetGama.telas.some(t => t.nombre.toLowerCase() === nombreCompletoTela.toLowerCase())) {
        this.snackBar.open('Esta tela ya está asignada a la gama.', 'Cerrar', { duration: 2000 });
        return;
    }
    
    // ✅ REEMPLAZAR EL CONFIRM POR MODAL INTEGRADO
    this.currentTela = droppedItem;
    this.currentGamaId = gamaId;
    this.esSublimable = false; // Resetear valor por defecto
    this.showSublimableModal = true;
  }

  /**
   * ✅ NUEVO MÉTODO: Confirma la asignación de la tela
   */
  confirmarAsignacionTela(): void {
    if (!this.currentTela || !this.currentGamaId) return;

    // Construye la lista de gamas
    const gamaIds = new Set<number>([this.currentGamaId]);
    
    this.datos?.todasLasGamasConTelas.forEach(gama => {
      if (gama.telas.some(telaCatalogo => this.isSameTela(telaCatalogo, this.currentTela!))) {
        gamaIds.add(gama.id);
      }
    });
    
    const telaData = {
      materialInventarioId: this.currentTela.id,
      gamaIds: Array.from(gamaIds),
      sublimable: this.esSublimable 
    };
    
    this.adminConfigService.createOrUpdateTela(telaData).subscribe({
      next: () => {
        this.snackBar.open(`Tela "${this.currentTela!.nombreMaterial}" asignada correctamente.`, 'OK', { duration: 3000 });
        this.loadInitialData();
        this.cerrarModal();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al asignar la tela.', 'Cerrar', { duration: 4000 });
        this.cerrarModal();
      }
    });
  }

  /**
   * ✅ NUEVO MÉTODO: Cierra el modal
   */
  cerrarModal(): void {
    this.showSublimableModal = false;
    this.currentTela = null;
    this.currentGamaId = null;
    this.esSublimable = false;
  }

  /**
   * Extrae el color de una tela del catálogo
   */
  extractColorFromTela(tela: TelaSimpleDTO): string {
    const match = tela.nombre.match(/\(([^)]+)\)$/);
    return match ? match[1] : '#CCCCCC';
  }

  /**
   * Compara una tela del catálogo con una del inventario
   */
  private isSameTela(telaCatalogo: TelaSimpleDTO, telaInventario: TelaInventarioDTO): boolean {
    const nombreCompletoInventario = `${telaInventario.nombreMaterial} (${telaInventario.color})`;
    return telaCatalogo.nombre.toLowerCase() === nombreCompletoInventario.toLowerCase();
  }

  /**
   * Devuelve los IDs de las drop lists de las gamas
   */
  getGamaDropListIds(): string[] {
    return this.datos?.todasLasGamasConTelas.map(g => `gama-${g.id}`) || [];
  }

  /**
   * Eventos de drag para mejorar la experiencia visual
   */
  onDragEnter(event: any): void {
    this.isDragging = true;
  }

  onDragExit(event: any): void {
    this.isDragging = false;
  }

  onGamaDragEnter(gamaId: number): void {
    this.activeDropZone = gamaId;
  }

  onGamaDragExit(): void {
    this.activeDropZone = null;
  }
}