import { TestBed } from '@angular/core/testing';

import { VoucherReceiptService } from './voucher-receipt.service';

describe('VoucherReceiptService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VoucherReceiptService = TestBed.get(VoucherReceiptService);
    expect(service).toBeTruthy();
  });
});
