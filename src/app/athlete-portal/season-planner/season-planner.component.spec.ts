import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonPlannerComponent } from './season-planner.component';

describe('SeasonPlannerComponent', () => {
  let component: SeasonPlannerComponent;
  let fixture: ComponentFixture<SeasonPlannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeasonPlannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
