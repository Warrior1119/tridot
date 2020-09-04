import { TestBed, inject } from '@angular/core/testing';

import { SeasonSharedDataService } from './season-shared-data.service';

describe('SeasonSharedDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeasonSharedDataService]
    });
  });

  it('should be created', inject([SeasonSharedDataService], (service: SeasonSharedDataService) => {
    expect(service).toBeTruthy();
  }));
});
