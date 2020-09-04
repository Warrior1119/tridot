import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwimProfile2Component } from './swim-profile-2.component';

describe('SwimProfile2Component', () => {
  let component: SwimProfile2Component;
  let fixture: ComponentFixture<SwimProfile2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwimProfile2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwimProfile2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
