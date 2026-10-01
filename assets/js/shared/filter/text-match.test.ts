import { describe, expect, it } from 'vitest';

import { matchesEveryWord } from './text-match';

const fields = ['Alice Ward', 'Ward staff'];

describe('matchesEveryWord', () => {
  it('matches everything for a blank query', () => {
    expect(matchesEveryWord('   ', fields)).toBe(true);
  });

  it('matches a word anywhere in any field, whatever the case', () => {
    expect(matchesEveryWord('STAFF', fields)).toBe(true);
    expect(matchesEveryWord('lic', fields)).toBe(true);
  });

  it('needs every word, in any order and across fields', () => {
    expect(matchesEveryWord('ward alice', fields)).toBe(true);
    expect(matchesEveryWord('alice staff', fields)).toBe(true);
    expect(matchesEveryWord('alice bob', fields)).toBe(false);
  });

  it('skips the fields a row does not have', () => {
    expect(matchesEveryWord('alice', ['Alice Ward', undefined])).toBe(true);
    expect(matchesEveryWord('alice', [undefined])).toBe(false);
  });
});
