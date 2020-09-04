import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveCopyComponent } from './move-copy.component';

describe('MoveCopyComponent', () => {
  let component: MoveCopyComponent;
  let fixture: ComponentFixture<MoveCopyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoveCopyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveCopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
