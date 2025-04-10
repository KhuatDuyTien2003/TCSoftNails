import { TestBed } from '@angular/core/testing';

import { HttpStaffService } from './http-staff.service';

describe('HttpStaffService', () => {
  let service: HttpStaffService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpStaffService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
