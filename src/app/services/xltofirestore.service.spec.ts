import { TestBed, inject } from '@angular/core/testing';

import { Xltofirestore_planetNamesService } from './xltofirestore.service';

describe('XltofirestoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Xltofirestore_planetNamesService]
    });
  });

  it('should be created', inject([Xltofirestore_planetNamesService], (service: Xltofirestore_planetNamesService) => {
    expect(service).toBeTruthy();
  }));
});
