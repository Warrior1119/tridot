import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportMenuComponent } from './support-menu.component';

describe('SupportMenuComponent', () => {
  let component: SupportMenuComponent;
  let fixture: ComponentFixture<SupportMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupportMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
