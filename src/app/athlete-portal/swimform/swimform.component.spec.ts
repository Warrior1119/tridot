import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwimformComponent } from './swimform.component';

describe('SwimformComponent', () => {
  let component: SwimformComponent;
  let fixture: ComponentFixture<SwimformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwimformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwimformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
