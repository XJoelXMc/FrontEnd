import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamaManagerComponent } from './gama-manager.component';

describe('GamaManagerComponent', () => {
  let component: GamaManagerComponent;
  let fixture: ComponentFixture<GamaManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamaManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamaManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
