import { describe, expect, it } from 'vitest';

import { allowsWrite } from './id-provider-mode';
import type { IdProviderMode } from './principal.types';

const MODES: IdProviderMode[] = ['LOCAL', 'MIXED', 'EXTERNAL', 'UNAVAILABLE'];

describe('allowsWrite', () => {
  it('allows user writes under LOCAL alone', () => {
    expect(MODES.filter((mode) => allowsWrite(mode, 'user'))).toEqual(['LOCAL']);
  });

  it('allows group writes under LOCAL and MIXED', () => {
    expect(MODES.filter((mode) => allowsWrite(mode, 'group'))).toEqual(['LOCAL', 'MIXED']);
  });

  it('allows nothing while the mode is unknown', () => {
    expect(allowsWrite(undefined, 'user')).toBe(false);
    expect(allowsWrite(undefined, 'group')).toBe(false);
  });
});
