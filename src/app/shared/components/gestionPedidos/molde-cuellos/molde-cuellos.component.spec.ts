import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoldeCuellosComponent } from './molde-cuellos.component';

describe('MoldeCuellosComponent', () => {
  let component: MoldeCuellosComponent;
  let fixture: ComponentFixture<MoldeCuellosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoldeCuellosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoldeCuellosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
