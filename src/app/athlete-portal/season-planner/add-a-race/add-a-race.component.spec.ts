import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddARaceComponent } from './add-a-race.component';

describe('AddARaceComponent', () => {
  let component: AddARaceComponent;
  let fixture: ComponentFixture<AddARaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddARaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddARaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
