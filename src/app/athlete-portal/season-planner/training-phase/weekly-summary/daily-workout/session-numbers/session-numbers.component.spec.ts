import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionNumbersComponent } from './session-numbers.component';

describe('SessionNumbersComponent', () => {
  let component: SessionNumbersComponent;
  let fixture: ComponentFixture<SessionNumbersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionNumbersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
