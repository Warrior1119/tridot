import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { B2rComponent } from './b2r.component';

describe('B2rComponent', () => {
  let component: B2rComponent;
  let fixture: ComponentFixture<B2rComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ B2rComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(B2rComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
