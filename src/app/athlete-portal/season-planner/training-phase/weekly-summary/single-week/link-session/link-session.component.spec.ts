import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkSessionComponent } from './link-session.component';

describe('LinkSessionComponent', () => {
  let component: LinkSessionComponent;
  let fixture: ComponentFixture<LinkSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
