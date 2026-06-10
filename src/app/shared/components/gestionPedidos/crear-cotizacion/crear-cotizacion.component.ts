import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router'; // ✅ Added ActivatedRoute for edit mode
import { animate, style, transition, trigger } from '@angular/animations';

// Servicios
import { CrearCotizacionService } from '../../../../services/crear-cotizacion.service';
import { AdminConfigService } from '../../../../services/admin-config.service';
import { CuelloService } from '../../../../services/cuello.service';
import { CotizacionCacheService } from '../../../../services/cotizacion-cache.service';
import { getUserRoleFromToken } from '../../../../Utils/jwt.utils'; // ✅ Importar utilidad JWT

// Modelos
import {
  PackPublico,
  PackDetalle,
  TipoSponsorTecnica,
  TallaCantidad,
  CotizacionPayload,
  TelaInfo,
  DesgloseTallaItem,
  SeleccionesVisibles,
  CotizacionCache,
  SponsorPayload
} from '../../../../models/crear-cotizacion.model';
import { Cuello } from '../../../../models/cuello.model';
import { DatosCreacionPackDTO } from '../../../../models/admin-config.models';

@Component({
  selector: 'app-crear-cotizacion',
  templateUrl: './crear-cotizacion.component.html',
  styleUrls: ['./crear-cotizacion.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CrearCotizacionComponent implements OnInit {

  // --- 1. Propiedades ---
  cotizacionForm: FormGroup;
  packs: PackPublico[] = [];
  cuellosDisponibles: Cuello[] = [];
  packSeleccionado: PackDetalle | null = null;
  datosConfig: DatosCreacionPackDTO | null = null;
  tiposSponsor = Object.values(TipoSponsorTecnica);
  telasDisponibles = {
    superior: [] as TelaInfo[],
    inferior: [] as TelaInfo[]
  };

  // Estado de la Vista
  mostrarOpcionesInicio: boolean = true;
  codigoBusquedaControl = new FormControl('', [Validators.required, Validators.minLength(5)]);
  cargandoBusqueda: boolean = false;
  modoEdicion: boolean = false;
  
  // ✅ Nuevo Estado: Rol Admin/Dueño
  esAdmin: boolean = false;

  // Referencias a Modales
  @ViewChild('imagenDetalleModal') imagenDetalleModal!: TemplateRef<any>;
  @ViewChild('packDetalleModal') packDetalleModal!: TemplateRef<any>;

  // --- 2. Getters ---
  get tallasArray(): FormArray { return this.cotizacionForm.get('tallas') as FormArray; }
  get sponsorsArray(): FormArray { return this.cotizacionForm.get('configuraciones.sponsors') as FormArray; }

  // --- 3. Constructor ---
  constructor(
    private fb: FormBuilder,
    private cotizacionService: CrearCotizacionService,
    private adminConfigService: AdminConfigService,
    private cuelloService: CuelloService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute, // ✅ Para leer params si venimos a editar
    private cacheService: CotizacionCacheService
  ) {
    this.cotizacionForm = this.fb.group({
      // ✅ MODIFICADO: Grupo de cliente con todos los campos
      clienteInfo: this.fb.group({
        nombre: ['', Validators.required],
        apellido: ['', Validators.required], // Nuevo
        email: ['', [Validators.required, Validators.email]],
        celular: ['', Validators.required]   // Nuevo
      }),
      packId: [null, Validators.required],
      cuelloId: [null],
      seleccionTelas: this.fb.group({
        superior: this.fb.group({ telaSeleccionada: [null] }),
        inferior: this.fb.group({ telaSeleccionada: [null] })
      }),
      configuraciones: this.fb.group({
        conMangasLargas: [false],
        conBolsillos: [false],
        sponsors: this.fb.array([])
      }),
      tallas: this.fb.array([this.crearGrupoTalla()], [Validators.required, Validators.minLength(1)])
    });
  }

  // --- 4. Hook de Ciclo de Vida ---
  ngOnInit(): void {
    // 1. Determinar Rol
    const rol = getUserRoleFromToken();
    this.esAdmin = rol === 'ADMINISTRADOR' || rol === 'DUENO';

    // 2. Cargar datos base (Packs, Cuellos)
    this.cargarDatosIniciales();

    // 3. Verificar si venimos de caché (volver del resumen) o de edición por URL
    const cache = this.cacheService.getDatos();
    
    if (cache) {
      // Volviendo del resumen
      this.mostrarOpcionesInicio = false;
      this.cargarDatosEnFormulario(cache.payload);
    } else {
      // Revisar si hay ID en la URL (Edición directa desde Admin)
      this.route.paramMap.subscribe(params => {
        const idStr = params.get('id');
        const mode = this.route.snapshot.queryParamMap.get('mode'); // 'admin-edit'

        if (idStr) {
          // Simular búsqueda por código si tenemos el ID (o llamar a endpoint específico getById)
          // Nota: Para simplificar, aquí asumimos que si hay ID, entramos directo a editar.
          // Deberías tener un método en el servicio `getById` o usar el de búsqueda si tienes el código.
          // Si solo tienes el ID numérico, idealmente usa un servicio getById.
          
          // Por ahora, si vienes de Admin con modo edición, saltamos el inicio
          if (mode === 'admin-edit') {
             this.mostrarOpcionesInicio = false;
             this.modoEdicion = true;
             // Aquí deberías cargar la cotización por ID. 
             // Como tu método buscarPorCodigo usa string, y getById usa ID, asegúrate de cual usar.
             // Si no tienes getById público, tendrás que implementarlo o usar el flujo de código.
          }
        }
      });
    }
  }

  // --- 5. Carga Inicial y Lógica de Usuario ---
  private cargarDatosIniciales(): void {
    // Cargar catálogos siempre
    this.cotizacionService.getPacksDisponibles().subscribe(packs => this.packs = packs);
    this.cuelloService.getAllCuellos().subscribe(cuellos => this.cuellosDisponibles = cuellos);

    // Lógica de Cliente vs Admin
    if (this.esAdmin) {
      // ✅ CASO ADMIN: Habilitar formulario para escritura manual
      this.cotizacionForm.get('clienteInfo')?.enable();
      this.cotizacionForm.get('clienteInfo')?.reset(); // Limpio para nuevo cliente
    } else {
      // ✅ CASO CLIENTE: Cargar datos del usuario logueado y bloquear
      this.cotizacionService.getMiInformacion().subscribe(userInfo => {
        this.cotizacionForm.get('clienteInfo')?.patchValue({
          nombre: userInfo.nombre,
          apellido: userInfo.apellidoPaterno, // Ajusta según tu modelo
          email: userInfo.email,
          celular: userInfo.celular
        });
        this.cotizacionForm.get('clienteInfo')?.disable(); // Solo lectura
      });
    }
  }

  // --- 6. Métodos de Flujo ---

  iniciarNuevaCotizacion(): void {
    this.resetearSeleccionPack();
    this.mostrarOpcionesInicio = false;
    this.modoEdicion = false;
    
    // Si es admin, limpia el cliente. Si es cliente, recarga sus datos.
    this.cargarDatosIniciales(); 
  }

  buscarCotizacion(): void {
    if (this.codigoBusquedaControl.invalid) return;

    const codigo = this.codigoBusquedaControl.value?.trim().toUpperCase();
    this.cargandoBusqueda = true;

    this.cotizacionService.buscarPorCodigo(codigo!).subscribe({
      next: (payload) => {
        this.cargandoBusqueda = false;
        this.mostrarOpcionesInicio = false;
        this.modoEdicion = true;
        this.cargarDatosEnFormulario(payload);
        this.snackBar.open('Cotización cargada exitosamente', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.cargandoBusqueda = false;
        console.error(err);
        this.snackBar.open('No se encontró una cotización con ese código.', 'Cerrar', { duration: 5000 });
      }
    });
  }

  volverAlInicio(): void {
    this.mostrarOpcionesInicio = true;
    this.resetearSeleccionPack();
    this.codigoBusquedaControl.reset();
    this.modoEdicion = false;
  }

  // --- 7. Lógica de Formulario ---

  private cargarDatosEnFormulario(payload: CotizacionPayload): void {
    // 1. Seleccionar Pack
    this.onPackSeleccionado(payload.packId);

    // 2. Esperar carga de dependencias
    setTimeout(() => {
      // 3. Rellenar campos
      this.cotizacionForm.patchValue({
        clienteInfo: payload.clienteInfo, // Sobrescribe datos si vienen de la cotización
        cuelloId: payload.cuelloId,
        seleccionTelas: payload.seleccionTelas,
        configuraciones: {
          conMangasLargas: payload.conMangasLargas,
          conBolsillos: payload.conBolsillos
        }
      });

      // Si estamos editando y es Admin, aseguramos que los datos del cliente sean editables si se desea
      // o mantenerlos como vinieron. Generalmente en edición se ven los datos guardados.
      if (this.esAdmin) {
         this.cotizacionForm.get('clienteInfo')?.enable();
      }

      // 4. Reconstruir Arrays
      this.tallasArray.clear();
      payload.tallas.forEach(t => this.tallasArray.push(this.crearGrupoTalla(t.talla, t.cantidad)));

      this.sponsorsArray.clear();
      if (payload.sponsors) {
        payload.sponsors.forEach(s => this.sponsorsArray.push(this.crearGrupoSponsor(s.tecnica, s.descripcion)));
      }

      this.cotizacionForm.updateValueAndValidity();
    }, 600);
  }

  onPackSeleccionado(packId: number): void {
    if (this.packSeleccionado?.id === packId && this.telasDisponibles.superior.length > 0) return;
    
    if (this.packSeleccionado?.id === packId && !this.modoEdicion) { 
      this.resetearSeleccionPack();
      return;
    }

    this.cotizacionForm.get('packId')?.setValue(packId);

    this.cotizacionService.getPackDetalle(packId).subscribe(detalle => {
      this.packSeleccionado = detalle;
      this.cargarTelasPorPackSeleccionado(packId);
      this.actualizarValidadoresDinamicos();
    });
  }

  // ... (Métodos de Modales: abrirDetallePack, abrirDetalleImagen, seleccionarPackDesdeModal SIGUEN IGUAL) ...
  abrirDetallePack(pack: PackPublico, event: MouseEvent): void {
    event.stopPropagation();
    this.dialog.open(this.packDetalleModal, { width: '700px', data: pack });
  }

  abrirDetalleImagen(componente: any, event: MouseEvent): void {
    event.stopPropagation();
    if (componente.imagenes?.length > 0) {
      this.dialog.open(this.imagenDetalleModal, { width: '600px', data: componente });
    }
  }

  seleccionarPackDesdeModal(packId: number): void {
    this.onPackSeleccionado(packId);
    this.dialog.closeAll();
  }

  // --- 8. Validar e Ir al Resumen ---

  irAResumen(): void {
    if (this.cotizacionForm.invalid) {
      this.cotizacionForm.markAllAsTouched();
      this.snackBar.open('Por favor, completa todos los campos requeridos.', 'Cerrar', { duration: 3000 });
      return;
    }

    const { desglosePorTalla, totalFinal, selecciones } = this.calcularDesgloseDetallado();

    // ✅ USAR getRawValue() para incluir campos deshabilitados (como datos de cliente)
    const payload = this.cotizacionForm.getRawValue() as CotizacionPayload;

    this.cacheService.setDatos({
      payload: payload,
      selecciones: selecciones,
      desglosePorTalla: desglosePorTalla,
      totalFinal: totalFinal
    });

    this.router.navigate(['/detalle-cotizacion']);
  }

  // ... (Métodos auxiliares de form arrays y cálculos SIGUEN IGUAL) ...
  
  agregarTalla(): void { this.tallasArray.push(this.crearGrupoTalla()); }
  removerTalla(index: number): void { if (this.tallasArray.length > 1) this.tallasArray.removeAt(index); }
  agregarSponsor(): void { this.sponsorsArray.push(this.crearGrupoSponsor()); }
  removerSponsor(index: number): void { this.sponsorsArray.removeAt(index); }

  obtenerTelasPorParte(parte: 'superior' | 'inferior'): TelaInfo[] {
    if (!this.packSeleccionado) return [];
    return parte === 'superior' ? this.telasDisponibles.superior : this.telasDisponibles.inferior;
  }

  private cargarTelasPorPackSeleccionado(packId: number): void {
    this.cotizacionService.getTelasSugeridasPorPack(packId).subscribe({
      next: (data) => {
        this.telasDisponibles.superior = data.superior || [];
        this.telasDisponibles.inferior = data.inferior || [];
      },
      error: (err) => console.error("Error telas", err)
    });
  }

  private actualizarValidadoresDinamicos(): void {
    const cuelloControl = this.cotizacionForm.get('cuelloId');
    const supControl = this.cotizacionForm.get('seleccionTelas.superior.telaSeleccionada');
    const infControl = this.cotizacionForm.get('seleccionTelas.inferior.telaSeleccionada');

    if (this.packSeleccionado?.incluyeParteSuperior) {
      cuelloControl?.setValidators(Validators.required);
      supControl?.setValidators(Validators.required);
    } else {
      cuelloControl?.clearValidators();
      supControl?.clearValidators();
    }

    if (this.packSeleccionado?.incluyeParteInferior) {
      infControl?.setValidators(Validators.required);
    } else {
      infControl?.clearValidators();
    }
    
    cuelloControl?.updateValueAndValidity();
    supControl?.updateValueAndValidity();
    infControl?.updateValueAndValidity();
  }

  private resetearSeleccionPack(): void {
    this.packSeleccionado = null;
    const clienteInfo = this.cotizacionForm.get('clienteInfo')?.value;
    this.cotizacionForm.reset({ clienteInfo: clienteInfo });
    this.tallasArray.clear();
    this.tallasArray.push(this.crearGrupoTalla());
    this.sponsorsArray.clear();
    this.telasDisponibles = { superior: [], inferior: [] };
    this.actualizarValidadoresDinamicos();
  }

  private calcularDesgloseDetallado(): {
    desglosePorTalla: DesgloseTallaItem[],
    totalFinal: number,
    selecciones: SeleccionesVisibles
  } {
    const formValue = this.cotizacionForm.getRawValue();

    // Costo Unitario Base
    const packPrecio = this.packSeleccionado!.precio;
    const cuello = this.cuellosDisponibles.find(c => c.id === formValue.cuelloId);
    const precioCuello = cuello?.precio || 0;
    const precioMangas = formValue.configuraciones.conMangasLargas ? 15 : 0;
    const precioBolsillos = formValue.configuraciones.conBolsillos ? 5 : 0;

    const precioSponsorsUnitario = formValue.configuraciones.sponsors.reduce((sum: number, sponsor: SponsorPayload) => {
      switch (sponsor.tecnica) {
        case TipoSponsorTecnica.BORDADO: return sum + 10;
        case TipoSponsorTecnica.SIZER: return sum + 10;
        case TipoSponsorTecnica.DTF: return sum + 5;
        default: return sum;
      }
    }, 0);

    const precioBaseUnitario = packPrecio + precioCuello + precioMangas + precioBolsillos + precioSponsorsUnitario;

    // Desglose Tallas
    const desglosePorTalla: DesgloseTallaItem[] = [];
    let totalFinal = 0;

    formValue.tallas.forEach((item: TallaCantidad) => {
      if (!item.talla || !item.cantidad || item.cantidad <= 0) return;

      const tallaUpper = item.talla.toUpperCase();
      let ajusteTalla = 0;

      if (['XXXL', 'XXXXXL', 'XXXXXXL'].includes(tallaUpper)) ajusteTalla = 10;
      else {
        try { if (parseInt(tallaUpper) <= 8) ajusteTalla = -10; } catch (e) {}
      }

      const precioUnitarioFinal = precioBaseUnitario + ajusteTalla;
      const subtotal = precioUnitarioFinal * item.cantidad;

      desglosePorTalla.push({
        talla: tallaUpper,
        cantidad: item.cantidad,
        precioUnitario: precioUnitarioFinal,
        subtotal: subtotal
      });
      totalFinal += subtotal;
    });

    // Visibles
    const telaSup = this.telasDisponibles.superior.find(t => t.id === formValue.seleccionTelas.superior.telaSeleccionada);
    const telaInf = this.telasDisponibles.inferior.find(t => t.id === formValue.seleccionTelas.inferior.telaSeleccionada);

    const selecciones: SeleccionesVisibles = {
      packNombre: this.packSeleccionado!.nombre,
      packPrecio: this.packSeleccionado!.precio,
      telaSuperior: telaSup?.nombreMaterial,
      telaInferior: telaInf?.nombreMaterial,
      cuello: cuello,
      conMangasLargas: formValue.configuraciones.conMangasLargas,
      conBolsillos: formValue.configuraciones.conBolsillos,
      sponsors: formValue.configuraciones.sponsors
    };

    return { desglosePorTalla, totalFinal, selecciones };
  }

  private crearGrupoTalla(talla: string = '', cantidad: number = 1): FormGroup {
    return this.fb.group({
      talla: [talla, Validators.required],
      cantidad: [cantidad, [Validators.required, Validators.min(1)]]
    });
  }

  private crearGrupoSponsor(tecnica: TipoSponsorTecnica | null = null, descripcion: string = ''): FormGroup {
    return this.fb.group({
      tecnica: [tecnica, Validators.required],
      descripcion: [descripcion, Validators.required]
    });
  }
}