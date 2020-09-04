import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BikeProfileComponent } from './bike-profile.component';

describe('BikeProfileComponent', () => {
  let component: BikeProfileComponent;
  let fixture: ComponentFixture<BikeProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BikeProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BikeProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
