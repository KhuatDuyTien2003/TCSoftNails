import { TestBed } from '@angular/core/testing';

import { HttpPermissionService } from './http-permission.service';

describe('HttpPermissionService', () => {
  let service: HttpPermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpPermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
