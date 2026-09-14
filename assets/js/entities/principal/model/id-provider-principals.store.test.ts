import { err, ok } from 'neverthrow';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppError } from '../../../shared/api';
import {
  $idProviderPrincipals,
  beginIdProviderPrincipalsLoad,
  forgetIdProviderPrincipals,
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
