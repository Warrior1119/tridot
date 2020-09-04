import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachCreateSessionComponent } from './coach-create-session.component';

describe('CoachCreateSessionComponent', () => {
  let component: CoachCreateSessionComponent;
  let fixture: ComponentFixture<CoachCreateSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachCreateSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachCreateSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
