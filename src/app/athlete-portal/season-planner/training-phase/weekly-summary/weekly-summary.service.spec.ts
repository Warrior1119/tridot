import { TestBed, inject } from '@angular/core/testing';

import { WeeklySummaryService } from './weekly-summary.service';

describe('WeeklySummaryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WeeklySummaryService]
    });
  });

  it('should be created', inject([WeeklySummaryService], (service: WeeklySummaryService) => {
    expect(service).toBeTruthy();
  }));
});
