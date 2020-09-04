import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthRelatedDataSideBarComponent } from './health-related-data-side-bar.component';

describe('HealthRelatedDataSideBarComponent', () => {
  let component: HealthRelatedDataSideBarComponent;
  let fixture: ComponentFixture<HealthRelatedDataSideBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthRelatedDataSideBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthRelatedDataSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
