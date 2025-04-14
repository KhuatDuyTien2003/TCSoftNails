import { TestBed } from '@angular/core/testing';

import { CustomerRankService } from '../customer-rank/customer-rank.service';

describe('CustomerRankService', () => {
  let service: CustomerRankService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerRankService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
