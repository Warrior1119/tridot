import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDriveBannerComponent } from './test-drive-banner.component';

describe('TestDriveBannerComponent', () => {
  let component: TestDriveBannerComponent;
  let fixture: ComponentFixture<TestDriveBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestDriveBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestDriveBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
