import { describe, expect, it } from 'vitest';

import { detailsEmptyLabelKey, filledSections, sliceList, withCount } from './details-panel';

describe('detailsEmptyLabelKey', () => {
  it("names what failed with the section's own phrase", () => {
    expect(detailsEmptyLabelKey('error', 'roles.details.failed')).toBe('roles.details.failed');
  });

  // Nothing selected and a key nothing answers to are the same empty column.
  it('falls back to the empty column for anything else', () => {
    expect(detailsEmptyLabelKey('idle', 'roles.details.failed')).toBe('browse.details.empty');
    expect(detailsEmptyLabelKey('ready', 'roles.details.failed')).toBe('browse.details.empty');
  });
});

describe('withCount', () => {
  it('appends the count in brackets', () => {
    expect(withCount('Members', 8)).toBe('Members (8)');
  });

  it('keeps a count of zero, which is not the same as having none', () => {
    expect(withCount('Members', 0)).toBe('Members (0)');
  });

  it('leaves the label alone when there is no count', () => {
    expect(withCount('Role', undefined)).toBe('Role');
  });
});

describe('sliceList', () => {
  const keys = (count: number): string[] => Array.from({ length: count }, (_, i) => `key-${i}`);

  it('shows every row and hides none while the list fits', () => {
    const items = keys(4);

    expect(sliceList(items, 10)).toEqual({ shown: items, hidden: 0 });
  });

  it('cuts the list at the limit and counts the rest', () => {
    const items = keys(19);

    expect(sliceList(items, 10)).toEqual({ shown: items.slice(0, 10), hidden: 9 });
  });

  it('counts the whole set, not the rows loaded, when a total is given', () => {
    expect(sliceList(keys(10), 10, 4213)).toEqual({ shown: keys(10), hidden: 4203 });
  });

  it('never trusts a total smaller than what is loaded', () => {
    expect(sliceList(keys(12), 10, 3).hidden).toBe(2);
  });

  it('keeps every row when there is no limit', () => {
    const items = keys(42);

    expect(sliceList(items)).toEqual({ shown: items, hidden: 0 });
  });
});

describe('filledSections', () => {
  it('keeps the sections that have items, in order', () => {
    const sections = [
      { labelKey: 'users', items: ['a'] },
      { labelKey: 'groups', items: [] },
      { labelKey: 'roles', items: ['b', 'c'] },
    ];

    expect(filledSections(sections).map(({ labelKey }) => labelKey)).toEqual(['users', 'roles']);
  });

  it('drops everything when nothing has items', () => {
    expect(filledSections([{ labelKey: 'users', items: [] }])).toEqual([]);
  });
});
