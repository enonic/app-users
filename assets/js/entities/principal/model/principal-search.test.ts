import { describe, expect, it } from 'vitest';

import {
  appendPrincipalSearch,
  beginPrincipalSearch,
  beginPrincipalSearchAppend,
  failPrincipalSearch,
  failPrincipalSearchAppend,
  IDLE_PRINCIPAL_SEARCH,
  principalSearchAppendStart,
  receivePrincipalSearch,
  type PrincipalSearchState,
} from './principal-search';
import type { PrincipalRef } from './principal.types';

function user(name: string): PrincipalRef {
  return { type: 'user', key: `user:system:${name}`, displayName: name };
}

function ready(principals: PrincipalRef[], total: number): PrincipalSearchState {
  return {
    status: 'ready',
    principals,
    total,
    next: principals.length,
    more: principals.length > 0 && principals.length < total,
    appending: false,
  };
}

describe('beginPrincipalSearch', () => {
  it('keeps the rows on offer while the first page of a new search is on its way', () => {
    const state = beginPrincipalSearch(ready([user('a')], 1));

    expect(state.status).toBe('loading');
    expect(state.principals).toEqual([user('a')]);
  });

  it('clears an earlier failure', () => {
    expect(beginPrincipalSearch(failPrincipalSearch('down')).error).toBeUndefined();
  });
});

describe('receivePrincipalSearch', () => {
  it('replaces the offer with the page and remembers the total', () => {
    expect(receivePrincipalSearch({ total: 41, items: [user('a')] })).toEqual(
      ready([user('a')], 41),
    );
  });
});

describe('failPrincipalSearch', () => {
  it('drops the offer and reports the reason', () => {
    expect(failPrincipalSearch('down')).toEqual({
      ...IDLE_PRINCIPAL_SEARCH,
      status: 'error',
      error: 'down',
    });
  });
});

describe('principalSearchAppendStart', () => {
  it('is the number of rows served while the search matched more', () => {
    expect(principalSearchAppendStart(ready([user('a'), user('b')], 5))).toBe(2);
  });

  it('is the offset the server served, not the number of rows kept', () => {
    const state = appendPrincipalSearch(ready([user('a'), user('b')], 5), {
      total: 5,
      items: [user('b'), user('c')],
    });

    expect(state.principals).toHaveLength(3);
    expect(principalSearchAppendStart(state)).toBe(4);
  });

  it('is undefined once a page added nothing, although the search matched more', () => {
    const state = appendPrincipalSearch(ready([user('a'), user('b')], 12_000), {
      total: 12_000,
      items: [user('a'), user('b')],
    });

    expect(principalSearchAppendStart(state)).toBeUndefined();
  });

  it('is undefined after a first page with no rows, whatever the total claims', () => {
    expect(
      principalSearchAppendStart(receivePrincipalSearch({ total: 3, items: [] })),
    ).toBeUndefined();
  });

  it('is undefined once every match is listed', () => {
    expect(principalSearchAppendStart(ready([user('a')], 1))).toBeUndefined();
  });

  it('is undefined for an empty offer', () => {
    expect(principalSearchAppendStart(IDLE_PRINCIPAL_SEARCH)).toBeUndefined();
  });

  it('is undefined while a first page is loading', () => {
    expect(principalSearchAppendStart(beginPrincipalSearch(ready([user('a')], 5)))).toBeUndefined();
  });

  it('is undefined while a next page is on its way, so a second scroll is not a second page', () => {
    expect(
      principalSearchAppendStart(beginPrincipalSearchAppend(ready([user('a')], 5))),
    ).toBeUndefined();
  });

  it('is undefined after a next page failed, rather than retrying into the same failure', () => {
    expect(
      principalSearchAppendStart(failPrincipalSearchAppend(ready([user('a')], 5), 'down')),
    ).toBeUndefined();
  });
});

describe('appendPrincipalSearch', () => {
  it('lists the page after what is on offer, in the order it came', () => {
    const state = appendPrincipalSearch(beginPrincipalSearchAppend(ready([user('a')], 3)), {
      total: 3,
      items: [user('c'), user('b')],
    });

    expect(state).toEqual(ready([user('a'), user('c'), user('b')], 3));
  });

  it('skips a row already listed', () => {
    const state = appendPrincipalSearch(ready([user('a'), user('b')], 3), {
      total: 4,
      items: [user('b'), user('c')],
    });

    expect(state.principals).toEqual([user('a'), user('b'), user('c')]);
  });

  it('takes the total the later page reports', () => {
    expect(
      appendPrincipalSearch(ready([user('a')], 2), { total: 7, items: [user('b')] }).total,
    ).toBe(7);
  });

  it('ends the paging with an empty page', () => {
    expect(appendPrincipalSearch(ready([user('a')], 2), { total: 7, items: [] }).more).toBe(false);
  });
});

describe('failPrincipalSearchAppend', () => {
  it('keeps the rows on offer and reports the reason', () => {
    const state = failPrincipalSearchAppend(
      beginPrincipalSearchAppend(ready([user('a')], 5)),
      'down',
    );

    expect(state).toEqual({ ...ready([user('a')], 5), error: 'down' });
  });
});
