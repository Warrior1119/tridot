import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceLevelComponent } from './performance-level.component';

describe('PerformanceLevelComponent', () => {
  let component: PerformanceLevelComponent;
  let fixture: ComponentFixture<PerformanceLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
