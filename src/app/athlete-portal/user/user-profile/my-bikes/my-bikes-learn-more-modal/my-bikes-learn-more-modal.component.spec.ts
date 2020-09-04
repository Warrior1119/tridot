/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBikesLearnMoreModalComponent } from './my-bikes-learn-more-modal.component';

describe('MyBikesLearnMoreModalComponent', () => {
  let component: MyBikesLearnMoreModalComponent;
  let fixture: ComponentFixture<MyBikesLearnMoreModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyBikesLearnMoreModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBikesLearnMoreModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
