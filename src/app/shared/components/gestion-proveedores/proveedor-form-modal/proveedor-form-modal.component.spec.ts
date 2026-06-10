import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProveedorFormModalComponent } from './proveedor-form-modal.component';

describe('ProveedorFormModalComponent', () => {
  let component: ProveedorFormModalComponent;
  let fixture: ComponentFixture<ProveedorFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProveedorFormModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProveedorFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
