import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingPreferencesComponent } from './training-preferences.component';

describe('TrainingPreferencesComponent', () => {
  let component: TrainingPreferencesComponent;
  let fixture: ComponentFixture<TrainingPreferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingPreferencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
