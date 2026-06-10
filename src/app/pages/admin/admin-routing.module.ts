import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../../shared/components/home/home.component';
import { GestionDeVentasComponent } from '../../shared/components/gestion-de-ventas/gestion-de-ventas.component';

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: '', component: GestionDeVentasComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
