import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionDeVentasComponent } from './gestion-de-ventas.component';

describe('GestionDeVentasComponent', () => {
  let component: GestionDeVentasComponent;
  let fixture: ComponentFixture<GestionDeVentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionDeVentasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionDeVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
