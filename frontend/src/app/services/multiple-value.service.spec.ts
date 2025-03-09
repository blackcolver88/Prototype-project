import { TestBed } from '@angular/core/testing';

import { MultipleValueService } from './multiple-value.service';

describe('MultipleValueService', () => {
  let service: MultipleValueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultipleValueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
