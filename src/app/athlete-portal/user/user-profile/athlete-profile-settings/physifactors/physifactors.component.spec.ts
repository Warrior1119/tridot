import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysifactorsComponent } from './physifactors.component';

describe('PhysifactorsComponent', () => {
  let component: PhysifactorsComponent;
  let fixture: ComponentFixture<PhysifactorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhysifactorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysifactorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
