import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwimProfile1Component } from './swim-profile-1.component';

describe('SwimProfile1Component', () => {
  let component: SwimProfile1Component;
  let fixture: ComponentFixture<SwimProfile1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwimProfile1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwimProfile1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
