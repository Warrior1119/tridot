import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LaneLineTestHelpComponent } from './lane-line-test-help.component';

describe('LaneLineTestHelpComponent', () => {
  let component: LaneLineTestHelpComponent;
  let fixture: ComponentFixture<LaneLineTestHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LaneLineTestHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LaneLineTestHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
