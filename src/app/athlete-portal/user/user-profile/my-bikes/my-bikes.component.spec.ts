import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBikesComponent } from './my-bikes.component';

describe('MyBikesComponent', () => {
  let component: MyBikesComponent;
  let fixture: ComponentFixture<MyBikesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyBikesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBikesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
