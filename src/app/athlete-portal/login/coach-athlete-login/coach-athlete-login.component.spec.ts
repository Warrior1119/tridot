import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachAthleteLoginComponent } from './coach-athlete-login.component';

describe('CoachAthleteLoginComponent', () => {
  let component: CoachAthleteLoginComponent;
  let fixture: ComponentFixture<CoachAthleteLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachAthleteLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachAthleteLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
