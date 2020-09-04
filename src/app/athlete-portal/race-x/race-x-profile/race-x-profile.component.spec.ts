import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceXProfileComponent } from './race-x-profile.component';

describe('RaceXProfileComponent', () => {
  let component: RaceXProfileComponent;
  let fixture: ComponentFixture<RaceXProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RaceXProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaceXProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
