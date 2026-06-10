import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPedidoProveedorComponent } from './editar-pedido-proveedor.component';

describe('EditarPedidoProveedorComponent', () => {
  let component: EditarPedidoProveedorComponent;
  let fixture: ComponentFixture<EditarPedidoProveedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPedidoProveedorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPedidoProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
