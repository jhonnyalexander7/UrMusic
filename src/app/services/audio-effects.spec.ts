import { TestBed } from '@angular/core/testing';

import { AudioEffects } from './audio-effects';

describe('AudioEffects', () => {
  let service: AudioEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioEffects);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
