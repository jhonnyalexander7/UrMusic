import { TestBed } from '@angular/core/testing';

import { ListeningHistory } from './listening-history';

describe('ListeningHistory', () => {
  let service: ListeningHistory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListeningHistory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
