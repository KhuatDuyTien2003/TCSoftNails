import { TestBed } from '@angular/core/testing';

import { HttpCustomerService } from './http-customer.service';

describe('HttpCustomerService', () => {
  let service: HttpCustomerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpCustomerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
