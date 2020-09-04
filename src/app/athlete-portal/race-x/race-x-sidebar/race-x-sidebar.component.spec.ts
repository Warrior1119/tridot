import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceXSidebarComponent } from './race-x-sidebar.component';

describe('RaceXSidebarComponent', () => {
  let component: RaceXSidebarComponent;
  let fixture: ComponentFixture<RaceXSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RaceXSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaceXSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
