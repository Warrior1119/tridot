import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainxScoreComponent } from './trainx-score.component';

describe('TrainxScoreComponent', () => {
  let component: TrainxScoreComponent;
  let fixture: ComponentFixture<TrainxScoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainxScoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainxScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
