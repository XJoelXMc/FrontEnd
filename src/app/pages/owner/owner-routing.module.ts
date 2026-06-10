import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../../shared/components/home/home.component'; // Cambia al componente owner-home si tienes uno
import { GestionDeVentasComponent } from '../../shared/components/gestion-de-ventas/gestion-de-ventas.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, // Aquí podrías usar OwnerHomeComponent si lo tienes
  { path: '', component: GestionDeVentasComponent },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OwnerRoutingModule {}