import { TestBed } from '@angular/core/testing';

import { DocShareService } from './doc-share.service';

describe('DocShareService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DocShareService = TestBed.get(DocShareService);
    expect(service).toBeTruthy();
  });
});
