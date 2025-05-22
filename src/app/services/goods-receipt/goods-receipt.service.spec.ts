import { TestBed } from '@angular/core/testing';

import { GoodsReceiptService } from './goods-receipt.service';

describe('GoodsReceiptService', () => {
  let service: GoodsReceiptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoodsReceiptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
