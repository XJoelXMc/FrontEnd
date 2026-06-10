import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';

// Servicios
import { PersonalizacionService } from '../../../../services/personalizacion.service';

// Modelos
import { 
  DatosPersonalizacionDTO, 
  CrearPedidoDTO, 
  LogoPosicionDTO, 
  TallaCantidadDTO,
  JugadorDetalleDTO
} from '../../../../models/personalizacion.model';

// Interfaces internas para el manejo visual
interface LienzoMolde {
  idUnico: string; // Identificador único para el DOM (ej: molde_1_vista_0)
  moldeId: number;
  nombre: string;  // Ej: "Camiseta (Vista 1)"
  urlImagen: string;
}

interface LogoEnLienzo {
  id: number;      // Timestamp único temporal para el frontend
  url: string;
  x: number;
  y: number;
  lienzoId: string; // Vinculación con el ID del lienzo
}

@Component({
  selector: 'app-personalizacion',
  templateUrl: './personalizacion.component.html',
  styleUrls: ['./personalizacion.component.scss'],
})
export class PersonalizacionComponent implements OnInit {

  // Datos del Backend
  datosBackend: DatosPersonalizacionDTO | null = null;
  cotizacionId: number = 0;

  // Estructuras Visuales
  lienzos: LienzoMolde[] = []; 
  logosDisponibles: string[] = []; 
  logosColocados: LogoEnLienzo[] = [];

  // Formulario y Estado
  planillaForm: FormGroup;
  enviando: boolean = false;       // Spinner para guardar pedido
  subiendoImagen: boolean = false; // Spinner para subir logo

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private personalizacionService: PersonalizacionService,
    private snackBar: MatSnackBar
  ) {
    this.planillaForm = this.fb.group({
      jugadores: this.fb.array([])
    });
  }

  // Getter para facilitar el acceso en el HTML
  get jugadoresArray(): FormArray {
    return this.planillaForm.get('jugadores') as FormArray;
  }

  ngOnInit(): void {
    // Obtener ID de la URL (ej: /personalizaTuPedido/15)
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        this.cotizacionId = +idStr;
        this.cargarDatos(this.cotizacionId);
      } else {
        this.snackBar.open('Error: No se identificó la cotización', 'Cerrar');
        this.router.navigate(['/mis-cotizaciones']);
      }
    });
  }

  /**
   * Consume el servicio para traer datos iniciales (Pack, Tallas, y Datos Guardados si existen)
   */
  cargarDatos(id: number): void {
    this.personalizacionService.obtenerDatosParaPersonalizar(id).subscribe({
      next: (data) => {
        this.datosBackend = data;
        
        // 1. Preparar los lienzos (imágenes de fondo)
        this.prepararLienzos(data);

        // 2. Lógica de Recuperación: JUGADORES
        // Si el backend devuelve jugadores guardados, los cargamos. Si no, generamos filas vacías.
        if (data.jugadoresGuardados && data.jugadoresGuardados.length > 0) {
          this.cargarJugadoresExistentes(data.jugadoresGuardados);
        } else {
          this.generarTablaJugadores(data.desgloseTallas);
        }

        // 3. Lógica de Recuperación: LOGOS
        if (data.logosGuardados && data.logosGuardados.length > 0) {
          this.restaurarLogos(data.logosGuardados);
        }
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al cargar datos del servidor', 'Cerrar');
      }
    });
  }

  // ==============================================================
  // MÉTODOS DE PREPARACIÓN DE DATOS
  // ==============================================================

  private prepararLienzos(data: DatosPersonalizacionDTO): void {
    this.lienzos = [];
    
    // A. Procesar Moldes del Pack (pueden tener múltiples vistas)
    data.moldes.forEach(molde => {
      molde.urlsImagenes.forEach((url, index) => {
        this.lienzos.push({
          idUnico: `m_${molde.id}_${index}`,
          moldeId: molde.id,
          nombre: `${molde.nombre} (Vista ${index + 1})`, // Nombre único para identificar al guardar
          urlImagen: url
        });
      });
    });

    // B. Procesar Cuello (si existe)
    if (data.cuello && data.cuello.urlImagen) {
      this.lienzos.push({
        idUnico: `c_${data.cuello.id}`,
        moldeId: data.cuello.id,
        nombre: `Cuello: ${data.cuello.nombre}`,
        urlImagen: data.cuello.urlImagen
      });
    }
  }

  // ==============================================================
  // MÉTODOS PARA LA TABLA DE JUGADORES (NÓMINA)
  // ==============================================================

  /** CASO A: Genera filas vacías basadas en tallas (Nuevo Pedido) */
  generarTablaJugadores(desglose: TallaCantidadDTO[]): void {
    this.jugadoresArray.clear();
    desglose.forEach(item => {
      for (let i = 0; i < item.cantidad; i++) {
        this.addJugador(item.talla, '', ''); 
      }
    });
  }

  /** CASO B: Genera filas con datos (Edición de Pedido) */
  cargarJugadoresExistentes(jugadores: JugadorDetalleDTO[]): void {
    this.jugadoresArray.clear();
    jugadores.forEach(j => {
      this.addJugador(j.talla, j.nombre, j.numero);
    });
  }

  /** Helper común para agregar al FormArray */
  private addJugador(talla: string, nombre: string, numero: string): void {
    const grupo = this.fb.group({
      talla: [talla, Validators.required],
      nombre: [nombre, Validators.required], // Puedes quitar Validators.required si permites vacíos
      numero: [numero, Validators.required]
    });
    this.jugadoresArray.push(grupo);
  }

  // ==============================================================
  // LÓGICA DE LOGOS (SUBIDA, ARRASTRE Y RESTAURACIÓN)
  // ==============================================================

  /** Sube el archivo a Cloudinary (Cuenta Secundaria) */
  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.subiendoImagen = true;
      const file = files[0]; // Subimos el primero
      
      this.personalizacionService.subirLogo(file).subscribe({
        next: (res) => {
          this.logosDisponibles.push(res.url); 
          this.subiendoImagen = false;
          this.snackBar.open('Logo subido correctamente', 'OK', { duration: 2000 });
        },
        error: (err) => {
          console.error(err);
          this.subiendoImagen = false;
          this.snackBar.open('Error al subir el logo', 'Cerrar');
        }
      });
    }
  }

  /** Evento al soltar el logo (Drag & Drop) */
  onDragEnded(event: CdkDragEnd, lienzoId: string, logoUrl: string): void {
    const element = event.source.getRootElement();
    const elementRect = element.getBoundingClientRect();
    const parentPosition = element.parentElement!.getBoundingClientRect();

    // 1. Calcular posición en píxeles relativos al padre
    let xPixels = elementRect.x - parentPosition.x;
    let yPixels = elementRect.y - parentPosition.y;

    // 2. Obtener dimensiones del padre (El molde)
    const widthParent = parentPosition.width;
    const heightParent = parentPosition.height;

    // 3. ✅ CONVERTIR A PORCENTAJE (0 a 100)
    // Esto hace que la posición sea RESPONSIVE
    let xPercent = (xPixels / widthParent) * 100;
    let yPercent = (yPixels / heightParent) * 100;

    // Corrección de límites (0% a 100%)
    if (xPercent < 0) xPercent = 0;
    if (yPercent < 0) yPercent = 0;
    // Opcional: Limitar al máximo (ej: 90% para que no se salga por la derecha)

    console.log(`Logo en ${lienzoId}: ${xPercent.toFixed(2)}%, ${yPercent.toFixed(2)}%`);

    // 4. Guardar en el array
    // Buscamos si ya existe ese logo en el array para actualizarlo, o lo agregamos
    // (Tu lógica actual agregaba uno nuevo cada vez que soltabas, lo cual duplica logos al moverlos)
    
    // Nota: Aquí asumo que quieres actualizar la posición del logo que acabas de mover.
    // Como tu 'logosColocados' tiene IDs temporales, lo ideal es actualizar ese objeto.
    
    // Para simplificar y mantener tu lógica de "push", asegúrate de que al guardar el pedido
    // o al renderizar, uses estos valores como %.
    
    // Sin embargo, para corregir el error visual inmediato, necesitamos actualizar el objeto actual:
    // Pero como el evento DragEnd de CDK no nos da fácil el ID de tu modelo interno,
    // vamos a asumir que estás agregando uno nuevo o actualizando.
    
    // CORRECCIÓN RECOMENDADA: Actualizar el logo existente en vez de hacer push
    // Pero si mantienes el push, asegúrate de limpiar duplicados o manejarlo.
    
    this.logosColocados.push({
        id: Date.now(),
        url: logoUrl,
        x: xPercent, // ✅ GUARDAMOS %
        y: yPercent, // ✅ GUARDAMOS %
        lienzoId: lienzoId
    });
    
    // IMPORTANTE: Reseteamos la transformación CSS del arrastre para que el [style.top.%] tome el control
    event.source.reset();
  }
  
  /** Botón "Usar en..." */
  usarLogoEnMolde(logoUrl: string, lienzoId: string): void {
      this.logosColocados.push({
          id: Date.now(),
          url: logoUrl,
          x: 40, // 40% (Centro aproximado)
          y: 20, // 20% (Pecho aproximado)
          lienzoId: lienzoId
      });
  }

  eliminarLogoColocado(logoId: number): void {
    this.logosColocados = this.logosColocados.filter(l => l.id !== logoId);
  }

  /** CASO B: Restaura los logos guardados en sus posiciones */
  restaurarLogos(logosGuardados: any[]): void {
    this.logosColocados = [];
    
    logosGuardados.forEach(logoDTO => {
      // Buscamos el lienzo que coincida con moldeId Y nombreImagen
      const lienzo = this.lienzos.find(l => 
        l.moldeId === logoDTO.moldeId && l.nombre === logoDTO.nombreImagen
      );

      if (lienzo) {
        this.logosColocados.push({
          id: Date.now() + Math.random(), // ID temporal
          url: logoDTO.logoUrl,
          x: logoDTO.x,
          y: logoDTO.y,
          lienzoId: lienzo.idUnico
        });

        // Añadir a la lista lateral si no está visible
        if (!this.logosDisponibles.includes(logoDTO.logoUrl)) {
          this.logosDisponibles.push(logoDTO.logoUrl);
        }
      }
    });
  }

  // ==============================================================
  // GUARDADO FINAL
  // ==============================================================

  guardarPedido(): void {
      if (this.planillaForm.invalid) {
          this.snackBar.open('Por favor completa los nombres y números.', 'Cerrar', { duration: 3000 });
          this.planillaForm.markAllAsTouched();
          return;
      }

      if (this.logosColocados.length === 0) {
        if(!confirm("No has colocado logos. ¿Estás seguro de continuar sin diseño visual?")) return;
      }

      this.enviando = true;

      // 1. Mapear Logos Visuales -> DTO Backend
      const posicionesDTO: LogoPosicionDTO[] = this.logosColocados.map(logo => {
        const lienzo = this.lienzos.find(l => l.idUnico === logo.lienzoId);
        return {
          moldeId: lienzo ? lienzo.moldeId : 0,
          nombreImagen: lienzo ? lienzo.nombre : 'Desconocido', // Clave para restaurar después
          logoUrl: logo.url,
          x: logo.x,
          y: logo.y,
          ancho: 100
        };
      });

      // 2. Construir Payload
      const payload: CrearPedidoDTO = {
          cotizacionId: this.cotizacionId,
          posicionesLogos: posicionesDTO,
          listaJugadores: this.planillaForm.value.jugadores
      };

      // 3. Enviar al Backend
      this.personalizacionService.crearPedido(payload).subscribe({
        next: (res) => {
          this.enviando = false;
          this.snackBar.open('¡Pedido guardado exitosamente!', 'OK', { duration: 5000 });
          // Redirigir al dashboard del pedido
          // this.router.navigate(['/controlar-pedido']); 
          // O volver atrás:
          window.history.back();
        },
        error: (err) => {
          this.enviando = false;
          console.error(err);
          this.snackBar.open('Error al guardar el pedido.', 'Cerrar');
        }
      });
  }
}