import { err, ok } from 'neverthrow';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppError } from '../../../shared/api';
import {
  $idProviderPrincipals,
  appendIdProviderPrincipals,
  beginIdProviderPrincipalsAppend,
  beginIdProviderPrincipalsLoad,
  forgetIdProviderPrincipals,
  idProviderPrincipalsAppendStart,
  idProviderPrincipalsHasMore,
  receiveIdProviderPrincipals,
} from './id-provider-principals.store';
import type { PrincipalKey, PrincipalRef } from './principal.types';

function principal(name: string): PrincipalRef {
  return { key: `user:ldap:${name}` as PrincipalKey, type: 'user', displayName: name };
}

function firstPage(items: PrincipalRef[], total: number): void {
  beginIdProviderPrincipalsLoad('ldap');
  receiveIdProviderPrincipals(
    'ldap',
    ok({ key: 'ldap', users: { total, items }, groups: { total: 0, items: [] } }),
  );
}

beforeEach(() => {
  forgetIdProviderPrincipals();
});

describe('receiveIdProviderPrincipals', () => {
  it('holds the page beside the total the provider holds', () => {
    firstPage([principal('alice')], 4213);

    const { key, status, users } = $idProviderPrincipals.get();

    expect(key).toBe('ldap');
    expect(status).toBe('ready');
    expect(users.items).toHaveLength(1);
    expect(users.total).toBe(4213);
    expect(idProviderPrincipalsHasMore(users)).toBe(true);
  });

  it('reports a set that came back empty as exhausted, whatever the total says', () => {
    firstPage([], 12);

    expect(idProviderPrincipalsHasMore($idProviderPrincipals.get().users)).toBe(false);
  });

  it('keeps nothing of a read that failed', () => {
    beginIdProviderPrincipalsLoad('ldap');
    receiveIdProviderPrincipals('ldap', err(new AppError('Offline')));

    expect($idProviderPrincipals.get().status).toBe('error');
    expect($idProviderPrincipals.get().users.items).toEqual([]);
  });
});

describe('idProviderPrincipalsAppendStart', () => {
  it('is where the loaded rows end', () => {
    firstPage([principal('alice'), principal('bob')], 100);

    expect(idProviderPrincipalsAppendStart('user')).toBe(2);
  });

  it('is nothing while a page is already on its way, so two clicks are one page', () => {
    firstPage([principal('alice')], 100);
    beginIdProviderPrincipalsAppend('user');

    expect(idProviderPrincipalsAppendStart('user')).toBeUndefined();
  });

  it('is nothing for a set that holds everything it has', () => {
    firstPage([principal('alice')], 1);

    expect(idProviderPrincipalsAppendStart('user')).toBeUndefined();
  });
});

describe('appendIdProviderPrincipals', () => {
  it('adds the page under the rows already loaded', () => {
    firstPage([principal('alice')], 3);
    beginIdProviderPrincipalsAppend('user');
    appendIdProviderPrincipals('ldap', 'user', ok({ total: 3, items: [principal('bob')] }));

    expect($idProviderPrincipals.get().users.items.map(({ displayName }) => displayName)).toEqual([
      'alice',
      'bob',
    ]);
  });

  // ! Offset paging over a set someone else is editing can answer with a row already on screen.
  it('drops a row the previous page already carried', () => {
    firstPage([principal('alice')], 9);
    beginIdProviderPrincipalsAppend('user');
    appendIdProviderPrincipals(
      'ldap',
      'user',
      ok({ total: 9, items: [principal('alice'), principal('bob')] }),
    );

    expect($idProviderPrincipals.get().users.items).toHaveLength(2);
  });

  // ! A page that adds nothing is the end of the list, or `Load more` stays on screen doing nothing.
  it('ends the paging when a page adds no row, however short of the total it is', () => {
    firstPage([principal('alice')], 500);
    beginIdProviderPrincipalsAppend('user');
    appendIdProviderPrincipals('ldap', 'user', ok({ total: 500, items: [] }));

    const { users } = $idProviderPrincipals.get();

    expect(idProviderPrincipalsHasMore(users)).toBe(false);
    expect(idProviderPrincipalsAppendStart('user')).toBeUndefined();
  });

  it('keeps the rows on screen when a page fails, and says so', () => {
    firstPage([principal('alice')], 100);
    beginIdProviderPrincipalsAppend('user');
    appendIdProviderPrincipals('ldap', 'user', err(new AppError('Offline')));

    const { users } = $idProviderPrincipals.get();

    expect(users.items).toHaveLength(1);
    expect(users.appending).toBe(false);
    expect(users.error).toBe('Offline');
  });

  it('leaves the other set alone', () => {
    firstPage([principal('alice')], 100);
    beginIdProviderPrincipalsAppend('user');
    appendIdProviderPrincipals('ldap', 'user', ok({ total: 100, items: [principal('bob')] }));

    expect($idProviderPrincipals.get().groups.items).toEqual([]);
  });

  // ! A page answering after the selection moved carries the previous provider's principals.
  it('drops a page read for a provider the panel has moved on from', () => {
    firstPage([principal('alice')], 100);
    beginIdProviderPrincipalsAppend('user');
    beginIdProviderPrincipalsLoad('other');
    appendIdProviderPrincipals('ldap', 'user', ok({ total: 100, items: [principal('bob')] }));

    const { key, users } = $idProviderPrincipals.get();

    expect(key).toBe('other');
    expect(users.items).toEqual([]);
  });

  it('reports no failure onto the provider that replaced the one the page was read for', () => {
    firstPage([principal('alice')], 100);
    beginIdProviderPrincipalsAppend('user');
    beginIdProviderPrincipalsLoad('other');
    appendIdProviderPrincipals('ldap', 'user', err(new AppError('Offline')));

    expect($idProviderPrincipals.get().users.error).toBeUndefined();
  });
});
