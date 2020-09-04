import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferCoachComponent } from './refer-coach.component';

describe('ReferCoachComponent', () => {
  let component: ReferCoachComponent;
  let fixture: ComponentFixture<ReferCoachComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferCoachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferCoachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
