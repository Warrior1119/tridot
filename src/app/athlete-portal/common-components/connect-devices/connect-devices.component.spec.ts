import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectDevicesComponent } from './connect-devices.component';

describe('ConnectDevicesComponent', () => {
  let component: ConnectDevicesComponent;
  let fixture: ComponentFixture<ConnectDevicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectDevicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
