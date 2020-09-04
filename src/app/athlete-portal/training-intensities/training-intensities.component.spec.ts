import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingIntensitiesComponent } from './training-intensities.component';

describe('TrainingIntensitiesComponent', () => {
  let component: TrainingIntensitiesComponent;
  let fixture: ComponentFixture<TrainingIntensitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingIntensitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingIntensitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
