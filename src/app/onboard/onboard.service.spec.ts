import { TestBed, inject } from '@angular/core/testing';

import { OnboardService } from './onboard.service';

describe('OnboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OnboardService]
    });
  });

  it('should be created', inject([OnboardService], (service: OnboardService) => {
    expect(service).toBeTruthy();
  }));
});
