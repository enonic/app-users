import { describe, expect, it } from 'vitest';

import { capSelection } from './principal-selection';

describe('capSelection', () => {
  it('replaces the one principal held when there is room for one', () => {
    expect(capSelection(['role:a', 'role:b'], 1)).toEqual(['role:b']);
  });

  it('keeps the latest picks up to the maximum, in order', () => {
    expect(capSelection(['role:a', 'role:b', 'role:c'], 2)).toEqual(['role:b', 'role:c']);
  });

  it('keeps everything while within the maximum, or when unbounded', () => {
    expect(capSelection(['role:a', 'role:b'], 2)).toEqual(['role:a', 'role:b']);
    expect(capSelection(['role:a', 'role:b', 'role:c'], 0)).toEqual(['role:a', 'role:b', 'role:c']);
  });

  it('holds a key once', () => {
    expect(capSelection(['role:a', 'role:a', 'role:b'], 0)).toEqual(['role:a', 'role:b']);
  });
});
