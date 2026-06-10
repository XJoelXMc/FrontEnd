import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InventarioService } from '../../../services/inventario.service';
import { InventarioModel } from '../../../models/inventario.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { CategoriaInventario } from '../../../models/categoriaInventario.model';
import { CategoriaService } from '../../../services/categoria.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gestion-inventario',
  templateUrl: './gestion-inventario.component.html',
  styleUrls: ['./gestion-inventario.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ])
    ])
  ]
})
export class GestionInventarioComponent implements OnInit {

  // --- Propiedades de Datos y Estado ---
  categorias: CategoriaInventario[] = [];
  subcategorias: CategoriaInventario[] = [];
  inventarioFiltrado: InventarioModel[] = [];
  categoriaSeleccionada: CategoriaInventario | null = null;
  categoriaPadreSeleccionada: CategoriaInventario | null = null;
  
  // Propiedad para controlar la lógica de la UI
  public puedeCrearSubcategoria: boolean = false;
  private tieneInventarioEnCategoriaPadre: boolean = false;

  // --- Propiedades del Formulario y Modales ---
  nuevaCategoria: CategoriaInventario = { 
    nombre: '', 
    descripcion: ''
  };
  imagenSeleccionada: File | null = null;
  imagenPreview: string | null = null;
  cantidadAjuste: number = 0;
  tipoAjuste: 'entrada' | 'salida' = 'entrada';

  @ViewChild('detallesModal') detallesModal!: TemplateRef<any>;
  @ViewChild('ajusteModal') ajusteModal!: TemplateRef<any>;
  @ViewChild('crearCategoriaModal') crearCategoriaModal!: TemplateRef<any>;

  constructor(
    private inventarioService: InventarioService,
    private categoriaService: CategoriaService,
    private dialog: MatDialog,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCategoriasPrincipales();
  }

  // --- Métodos de Carga de Datos y Navegación ---

  /** Carga la lista de categorías principales. */
  cargarCategoriasPrincipales(): void {
    console.log("--- Iniciando carga de categorías principales ---");
    this.categoriaService.listarPrincipales().subscribe({
      next: data => {
        this.categorias = data;
        this.subcategorias = [];
        this.categoriaPadreSeleccionada = null;
        this.categoriaSeleccionada = null;
        this.inventarioFiltrado = [];
        this.puedeCrearSubcategoria = true; 
        this.cdr.detectChanges();
        console.log(`Carga de categorías principales finalizada. Total: ${data.length}`);
      },
      error: err => {
        console.error("Error al cargar categorías principales:", err);
      }
    });
  }

  /** Carga las subcategorías de una categoría padre. */
  cargarSubcategorias(categoriaPadre: CategoriaInventario): void {
    if (!categoriaPadre?.id) return;
    console.log(`--- Iniciando carga de subcategorías para la categoría padre: ${categoriaPadre.nombre} (ID: ${categoriaPadre.id}) ---`);
    this.categoriaService.listarSubcategorias(categoriaPadre.id).subscribe({
      next: data => {
        this.subcategorias = data;
        this.categoriaPadreSeleccionada = categoriaPadre;
        this.categoriaSeleccionada = null;
        this.inventarioFiltrado = [];
        this.puedeCrearSubcategoria = true;
        this.cdr.detectChanges();
        console.log(`Carga de subcategorías para ${categoriaPadre.nombre} finalizada. Total: ${data.length}`);
      },
      error: err => {
        console.error("Error al cargar subcategorías:", err);
      }
    });
  }

  /**
   * Maneja la selección de una categoría.
   * Ahora usa el nuevo método `getParentId` para determinar si es una categoría
   * principal con subcategorías o una categoría final con inventario.
   */
  seleccionarCategoria(cat: CategoriaInventario): void {
    // Si no hay ID, no hacemos nada
    if (!cat.id) return;

    console.log(`--- SELECCIONADA: Categoría '${cat.nombre}' (ID: ${cat.id}) ---`);

    // Lógica para determinar si es categoría principal, subcategoría con hijos o sin hijos
    this.categoriaService.getParentId(cat.id).subscribe({
      next: (parentId: number | null) => {
        // Reiniciamos el estado de las vistas
        this.subcategorias = [];
        this.inventarioFiltrado = [];
        this.categoriaSeleccionada = null;
        this.categoriaPadreSeleccionada = null;
        
        // La lógica clave se mueve aquí, usando el resultado del servicio
        if (parentId === null) {
          // Si parentId es null, es una categoría principal. 
          // Verificamos si tiene subcategorías o si debemos cargar el inventario directamente.
          this.categoriaService.listarSubcategorias(cat.id!).subscribe({
            next: subcategorias => {
              if (subcategorias.length > 0) {
                // Caso 1: Es una categoría padre con subcategorías
                console.log("=> Es una CATEGORÍA PADRE CON HIJOS. Se procede a cargar subcategorías.");
                this.subcategorias = subcategorias;
                this.categoriaPadreSeleccionada = cat;
                this.puedeCrearSubcategoria = true;
                this.cdr.detectChanges();
              } else {
                // Caso 2: Es una categoría padre sin subcategorías. Cargamos su inventario directamente.
                console.log("=> Es una CATEGORÍA PADRE SIN HIJOS. Se procede a cargar inventario.");
                this.categoriaSeleccionada = cat;
                this.puedeCrearSubcategoria = false;
                this.cargarInventario(cat.id!);
              }
            },
            error: err => {
              console.error("Error al verificar subcategorías:", err);
            }
          });
        } else {
          // Caso 3: Si parentId no es null, es una categoría final (hoja) con inventario.
          console.log("=> Es una CATEGORÍA FINAL. Se procede a cargar inventario.");
          this.categoriaSeleccionada = cat;
          this.puedeCrearSubcategoria = false;
          this.cargarInventario(cat.id!);
        }
      },
      error: (err) => {
        console.error("Error al obtener el parent_id:", err);
      }
    });
  }
  
  /** Carga el inventario para una categoría final. 
   * @param categoriaId El ID numérico de la categoría.
   */
  private cargarInventario(categoriaId: number): void {
  console.log(`--- Ejecutando cargarInventario para el ID de categoría: ${categoriaId} ---`);
  this.inventarioService.getInventarioPorCategoriaId(categoriaId).subscribe({
    next: inventario => {
      // ✅ Línea clave para depuración: Muestra los datos recibidos.
      console.log('Datos de inventario recibidos:', inventario); 
      
      this.inventarioFiltrado = inventario;
      this.cdr.detectChanges();
      console.log(`Inventario cargado exitosamente. Total de items: ${inventario.length}`);
    },
    error: err => {
      console.error("Error al cargar inventario:", err);
      this.inventarioFiltrado = [];
    }
  });
}
  
  /** Vuelve a la vista de categorías principales. */
  volverACategoriasPrincipales(): void {
    console.log("--- Volviendo a categorías principales ---");
    this.cargarCategoriasPrincipales();
  }

  // --- Gestión de Modales e Interacción del Usuario ---

  abrirDetalles(item: InventarioModel): void {
    this.dialog.open(this.detallesModal, { data: item });
  }

  abrirAjuste(item: InventarioModel): void {
    this.cantidadAjuste = 0;
    this.tipoAjuste = 'entrada';
    this.dialog.open(this.ajusteModal, { data: item });
  }

  confirmarAjuste(item: InventarioModel): void {
    const factor = this.tipoAjuste === 'salida' ? -1 : 1;
    const ajuste: InventarioModel = {
      ...item,
      cantidadDisponible: this.cantidadAjuste * factor
    };

    this.inventarioService.registrarManual(ajuste).subscribe({
      next: () => {
        if (this.categoriaSeleccionada?.id) {
          this.cargarInventario(this.categoriaSeleccionada.id); 
        }
        this.dialog.closeAll();
      },
      error: err => {
        console.error("Error al registrar ajuste:", err);
      }
    });
  }

  /**
   * Abre el modal para crear una categoría principal.
   */
  abrirCrearCategoria(): void {
    this.resetFormularioCategoria();
    this.dialog.open(this.crearCategoriaModal);
  }

  /**
   * Abre el modal para crear una subcategoría.
   */
  abrirCrearSubcategoria(): void {
    if (!this.categoriaPadreSeleccionada?.id) {
      return;
    }
    this.resetFormularioCategoria();
    this.dialog.open(this.crearCategoriaModal);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSizeMB = 2;

    if (!allowedTypes.includes(file.type)) {
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return;
    }

    this.imagenSeleccionada = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  // --- Métodos de Formulario y Peticiones ---

  guardarCategoria(): void {
    if (!this.nuevaCategoria.nombre?.trim()) {
      return;
    }

    const parent_id = this.categoriaPadreSeleccionada?.id;

    if (this.imagenSeleccionada) {
      const formData = new FormData();
      formData.append('file', this.imagenSeleccionada);
      this.http.post<any>('http://localhost:8080/api/upload', formData).subscribe({
        next: (res) => {
          this.nuevaCategoria.imagen = res.secure_url || res.url;
          this.crearCategoria(parent_id);
        },
        error: (err) => {
          console.error("Error al subir imagen:", err);
        }
      });
    } else {
      this.crearCategoria(parent_id);
    }
  }

  private crearCategoria(parent_id: number | undefined): void {
    // Si hay un parent_id, creamos una subcategoría.
    if (parent_id) {
      // Usamos 'parent_id!' para afirmar que el valor no es undefined aquí.
      this.categoriaService.crearSubcategoria(parent_id!, this.nuevaCategoria).subscribe({
        next: (response) => {
          this.dialog.closeAll();
          this.recargarListado(this.categoriaPadreSeleccionada);
        },
        error: (err) => {
          console.error('Error al crear subcategoría:', err);
        }
      });
    } else {
      // Si no hay parent_id, creamos una categoría principal.
      this.categoriaService.crear(this.nuevaCategoria).subscribe({
        next: (response) => {
          this.dialog.closeAll();
          this.recargarListado();
        },
        error: (err) => {
          console.error('Error al crear categoría principal:', err);
        }
      });
    }
  }

  private recargarListado(categoria?: CategoriaInventario | null): void {
    if (categoria) {
      this.cargarSubcategorias(categoria);
    } else {
      this.cargarCategoriasPrincipales();
    }
    this.resetFormularioCategoria();
  }
  
  private resetFormularioCategoria(): void {
    this.nuevaCategoria = { nombre: '', descripcion: '' };
    this.imagenSeleccionada = null;
    this.imagenPreview = null;
  }
  
  // --- Métodos de Eliminación y Auxiliares ---
  
  eliminarCategoria(categoria: CategoriaInventario): void {
    if (categoria.id) {
      this.categoriaService.eliminar(categoria.id).subscribe({
        next: () => {
          if (this.categoriaPadreSeleccionada) {
            this.cargarSubcategorias(this.categoriaPadreSeleccionada);
          } else {
            this.cargarCategoriasPrincipales();
          }
        },
        error: err => {
          console.error("Error al eliminar categoría:", err);
        }
      });
    }
  }
  
  getColorEstilo(color?: string) {
    return { backgroundColor: color || '#ccc' };
  }
}
