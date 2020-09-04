import { TestBed, inject } from '@angular/core/testing';

import { ScriptService } from './scripts-loader.service';

describe('ScriptsLoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScriptService]
    });
  });

  it('should be created', inject([ScriptService], (service: ScriptService) => {
    expect(service).toBeTruthy();
  }));
});
