import { Component, OnInit, ViewChildren, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChartConfiguration, ChartData, ChartEvent, ChartType, Chart, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Router } from '@angular/router';

import { ChartType as GoogleChartType } from 'angular-google-charts';

import { DashboardStatsDTO, StockMaterialDTO } from '../../../models/DashboardStats';
import { ResumenPedidoDTO } from '../../../models/personalizacion.model';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective> | undefined;
  @ViewChild('detallePedidosModal') detallePedidosModal!: TemplateRef<any>;
  @ViewChild('detalleMaterialModal') detalleMaterialModal!: TemplateRef<any>;


  metrics: DashboardStatsDTO | null = null;
  isLoading = true;

  filtroStock: 'TODOS' | 'LOW_STOCK' | 'SUFFICIENT' = 'TODOS';
  public sankeyType = GoogleChartType.Sankey;
  sankeyData: Array<[string, string, number]> = []; 
  
  public sankeyOptions = {
    sankey: {
      node: { 
        label: { fontName: 'Inter', fontSize: 13, color: '#ffffff', bold: true },
        nodePadding: 30,
        width: 8,
        colors: ['#FF6600', '#4facfe', '#f093fb', '#43e97b', '#10b981']
      },
      link: { 
        colorMode: 'gradient', 
        colors: ['#FF6600', '#10b981'] 
      }
    },
    backgroundColor: 'transparent',
    tooltip: { isHtml: true, textStyle: { fontName: 'Inter', fontSize: 14 } }
  };

  // Variables para Modales
  pedidosSeleccionados: ResumenPedidoDTO[] = [];
  materialSeleccionado: StockMaterialDTO | null = null;
  tituloModal: string = '';
  isLoadingModal: boolean = false;
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#cbd5e1' } },
      x: { grid: { display: false }, ticks: { color: '#cbd5e1' } }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const packNombre = this.barChartData.labels?.[index] as string;
        this.verDetalleDiseno(packNombre);
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Ventas', backgroundColor: '#FF6600', borderRadius: 4 }]
  };

  constructor(
    private dashboardService: DashboardService,
    private dialog: MatDialog,
    private router: Router
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard(): void {
    this.isLoading = true;

    this.dashboardService.getMetrics().subscribe({
      next: (data) => {
        console.log('Métricas recibidas:', data);
        this.metrics = data;
        this.configurarGraficoBarras(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando métricas:', err);
        this.isLoading = false;
      }
    });

    this.cargarFlujoSankey();
  }

  private configurarGraficoBarras(data: DashboardStatsDTO): void {
    if (data.topDisenos && data.topDisenos.length > 0) {
      this.barChartData.labels = data.topDisenos.map(d => d.nombrePack);
      this.barChartData.datasets[0].data = data.topDisenos.map(d => d.cantidadVendida);

      if (this.charts) {
        this.charts.forEach(child => child.update());
      }
    }
  }

  private cargarFlujoSankey(): void {
    this.dashboardService.getSankeyFlow().subscribe({
      next: (data: any[]) => {
        this.sankeyData = data.map(item => [item.from, item.to, item.weight]);
      },
      error: (err) => console.error('Error cargando flujo Sankey', err)
    });
  }
  get stockFiltrado(): StockMaterialDTO[] {
    if (!this.metrics || !this.metrics.estadoStock) return [];
    
    if (this.filtroStock === 'TODOS') {
      return this.metrics.estadoStock;
    }
    return this.metrics.estadoStock.filter(item => item.estado === this.filtroStock);
  }

  cambiarFiltro(filtro: 'TODOS' | 'LOW_STOCK' | 'SUFFICIENT'): void {
    this.filtroStock = filtro;
  }

  getPorcentajeStock(cantidad: number): number {
    return cantidad > 100 ? 100 : cantidad; 
  }
  verDetalleDiseno(nombrePack: string): void {
    this.tituloModal = `Pedidos del diseño: ${nombrePack}`;
    this.pedidosSeleccionados = [];
    this.isLoadingModal = true;
    this.dialog.open(this.detallePedidosModal, { width: '800px' });

    this.dashboardService.getPedidosPorPack(nombrePack).subscribe({
      next: (pedidos) => {
        this.pedidosSeleccionados = pedidos;
        this.isLoadingModal = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoadingModal = false;
      }
    });
  }

  abrirModalMaterial(material: StockMaterialDTO): void {
    this.materialSeleccionado = material;
    this.dialog.open(this.detalleMaterialModal, { width: '450px' });
  }

  gestionarStock(): void {
    this.dialog.closeAll();
    console.log('Navegando a gestión de inventario...');
  }
}