import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SplashRoutingModule } from './splash-routing.module';
import { SplashComponent } from './splash.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from "../../shared/shared.module";

@NgModule({
  declarations: [
    SplashComponent
  ],
  imports: [
    CommonModule,
    SplashRoutingModule,
    MatToolbarModule, // <- necesario para usar <mat-toolbar>
    MatIconModule,
    SharedModule
    
]
})
export class SplashModule { }
