import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoldeManagerComponent } from './molde-manager.component';

describe('MoldeManagerComponent', () => {
  let component: MoldeManagerComponent;
  let fixture: ComponentFixture<MoldeManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoldeManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoldeManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
