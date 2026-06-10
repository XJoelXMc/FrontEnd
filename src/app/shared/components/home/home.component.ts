// home.component.ts (actualizado)
import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  rolUsuario: string = '';
  opcionesSeleccion: string[] = [];

  images = [
    'https://res.cloudinary.com/duwi3jylx/image/upload/v1748991601/PORTADA_1_ie6z4c.jpg',
    'https://res.cloudinary.com/duwi3jylx/image/upload/v1748990297/PORTADA_3_jny8bb.jpg',
    'https://res.cloudinary.com/duwi3jylx/image/upload/v1748990295/PORTADA_2_vczz3q.jpg',
    'https://res.cloudinary.com/duwi3jylx/image/upload/v1748990296/PORTADA_4_szhip4.jpg'
  ];

  categories = [
    {
      name: 'Running',
      icon: 'directions_run',
      description: 'Equipamiento especializado para corredores'
    },
    {
      name: 'Fitness',
      icon: 'fitness_center',
      description: 'Ropa y accesorios para entrenamiento'
    },
    {
      name: 'Deportes de Equipo',
      icon: 'sports_soccer',
      description: 'Uniformes y equipamiento para equipos'
    },
    {
      name: 'Yoga',
      icon: 'self_improvement',
      description: 'Ropa cómoda para yoga y pilates'
    }
  ];

  benefits = [
    {
      icon: 'local_shipping',
      title: 'Envío Gratis',
      description: 'En compras superiores a $50.000'
    },
    {
      icon: 'autorenew',
      title: 'Devoluciones',
      description: '30 días para cambiar tu producto'
    },
    {
      icon: 'security',
      title: 'Pago Seguro',
      description: 'Transacciones 100% protegidas'
    },
    {
      icon: 'support_agent',
      title: 'Soporte 24/7',
      description: 'Estamos aquí para ayudarte'
    }
  ];

  currentIndex = 0;
  intervalId: any;
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    const rol = localStorage.getItem('rol');
    this.rolUsuario = rol === 'ADMINISTRADOR' || rol === 'DUENO' || rol === 'CLIENTE' ? rol : 'CLIENTE';
    this.cargarOpcionesPorRol(this.rolUsuario);
    this.startAutoSlide();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.handleScrollAnimations();
  }

  handleScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(element => {
      const position = element.getBoundingClientRect();
      if (position.top < window.innerHeight * 0.8) {
        element.classList.add('animated');
      }
    });
  }

  scrollToProducts() {
    const element = document.querySelector('.carousel-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  }

  getSlideTitle(index: number): string {
    const titles = [
      'Nueva Colección Running 2024',
      'Tecnología Deportiva Avanzada',
      'Equipamiento Profesional',
      'Ropa Deportiva Sostenible'
    ];
    return titles[index] || 'Nueva Colección';
  }

  getSlideDescription(index: number): string {
    const descriptions = [
      'Descubre nuestra línea de running con tecnología de última generación',
      'Innovación y confort para alcanzar tu máximo rendimiento',
      'Equipamiento diseñado por atletas profesionales',
      'Comprometidos con el medio ambiente y tu rendimiento'
    ];
    return descriptions[index] || 'Explora nuestra colección';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    this.router.navigate(['']);
  }

  cargarOpcionesPorRol(rol: string) {
    switch (rol) {
      case 'ADMINISTRADOR':
        this.opcionesSeleccion = [
          'Gestionar pedido',
          'Controlar pedido',
          'Gestión de pagos',
          'Gestión de ventas',
          'Reportes'
        ];
        break;
      case 'DUENO':
        this.opcionesSeleccion = [
          'Gestionar pedido',
          'Controlar pedido',
          'Gestión de pagos',
          'Gestión de ventas',
          'Gestión de empleados',
          'Gestión de proveedores',
          'Gestionar Roles',
          'Gestión de inventario',
          'Reportes'
        ];
        break;
      case 'CLIENTE':
      default:
        this.opcionesSeleccion = [
          'Gestionar pedido',
          'Controlar pedido',
          'Gestión de ventas',
          'Gestión de pagos'
        ];
    }
  }

  get currentImage(): string {
    return this.images[this.currentIndex];
  }

  prevImage() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.resetAutoSlide();
  }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.resetAutoSlide();
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.resetAutoSlide();
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => this.nextImage(), 5000);
  }

  resetAutoSlide() {
    clearInterval(this.intervalId);
    this.startAutoSlide();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
  
  getRutaPorOpcion(opcion: string): string {
    switch (opcion) {
      case 'Gestión de ventas':
        return '/gestion-ventas';
      default:
        return '/home';
    }
  }
}