import { TestBed } from '@angular/core/testing';

import { AllOrderService } from './all-order.service';

describe('AllOrderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AllOrderService = TestBed.get(AllOrderService);
    expect(service).toBeTruthy();
  });
});
