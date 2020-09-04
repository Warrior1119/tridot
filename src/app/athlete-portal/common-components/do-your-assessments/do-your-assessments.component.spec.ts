import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoYourAssessmentsComponent } from './do-your-assessments.component';

describe('DoYourAssessmentsComponent', () => {
  let component: DoYourAssessmentsComponent;
  let fixture: ComponentFixture<DoYourAssessmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoYourAssessmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoYourAssessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
