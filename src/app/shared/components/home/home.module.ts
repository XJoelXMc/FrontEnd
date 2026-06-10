// src/app/pages/home/home.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
//import { SharedModule } from 'src/app/shared/shared.module'; // Usa Material desde aquí

@NgModule({
  declarations: [],
  imports: [
    CommonModule,       // importa Angular Material y formularios
    HomeRoutingModule,    // enrutamiento local
    
  ]
})
export class HomeModule {}
