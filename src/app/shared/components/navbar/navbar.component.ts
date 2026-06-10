import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs'; // Import Subscription

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  rolUsuario: string = '';
  opcionesSeleccion: string[] = [];

  // This will hold our subscription so we can clean it up later
  private authSubscription!: Subscription;

  iconosOpciones: { [key: string]: string } = {
    'Modelo de prendas deportivas': 'checkroom',
    'Gestionar pedido': 'shopping_cart',
    'Controlar pedido': 'assignment_turned_in',
    'Gestión de pagos': 'payment',
    'Gestión de ventas': 'sell',
    'Gestión de empleados': 'groups',
    'Gestión de proveedores': 'local_shipping',
    'Gestionar Roles': 'admin_panel_settings',
    'Gestión de inventario': 'inventory',
    'Gestionar Packs y Moldes': 'dashboard_customize',
    'Reportes': 'bar_chart'
  };
  
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.authStatus$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      
      if (isLoggedIn) {
        const rol = this.authService.getRol();
        this.rolUsuario = rol || 'CLIENTE';
        this.cargarOpcionesPorRol(this.rolUsuario);
      } else {
        this.rolUsuario = '';
        this.opcionesSeleccion = [];
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  cargarOpcionesPorRol(rol: string) {
    switch (rol) {
      case 'ADMINISTRADOR':
        this.opcionesSeleccion = [
          'Modelo de prendas deportivas',
          'Gestionar pedido',
          'Controlar pedido',
          'Gestión de pagos',
          'Gestión de ventas',
          'Gestionar Packs y Moldes',
          'Reportes',
          'Dashboard'
        ];
        break;
      case 'DUENO':
        this.opcionesSeleccion = [
          'Modelo de prendas deportivas',
          'Gestionar pedido',
          'Controlar pedido',
          'Gestión de pagos',
          'Gestión de ventas',
          'Gestión de empleados',
          'Gestión de proveedores',
          'Gestionar Roles',
          'Gestión de inventario',
          'Gestionar Packs y Moldes',
          'Reportes',
          'Dashboard'
        ];
        break;
      case 'CLIENTE':
      default:
        this.opcionesSeleccion = [
          'Modelo de prendas deportivas',
          'Gestionar pedido',
          'Controlar pedido',
          'Gestión de pagos'
        ];
    }
  }
  
  getRutaPorOpcion(opcion: string): string {
    switch (opcion) {
      case 'Modelo de prendas deportivas':
        return '/gestion-ventas';
      case 'Gestión de empleados':
        return '/gestion-empleados';
      case 'Gestión de proveedores':
        return '/gestion-proveedores';
      case 'Gestión de inventario':
        return '/gestion-Inventario';
      case 'Gestionar pedido':
        return '/crearCotizacion';
      case 'Gestionar Packs y Moldes':
        return '/gestion-packs';
      case 'Controlar pedido':
        return '/controlarPedido';
      default:
        return '/home';
        case 'Dashboard':
        return '/dashboard';
    }
  }
  ngOnDestroy() {
    // It's a good practice to unsubscribe to prevent memory leaks.
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}