import { describe, expect, it } from 'vitest';

import { DETAILS_LIST_PAGE_SIZE, nextPageSize } from './detail';

describe('nextPageSize', () => {
  it('adds a whole page while more than a page is hidden', () => {
    expect(nextPageSize(15)).toBe(DETAILS_LIST_PAGE_SIZE);
  });

  it('adds only what is left when that is less than a page', () => {
    expect(nextPageSize(5)).toBe(5);
  });
});
