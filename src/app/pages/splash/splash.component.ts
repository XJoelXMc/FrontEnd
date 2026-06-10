import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})
export class SplashComponent implements OnInit, AfterViewInit {
  @ViewChild('statsSection') statsSection!: ElementRef;

  images = [
    'https://res.cloudinary.com/duwi3jylx/image/upload/v1748991601/PORTADA_1_ie6z4c.jpg',
    'https://res.cloudinary.com/duwi3jylx/image/upload/v1748990297/PORTADA_3_jny8bb.jpg',
    'https://res.cloudinary.com/duwi3jylx/image/upload/v1748990295/PORTADA_2_vczz3q.jpg',
    'https://res.cloudinary.com/duwi3jylx/image/upload/v1748990296/PORTADA_4_szhip4.jpg'
  ];

  features = [
    {
      icon: 'shopping_cart',
      title: 'Compra Online',
      description: 'Evita complicaciones y compra con mayor comodidad desde nuestra web.'
    },
    {
      icon: 'alarm',
      title: 'Pedidos a Tiempo',
      description: 'Realiza tu pedido y lo tendrás sin problemas de retraso.'
    },
    {
      icon: 'track_changes',
      title: 'Seguimiento en Tiempo Real',
      description: 'Te notificamos constantemente sobre el estado de tu pedido.'
    },
    {
      icon: 'local_shipping',
      title: 'Envío Rápido',
      description: 'Recibe tus productos en tiempo récord con nuestro servicio express.'
    }
  ];

  stats = [
    { value: 10000, label: 'Clientes Satisfechos', displayValue: 0, animated: false },
    { value: 5000, label: 'Pedidos Entregados', displayValue: 0, animated: false },
    { value: 98, label: 'Tasa de Satisfacción', displayValue: 0, animated: false },
    { value: 24, label: 'Horas de Soporte', displayValue: 0, animated: false }
  ];

  currentIndex = 0;
  intervalId: any;
  private statsAnimated = false;

  ngOnInit() {
    this.startAutoSlide();
  }

  ngAfterViewInit() {
    this.checkStatsVisibility();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkStatsVisibility();
  }

  checkStatsVisibility() {
    if (this.statsAnimated) return;

    if (this.statsSection) {
      const rect = this.statsSection.nativeElement.getBoundingClientRect();
      const isVisible = (rect.top <= window.innerHeight * 0.8) && (rect.bottom >= 0);
      
      if (isVisible) {
        this.animateStats();
        this.statsAnimated = true;
      }
    }
  }

  animateStats() {
    this.stats.forEach((stat, index) => {
      setTimeout(() => {
        this.animateValue(stat, index);
      }, index * 300);
    });
  }

  animateValue(stat: any, index: number) {
    const duration = 2000;
    const steps = 60;
    const increment = stat.value / steps;
    const stepTime = duration / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      stat.displayValue = Math.floor(current);
      
      if (current >= stat.value) {
        stat.displayValue = stat.value;
        clearInterval(timer);
      }
    }, stepTime);
  }

  get currentImage(): string {
    return this.images[this.currentIndex];
  }

  getSlideTitle(index: number): string {
    const titles = [
      'Colección Running Pro',
      'Línea Fitness Premium',
      'Equipamiento Deportivo',
      'Ropa Deportiva Sostenible'
    ];
    return titles[index] || 'Nueva Colección';
  }

  getSlideDescription(index: number): string {
    const descriptions = [
      'Tecnología de última generación para corredores profesionales',
      'Diseño ergonómico y materiales premium para tu entrenamiento',
      'Todo lo que necesitas para practicar tu deporte favorito',
      'Comprometidos con el medio ambiente sin sacrificar rendimiento'
    ];
    return descriptions[index] || 'Descubre nuestra nueva colección';
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
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.startAutoSlide();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}