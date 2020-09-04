import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthRelatedDataComponent } from './health-related-data.component';

describe('HealthRelatedDataComponent', () => {
  let component: HealthRelatedDataComponent;
  let fixture: ComponentFixture<HealthRelatedDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthRelatedDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthRelatedDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
