import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlarPedidoComponent } from './controlar-pedido.component';

describe('ControlarPedidoComponent', () => {
  let component: ControlarPedidoComponent;
  let fixture: ComponentFixture<ControlarPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlarPedidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlarPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
