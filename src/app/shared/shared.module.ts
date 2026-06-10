import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio'; // ✅ 1. IMPORT THE MISSING MODULE
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// Componentes compartidos
import { HomeComponent } from './components/home/home.component';
import { ClientRoutingModule } from '../pages/client/clientRouting.module';
import { AdminRoutingModule } from '../pages/admin/admin-routing.module';
import { OwnerRoutingModule } from '../pages/owner/owner-routing.module';
import { GestionDeVentasComponent } from './components/gestion-de-ventas/gestion-de-ventas.component';
import { ModeloDialogComponent } from './components/modelo-dialog/modelo-dialog.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { GestionEmpleadosComponent } from './components/gestion-empleados/gestion-empleados.component';
import { GestionProveedoresComponent } from './components/gestion-proveedores/gestion-proveedores.component';
import { ProveedorFormModalComponent } from './components/gestion-proveedores/proveedor-form-modal/proveedor-form-modal.component';
import { GestionarPedidosComponent } from './components/gestion-proveedores/gestionar-pedidos/gestionar-pedidos.component';
import { NuevoPedidoProveedorComponent } from './components/gestion-proveedores/gestionar-pedidos/nuevo-pedido-proveedor/nuevo-pedido-proveedor.component';
import { DetallePedidoProveedorComponent } from './components/gestion-proveedores/gestionar-pedidos/detalle-pedido-proveedor/detalle-pedido-proveedor.component';
import { GestionInventarioComponent } from './components/gestion-inventario/gestion-inventario.component';
import { GestionPacksComponentComponent } from './components/gestionPedidos/gestion-packs-component/gestion-packs-component.component';
import { GamaManagerComponent } from './components/gestionPedidos/gama-manager/gama-manager.component';
import { MoldeManagerComponent } from './components/gestionPedidos/molde-manager/molde-manager.component';
import { PackCreatorComponent } from './components/gestionPedidos/pack-creator/pack-creator.component';
import { CrearCotizacionComponent } from './components/gestionPedidos/crear-cotizacion/crear-cotizacion.component';
import { ImageGalleryDialogComponent } from './components/galery-dialog/image-gallery-dialog/image-gallery-dialog.component';
import { CuellosModalComponent } from './components/gestionPedidos/cuellos-modal/cuellos-modal.component';
import { MoldeCuellosComponent } from './components/gestionPedidos/molde-cuellos/molde-cuellos.component';
import { DetalleCotizacionComponent } from './components/gestionPedidos/detalle-cotizacion/detalle-cotizacion.component';
import { PersonalizacionComponent } from './components/gestionPedidos/personalizacion/personalizacion.component';
import { ControlarPedidoComponent } from './components/gestionPedidos/controlar-pedido/controlar-pedido.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GoogleChartsModule } from 'angular-google-charts';
@NgModule({
  declarations: [
    HomeComponent,
    GestionDeVentasComponent,
    ModeloDialogComponent,
    NavbarComponent,
    FooterComponent,
    GestionEmpleadosComponent,
    GestionProveedoresComponent,
    ProveedorFormModalComponent,
    GestionarPedidosComponent,
    NuevoPedidoProveedorComponent,
    DetallePedidoProveedorComponent,
    ModeloDialogComponent,
    GestionInventarioComponent,
    GestionPacksComponentComponent,
    GamaManagerComponent,
    MoldeManagerComponent,
    PackCreatorComponent,
    CrearCotizacionComponent,
    ImageGalleryDialogComponent,
    CuellosModalComponent,
    MoldeCuellosComponent,
    DetalleCotizacionComponent,
    PersonalizacionComponent,
    ControlarPedidoComponent,
    DashboardComponent
  ],
  imports: [
    DragDropModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  MatCheckboxModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatCardModule,
    MatTableModule,
    ClientRoutingModule,
    AdminRoutingModule,
    OwnerRoutingModule,
    MatDividerModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatStepperModule,
    MatListModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatRadioModule, // ✅ 2. ADD IT TO THE IMPORTS ARRAY
    MatSlideToggleModule,
    DragDropModule,
    BaseChartDirective,
    GoogleChartsModule
    
  ],
  exports: [
    DragDropModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatDialogModule,
    MatMenuModule,
    MatTableModule,
    MatStepperModule,
    MatChipsModule,
    MatListModule,
    MatSelectModule,
    MatRadioModule, // ✅ 3. ADD IT TO THE EXPORTS ARRAY
    HomeComponent,
    GestionDeVentasComponent,
    NavbarComponent,
    FooterComponent,
    GestionEmpleadosComponent,
    GestionProveedoresComponent,
    ProveedorFormModalComponent,
    GestionarPedidosComponent,
    NuevoPedidoProveedorComponent,
    DetallePedidoProveedorComponent,
    ModeloDialogComponent,
    GestionInventarioComponent,
    GestionPacksComponentComponent,
    GamaManagerComponent,
    MoldeManagerComponent,
    PackCreatorComponent,
    MatProgressSpinnerModule,
    CrearCotizacionComponent,
    ImageGalleryDialogComponent,
    CuellosModalComponent,
    MoldeCuellosComponent,
    MatSlideToggleModule, // ✅ también aquí para usarlo fuera del módulo
    DetalleCotizacionComponent,
    PersonalizacionComponent
  ],
  providers: [
    MatNativeDateModule,
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideCharts(withDefaultRegisterables())
  ]
})
export class SharedModule {}