import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackCreatorComponent } from './pack-creator.component';

describe('PackCreatorComponent', () => {
  let component: PackCreatorComponent;
  let fixture: ComponentFixture<PackCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
