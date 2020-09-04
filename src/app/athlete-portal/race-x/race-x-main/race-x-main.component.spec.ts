import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { RaceXMainComponent } from "./race-x-main.component";

describe("RaceXMainComponent", () => {
  let component: RaceXMainComponent;
  let fixture: ComponentFixture<RaceXMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RaceXMainComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaceXMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
