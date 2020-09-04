import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceXComponent } from './race-x.component';

describe('RaceXComponent', () => {
  let component: RaceXComponent;
  let fixture: ComponentFixture<RaceXComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RaceXComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaceXComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
