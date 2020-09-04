import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingRacesComponent } from './upcoming-races.component';

describe('UpcomingRacesComponent', () => {
  let component: UpcomingRacesComponent;
  let fixture: ComponentFixture<UpcomingRacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpcomingRacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpcomingRacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
