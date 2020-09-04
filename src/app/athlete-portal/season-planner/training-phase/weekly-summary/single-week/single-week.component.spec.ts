import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleWeekComponent } from './single-week.component';

describe('SingleWeekComponent', () => {
  let component: SingleWeekComponent;
  let fixture: ComponentFixture<SingleWeekComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleWeekComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
