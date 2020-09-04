import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRenameSeasonComponent } from './add-rename-season.component';

describe('AddRenameSeasonComponent', () => {
  let component: AddRenameSeasonComponent;
  let fixture: ComponentFixture<AddRenameSeasonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRenameSeasonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRenameSeasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
