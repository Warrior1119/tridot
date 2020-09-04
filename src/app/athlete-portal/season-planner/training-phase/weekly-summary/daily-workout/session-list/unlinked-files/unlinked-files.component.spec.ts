import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlinkedFilesComponent } from './unlinked-files.component';

describe('UnlinkedFilesComponent', () => {
  let component: UnlinkedFilesComponent;
  let fixture: ComponentFixture<UnlinkedFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnlinkedFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnlinkedFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
