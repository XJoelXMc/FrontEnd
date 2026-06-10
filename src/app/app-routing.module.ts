import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './shared/components/home/home.component';
import { GestionDeVentasComponent } from './shared/components/gestion-de-ventas/gestion-de-ventas.component';
import { GestionEmpleadosComponent } from './shared/components/gestion-empleados/gestion-empleados.component';
import { GestionProveedoresComponent } from './shared/components/gestion-proveedores/gestion-proveedores.component';
import { GestionInventarioComponent } from './shared/components/gestion-inventario/gestion-inventario.component';

import { GestionPacksComponentComponent } from './shared/components/gestionPedidos/gestion-packs-component/gestion-packs-component.component';
import { CrearCotizacionComponent } from './shared/components/gestionPedidos/crear-cotizacion/crear-cotizacion.component';
import { DetalleCotizacionComponent } from './shared/components/gestionPedidos/detalle-cotizacion/detalle-cotizacion.component';
import { PersonalizacionComponent } from './shared/components/gestionPedidos/personalizacion/personalizacion.component';
import { ControlarPedidoComponent } from './shared/components/gestionPedidos/controlar-pedido/controlar-pedido.component';
import { DashboardComponent } from './shared/components/dashboard/dashboard.component';

const routes: Routes = [
  //{ path: 'splash', redirectTo: 'splash', pathMatch: 'full' },
  { path: 'welcome', loadChildren: () => import('./pages/splash/splash.module').then(m => m.SplashModule) },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'gestion-ventas', component: GestionDeVentasComponent },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: 'gestion-empleados', component: GestionEmpleadosComponent },
  { path: 'gestion-proveedores', component: GestionProveedoresComponent },
  {path: 'gestion-Inventario', component: GestionInventarioComponent},
  { path: 'gestion-packs',component: GestionPacksComponentComponent},
  { path: 'crearCotizacion',component: CrearCotizacionComponent},
  { path: 'detalle-cotizacion', component: DetalleCotizacionComponent },
  { path: 'personalizaTuPedido/:id', component: PersonalizacionComponent },
  { path: 'controlarPedido', component: ControlarPedidoComponent },
  { path: 'dashboard',component: DashboardComponent },
  { path: 'client', loadChildren: () => import('./pages/client/client.module').then(m => m.ClientModule)},
  { path: 'admin', loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule) },
  { path: 'owner', loadChildren: () => import('./pages/owner/owner.module').then(m => m.OwnerModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}