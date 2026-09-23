import { err, ok } from 'neverthrow';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppError } from '../../../shared/api';
import {
  $idProviderPrincipals,
  appendIdProviderPrincipals,
  beginIdProviderPrincipalsAppend,
  beginIdProviderPrincipalsLoad,
  forgetIdProviderPrincipals,
  idProviderPrincipalsNextStart,
  receiveIdProviderPrincipals,
} from './id-provider-principals.store';
import type { PrincipalKey, PrincipalRef } from './principal.types';

function principal(name: string): PrincipalRef {
  return { key: `user:ldap:${name}` as PrincipalKey, type: 'user', displayName: name };
}

function read(items: PrincipalRef[], total: number): void {
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
    read([principal('alice')], 4213);

    const { key, status, users } = $idProviderPrincipals.get();

    expect(key).toBe('ldap');
    expect(status).toBe('ready');
    expect(users.items).toHaveLength(1);
    expect(users.total).toBe(4213);
  });

  it('keeps nothing of a read that failed', () => {
    beginIdProviderPrincipalsLoad('ldap');
    receiveIdProviderPrincipals('ldap', err(new AppError('Offline')));

    expect($idProviderPrincipals.get().status).toBe('error');
    expect($idProviderPrincipals.get().users.items).toEqual([]);
  });
});

describe('appendIdProviderPrincipals', () => {
  it('adds the page after the rows already read', () => {
    read([principal('alice')], 3);
    beginIdProviderPrincipalsAppend('user');
    appendIdProviderPrincipals('user', ok({ total: 3, items: [principal('bob')] }));

    const { users } = $idProviderPrincipals.get();

    expect(users.items.map(({ displayName }) => displayName)).toEqual(['alice', 'bob']);
    expect(users.appending).toBe(false);
  });

  it('skips a row already read', () => {
    read([principal('alice')], 3);
    appendIdProviderPrincipals(
      'user',
      ok({ total: 3, items: [principal('alice'), principal('bob')] }),
    );

    expect($idProviderPrincipals.get().users.items).toHaveLength(2);
  });

  it('ends the paging on a page that adds nothing', () => {
    read([principal('alice')], 3);
    appendIdProviderPrincipals('user', ok({ total: 3, items: [] }));

    expect($idProviderPrincipals.get().users.total).toBe(1);
    expect(idProviderPrincipalsNextStart('user')).toBeUndefined();
  });

  it('keeps the rows read when a page fails', () => {
    read([principal('alice')], 3);
    beginIdProviderPrincipalsAppend('user');
    appendIdProviderPrincipals('user', err(new AppError('Offline')));

    const { users } = $idProviderPrincipals.get();

    expect(users.items).toHaveLength(1);
    expect(users.error).toBe('Offline');
    expect(users.appending).toBe(false);
  });
});

describe('idProviderPrincipalsNextStart', () => {
  it('starts where the rows read end', () => {
    read([principal('alice')], 3);

    expect(idProviderPrincipalsNextStart('user')).toBe(1);
  });

  it('has no page to ask for while one is on its way or the set is read', () => {
    read([principal('alice')], 1);
    expect(idProviderPrincipalsNextStart('user')).toBeUndefined();

    read([principal('alice')], 3);
    beginIdProviderPrincipalsAppend('user');
    expect(idProviderPrincipalsNextStart('user')).toBeUndefined();
  });
});
