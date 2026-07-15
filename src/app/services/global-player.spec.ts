import { TestBed } from '@angular/core/testing';

import { GlobalPlayer } from './global-player';

describe('GlobalPlayer', () => {
  let service: GlobalPlayer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalPlayer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
