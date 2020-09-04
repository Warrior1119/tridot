import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRaceDetailsComponent } from './dashboard-race-details.component';

describe('DashboardRaceDetailsComponent', () => {
  let component: DashboardRaceDetailsComponent;
  let fixture: ComponentFixture<DashboardRaceDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardRaceDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardRaceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
