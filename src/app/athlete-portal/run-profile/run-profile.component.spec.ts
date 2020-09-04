import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunProfileComponent } from './run-profile.component';

describe('RunProfileComponent', () => {
  let component: RunProfileComponent;
  let fixture: ComponentFixture<RunProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
