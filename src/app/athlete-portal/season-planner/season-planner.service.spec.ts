import { TestBed, inject } from '@angular/core/testing';

import { SeasonPlannerService } from './season-planner.service';

describe('SeasonPlannerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeasonPlannerService]
    });
  });

  it('should be created', inject([SeasonPlannerService], (service: SeasonPlannerService) => {
    expect(service).toBeTruthy();
  }));
});
