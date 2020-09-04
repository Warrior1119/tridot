import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AthleteProfileSettingsComponent } from './athlete-profile-settings.component';

describe('AthleteProfileSettingsComponent', () => {
  let component: AthleteProfileSettingsComponent;
  let fixture: ComponentFixture<AthleteProfileSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AthleteProfileSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AthleteProfileSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
