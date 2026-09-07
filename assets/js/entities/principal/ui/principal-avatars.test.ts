import { describe, expect, it } from 'vitest';

import { sliceAvatars } from './principal-avatars';

const names = (count: number): string[] => Array.from({ length: count }, (_, i) => `user-${i}`);

describe('sliceAvatars', () => {
  it('shows every item and hides none while the set fits', () => {
    const items = names(4);

    expect(sliceAvatars(items, 10)).toEqual({ shown: items, hidden: 0 });
  });

  it('cuts the row at the limit and counts the rest', () => {
    const items = names(19);

    const { shown, hidden } = sliceAvatars(items, 10);

    expect(shown).toEqual(items.slice(0, 10));
    expect(hidden).toBe(9);
  });

  it('counts the whole set, not the loaded page, when a total is given', () => {
    const { shown, hidden } = sliceAvatars(names(10), 10, 4213);

    expect(shown).toHaveLength(10);
    expect(hidden).toBe(4203);
  });

  it('never trusts a total smaller than what is loaded', () => {
    expect(sliceAvatars(names(12), 10, 3).hidden).toBe(2);
  });
});
