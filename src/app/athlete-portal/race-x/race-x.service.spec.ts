import { TestBed, inject } from '@angular/core/testing';

import { RaceXService } from './race-x.service';

describe('RaceXService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RaceXService]
    });
  });

  it('should be created', inject([RaceXService], (service: RaceXService) => {
    expect(service).toBeTruthy();
  }));
});
