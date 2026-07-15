import { TestBed } from '@angular/core/testing';

import { AudioImport } from './audio-import';

describe('AudioImport', () => {
  let service: AudioImport;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioImport);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
