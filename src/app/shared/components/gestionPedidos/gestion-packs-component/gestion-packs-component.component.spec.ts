import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionPacksComponentComponent } from './gestion-packs-component.component';

describe('GestionPacksComponentComponent', () => {
  let component: GestionPacksComponentComponent;
  let fixture: ComponentFixture<GestionPacksComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionPacksComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionPacksComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
