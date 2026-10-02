import { describe, expect, it } from 'vitest';

import {
  textOf,
  textTerm,
  toggledTerm,
  valuesOf,
  withoutTerm,
  withTerm,
  type FilterQuery,
  type FilterTerm,
} from './filter';

const ldap: FilterTerm = { field: 'idProvider', value: 'ldap' };
const entra: FilterTerm = { field: 'idProvider', value: 'entraid' };
const custom: FilterTerm = { field: 'scope', value: 'custom' };
const alice: FilterTerm = { text: 'alice' };
const ward: FilterTerm = { text: 'ward' };

const query: FilterQuery = [ldap, alice, entra, custom, ward];

describe('textOf', () => {
  it('joins the text terms with a space, in the order they were added', () => {
    expect(textOf(query)).toBe('alice ward');
  });

  it('is empty when the query holds no text', () => {
    expect(textOf([ldap, custom])).toBe('');
  });
});

describe('valuesOf', () => {
  it('collects every value of one field and no other', () => {
    expect(valuesOf(query, 'idProvider')).toEqual(new Set(['ldap', 'entraid']));
    expect(valuesOf(query, 'scope')).toEqual(new Set(['custom']));
  });

  it('is empty for a field the query does not narrow by', () => {
    expect(valuesOf(query, 'application').size).toBe(0);
  });
});

describe('textTerm', () => {
  it('trims what was typed', () => {
    expect(textTerm('  alice ')).toEqual({ text: 'alice' });
  });

  it('makes nothing of a blank', () => {
    expect(textTerm('   ')).toBeUndefined();
  });
});

describe('withTerm', () => {
  it('adds a term at the end', () => {
    expect(withTerm([ldap], alice)).toEqual([ldap, alice]);
  });

  it('leaves a query alone that already holds the term', () => {
    expect(withTerm(query, ldap)).toBe(query);
    expect(withTerm(query, { text: 'alice' })).toBe(query);
  });

  it('leaves the query it was given alone', () => {
    const original = [ldap];
    withTerm(original, alice);

    expect(original).toEqual([ldap]);
  });
});

describe('toggledTerm', () => {
  it('adds a term the query does not hold', () => {
    expect(toggledTerm([ldap], entra)).toEqual([ldap, entra]);
  });

  it('takes out a term the query holds, wherever it is', () => {
    expect(toggledTerm(query, entra)).toEqual([ldap, alice, custom, ward]);
  });
});

describe('withoutTerm', () => {
  it('drops the term at an index', () => {
    expect(withoutTerm(query, 1)).toEqual([ldap, entra, custom, ward]);
  });

  it('ignores an index the query has no term at', () => {
    expect(withoutTerm(query, 9)).toEqual(query);
  });
});
