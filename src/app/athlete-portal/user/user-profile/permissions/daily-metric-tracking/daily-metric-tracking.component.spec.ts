import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyMetricTrackingComponent } from './daily-metric-tracking.component';

describe('DailyMetricTrackingComponent', () => {
  let component: DailyMetricTrackingComponent;
  let fixture: ComponentFixture<DailyMetricTrackingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyMetricTrackingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyMetricTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
