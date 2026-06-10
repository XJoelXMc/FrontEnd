import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuellosModalComponent } from './cuellos-modal.component';

describe('CuellosModalComponent', () => {
  let component: CuellosModalComponent;
  let fixture: ComponentFixture<CuellosModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuellosModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuellosModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
