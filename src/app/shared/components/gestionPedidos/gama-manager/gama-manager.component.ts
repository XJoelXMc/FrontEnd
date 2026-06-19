import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog'; // ✅ Importante para el Modal
import { AdminConfigService } from '../../../../services/admin-config.service';
import { InventarioService } from '../../../../services/inventario.service';
import { DatosCreacionPackDTO, TelaInventarioDTO, TelaSimpleDTO } from '../../../../models/admin-config.models';

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
  
  // ✅ Variables para el modal de asignación (Sublimable)
  showSublimableModal = false;
  currentTela: TelaInventarioDTO | null = null;
  currentGamaId: number | null = null;
  esSublimable: boolean = false;

  // ✅ Referencia al modal de confirmar eliminación de Gama
  @ViewChild('confirmDeleteModal') confirmDeleteModal!: TemplateRef<any>;

  constructor(
    private adminConfigService: AdminConfigService,
    private inventarioService: InventarioService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog // ✅ Inyectamos MatDialog
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

  // ==========================================
  // ✅ NUEVOS MÉTODOS: ELIMINAR GAMA Y QUITAR TELA
  // ==========================================

  /**
   * Abre Modal y Elimina la Gama si se confirma
   */
  abrirModalEliminarGama(gama: any): void {
    const dialogRef = this.dialog.open(this.confirmDeleteModal, {
      data: gama,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        // Asegúrate de tener deleteGama en tu AdminConfigService
        this.adminConfigService.deleteGama(gama.id).subscribe({
          next: () => {
            // Actualiza la vista eliminando la gama de la lista local
            if (this.datos) {
              this.datos.todasLasGamasConTelas = this.datos.todasLasGamasConTelas.filter((g: any) => g.id !== gama.id);
            }
            this.snackBar.open('Gama eliminada con éxito', 'Cerrar', { duration: 3000 });
          },
          error: (err) => {
            this.snackBar.open('Error al eliminar la gama. Verifique si está en uso.', 'Cerrar', { duration: 4000 });
          }
        });
      }
    });
  }

  /**
   * Quita una tela específica de la Gama
   */
  quitarTelaDeGama(gama: any, telaIdToRemove: number): void {
    // 1. Filtramos las telas, quitando la que el usuario quiere eliminar
    const nuevasTelas = gama.telas.filter((t: any) => t.id !== telaIdToRemove);
    const nuevosTelaIds = nuevasTelas.map((t: any) => t.id);

    // 2. Preparamos el DTO como lo espera el Backend (GamaTelaRequestDTO)
    const payload = {
      nombre: gama.nombre,
      telaIds: nuevosTelaIds
    };

    // 3. Enviamos la actualización al Backend
    // Asegúrate de tener updateGama en tu AdminConfigService
    this.adminConfigService.updateGama(gama.id, payload).subscribe({
      next: (gamaActualizada) => {
        // Actualizamos la vista localmente sin necesidad de recargar todo
        gama.telas = nuevasTelas;
        this.snackBar.open('Tela removida de la gama', 'Cerrar', { duration: 2000 });
      },
      error: (err) => {
        this.snackBar.open('Error al remover la tela', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // ==========================================
  // MÉTODOS DE DRAG & DROP Y MODAL DE ASIGNACIÓN
  // ==========================================

  /**
   * Maneja el evento de soltar una tela en una gama
   */
  onDrop(event: CdkDragDrop<TelaSimpleDTO[]>, gamaId: number): void {
    this.isDragging = false;
    this.activeDropZone = null;
    
    const droppedItem: TelaInventarioDTO = event.item.data;
    const targetGama = this.datos?.todasLasGamasConTelas.find(g => g.id === gamaId);
    
    if (!targetGama) return;

    // Previene duplicados (verificando por nombreMaterial)
    if (targetGama.telas.some((t: any) => t.nombre.toLowerCase() === droppedItem.nombreMaterial.toLowerCase())) {
        this.snackBar.open('Esta tela ya está asignada a la gama.', 'Cerrar', { duration: 2000 });
        return;
    }
    
    // Abre el modal para preguntar si es sublimable
    this.currentTela = droppedItem;
    this.currentGamaId = gamaId;
    this.esSublimable = false; 
    this.showSublimableModal = true;
  }

  /**
   * Confirma la asignación de la tela
   */
  confirmarAsignacionTela(): void {
    if (!this.currentTela || !this.currentGamaId) return;

    // Construye la lista de gamas a las que pertenecerá esta tela
    const gamaIds = new Set<number>([this.currentGamaId]);
    
    this.datos?.todasLasGamasConTelas.forEach(gama => {
      // Si la tela ya estaba en otras gamas, mantenemos la relación
      if (gama.telas.some((telaCatalogo: any) => telaCatalogo.nombre.toLowerCase() === this.currentTela!.nombreMaterial.toLowerCase())) {
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
        this.loadInitialData(); // Recargamos para ver los colores frescos y el ID de backend
        this.cerrarModal();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al asignar la tela.', 'Cerrar', { duration: 4000 });
        this.cerrarModal();
      }
    });
  }

  /**
   * Cierra el modal de asignación
   */
  cerrarModal(): void {
    this.showSublimableModal = false;
    this.currentTela = null;
    this.currentGamaId = null;
    this.esSublimable = false;
  }

  /**
   * Extrae el color de una tela del catálogo.
   * Ahora primero intenta usar el color directo que arreglamos en el backend.
   */
  extractColorFromTela(tela: any): string {
    if (tela.color) return tela.color; // ✅ Si ya viene del backend (Paso 1), lo usamos directo
    const match = tela.nombre.match(/\(([^)]+)\)$/); // Respaldo antiguo
    return match ? match[1] : '#CCCCCC';
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