import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePedidoProveedorComponent } from './detalle-pedido-proveedor.component';

describe('DetallePedidoProveedorComponent', () => {
  let component: DetallePedidoProveedorComponent;
  let fixture: ComponentFixture<DetallePedidoProveedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePedidoProveedorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallePedidoProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
