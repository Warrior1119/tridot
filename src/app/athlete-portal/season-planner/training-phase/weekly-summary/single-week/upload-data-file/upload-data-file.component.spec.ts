import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDataFileComponent } from './upload-data-file.component';

describe('UploadDataFileComponent', () => {
  let component: UploadDataFileComponent;
  let fixture: ComponentFixture<UploadDataFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadDataFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadDataFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
