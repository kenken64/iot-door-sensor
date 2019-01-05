import { TestBed } from '@angular/core/testing';

import { DoorService } from './door.service';

describe('DoorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DoorService = TestBed.get(DoorService);
    expect(service).toBeTruthy();
  });
});
