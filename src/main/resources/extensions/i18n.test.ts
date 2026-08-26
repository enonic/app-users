import { getPhrases } from '/lib/xp/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAllPhrases, resolveLocales } from './i18n';

describe('resolveLocales', () => {
  it('falls back to the default locale when none arrive', () => {
    expect(resolveLocales(undefined)).toEqual(['en']);
    expect(resolveLocales([])).toEqual(['en']);
  });

  it('keeps the locales it was given', () => {
    expect(resolveLocales(['no', 'en'])).toEqual(['no', 'en']);
  });
});

describe('getAllPhrases', () => {
  beforeEach(() => {
    vi.mocked(getPhrases).mockReset();
  });

  it('merges bundles with the later one winning a duplicate key', () => {
    vi.mocked(getPhrases)
      .mockReturnValueOnce({ a: 'first', shared: 'first' })
      .mockReturnValueOnce({ b: 'second', shared: 'second' });

    expect(getAllPhrases(['en'], ['one', 'two'])).toEqual({
      a: 'first',
      b: 'second',
      shared: 'second',
    });
  });

  it('asks per bundle for the locales it was given', () => {
    vi.mocked(getPhrases).mockReturnValue({});

    getAllPhrases(['no'], ['one']);

    expect(getPhrases).toHaveBeenCalledWith(['no'], ['one']);
  });
});
