import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResumenPedidoDTO } from '../../../../models/personalizacion.model';
import { getUserRoleFromToken } from '../../../../Utils/jwt.utils';
import { ControlarPedidoService } from '../../../../services/controlar-pedido.service';

@Component({
  selector: 'app-controlar-pedido',
  templateUrl: './controlar-pedido.component.html',
  styleUrls: ['./controlar-pedido.component.scss']
})
export class ControlarPedidoComponent implements OnInit {
  // --- 1. Estado del Usuario ---
  rolUsuario: string | null = '';
  esAdmin: boolean = false;
  // --- 2. Estado para VISTA CLIENTE (Buscador) ---
  codigoControl = new FormControl('', [Validators.required, Validators.minLength(5)]);
  resultadoBusqueda: ResumenPedidoDTO | null = null; // Aquí se guarda lo que devuelve el backend
  buscando: boolean = false;
  // --- 3. Estado para VISTA ADMIN (Tabla) ---
  listaPedidos: ResumenPedidoDTO[] = [];
  columnasTabla: string[] = ['codigo', 'cliente', 'pack', 'total', 'estado', 'acciones'];
  constructor(
    private pedidoService: ControlarPedidoService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // A. Obtener Rol del Token
    this.rolUsuario = getUserRoleFromToken();
    // B. Determinar si es Admin o Dueño
    // (Ajusta los strings según como los guardes en tu BD: 'ROLE_ADMIN', 'ADMINISTRADOR', etc.)
    this.esAdmin = this.rolUsuario === 'ADMINISTRADOR' || this.rolUsuario === 'DUENO';

    // C. Si es Admin, cargar la tabla inmediatamente
    if (this.esAdmin) {
      this.cargarListaAdmin();
    }
  }

  // ==========================================
  // 🕵️ LÓGICA CLIENTE: BUSCAR POR CÓDIGO
  // ==========================================
  buscarPedido(): void {
    if (this.codigoControl.invalid) return;

    this.buscando = true;
    this.resultadoBusqueda = null; // Limpiar resultado anterior
    const codigo = this.codigoControl.value?.toUpperCase() || '';

    this.pedidoService.buscarPorCodigo(codigo).subscribe({
      next: (data) => {
        this.resultadoBusqueda = data;
        this.buscando = false;
      },
      error: (err) => {
        this.buscando = false;
        console.error(err);
        this.snackBar.open('No se encontró ninguna cotización con ese código.', 'Cerrar', { duration: 4000 });
      }
    });
  }

  // ==========================================
  // 👮 LÓGICA ADMIN: LISTAR TODO
  // ==========================================
  cargarListaAdmin(): void {
    this.pedidoService.listarTodosLosPedidos().subscribe({
      next: (data) => {
        this.listaPedidos = data;
      },
      error: (err) => {
        console.error('Error cargando la lista de pedidos', err);
        this.snackBar.open('Error al cargar la lista de pedidos.', 'Cerrar');
      }
    });
  }

  // ==========================================
  // 🚀 NAVEGACIÓN (Común para ambos roles)
  // ==========================================

  /**
   * Acción: "Modificar Cantidades / Ver Cotización"
   * Redirige al formulario de cotización en modo edición.
   */
  irAModificarCotizacion(cotizacionId: number): void {
    // Vamos a la ruta: /crear-cotizacion/:id
    // El CrearCotizacionComponent detectará el ID y cargará los datos.
    this.router.navigate(['/crear-cotizacion', cotizacionId]);
  }

  /**
   * Acción: "Personalizar / Modificar Diseño"
   * Redirige al diseñador visual.
   * El backend sabrá si cargar logos existentes o lienzo limpio.
   */
  irAPersonalizacion(cotizacionId: number): void {
    // Vamos a la ruta: /personalizaTuPedido/:id
    this.router.navigate(['/personalizaTuPedido', cotizacionId]);
  }
}