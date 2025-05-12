import { TestBed } from '@angular/core/testing';

import { HttpBillService } from './http-bill.service';

describe('HttpBillService', () => {
  let service: HttpBillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpBillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
