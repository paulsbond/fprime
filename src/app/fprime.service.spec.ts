import { TestBed } from '@angular/core/testing';

import { FprimeService } from './fprime.service';

describe('FprimeService', () => {
  let service: FprimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FprimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
