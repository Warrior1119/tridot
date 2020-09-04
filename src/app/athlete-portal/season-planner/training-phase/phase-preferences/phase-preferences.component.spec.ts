import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhasePreferencesComponent } from './phase-preferences.component';

describe('PhasePreferencesComponent', () => {
  let component: PhasePreferencesComponent;
  let fixture: ComponentFixture<PhasePreferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhasePreferencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhasePreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
