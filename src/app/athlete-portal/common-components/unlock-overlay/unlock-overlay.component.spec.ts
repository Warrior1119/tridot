import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlockOverlayComponent } from './unlock-overlay.component';

describe('UnlockOverlayComponent', () => {
  let component: UnlockOverlayComponent;
  let fixture: ComponentFixture<UnlockOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnlockOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnlockOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
