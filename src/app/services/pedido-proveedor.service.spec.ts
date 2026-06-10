import { TestBed } from '@angular/core/testing';

import { PedidoProveedorService } from './pedido-proveedor.service';

describe('PedidoProveedorService', () => {
  let service: PedidoProveedorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidoProveedorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
