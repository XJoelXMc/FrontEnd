import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoPedidoProveedorComponent } from './nuevo-pedido-proveedor.component';

describe('NuevoPedidoProveedorComponent', () => {
  let component: NuevoPedidoProveedorComponent;
  let fixture: ComponentFixture<NuevoPedidoProveedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoPedidoProveedorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevoPedidoProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
