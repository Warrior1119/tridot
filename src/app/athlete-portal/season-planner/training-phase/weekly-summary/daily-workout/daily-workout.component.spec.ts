import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyWorkoutComponent } from './daily-workout.component';

describe('DailyWorkoutComponent', () => {
  let component: DailyWorkoutComponent;
  let fixture: ComponentFixture<DailyWorkoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyWorkoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyWorkoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
