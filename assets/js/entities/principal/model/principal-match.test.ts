import { describe, expect, it } from 'vitest';

import { matching } from './principal-match';

const hits = [
  { key: 'group:system:administrators', displayName: 'Administrators' },
  { key: 'group:store:managers', displayName: 'Store Managers' },
  { key: 'group:store:clerks', displayName: 'Shop Floor' },
];

describe('matching', () => {
  it('answers everything for an empty query', () => {
    expect(matching(hits, '')).toEqual(hits);
  });

  it('answers everything for a query of only whitespace', () => {
    expect(matching(hits, '   ')).toEqual(hits);
  });

  it('copies rather than handing back the list it was given', () => {
    expect(matching(hits, '')).not.toBe(hits);
  });

  it('matches a display name regardless of case', () => {
    expect(matching(hits, 'managers').map(({ key }) => key)).toEqual(['group:store:managers']);
    expect(matching(hits, 'STORE MANAGERS').map(({ key }) => key)).toEqual([
      'group:store:managers',
    ]);
  });

  it('matches the key as well as the display name', () => {
    expect(matching(hits, 'store').map(({ displayName }) => displayName)).toEqual([
      'Store Managers',
      'Shop Floor',
    ]);
  });

  it('matches anywhere in the value, not only at the start', () => {
    expect(matching(hits, 'floor').map(({ key }) => key)).toEqual(['group:store:clerks']);
  });

  it('answers empty when nothing matches', () => {
    expect(matching(hits, 'nothing here')).toEqual([]);
  });
});
