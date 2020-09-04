import { TestBed, inject } from '@angular/core/testing';

import { TrainIntensitiesService } from './train-intensities.service';

describe('TrainIntensitiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrainIntensitiesService]
    });
  });

  it('should be created', inject([TrainIntensitiesService], (service: TrainIntensitiesService) => {
    expect(service).toBeTruthy();
  }));
});
