import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEntryMultipleComponent } from './add-entry-multiple.component';

describe('AddEntryMultipleComponent', () => {
  let component: AddEntryMultipleComponent;
  let fixture: ComponentFixture<AddEntryMultipleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEntryMultipleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEntryMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
