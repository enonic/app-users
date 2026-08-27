import { describe, expect, it } from 'vitest';

import type { IdProvider } from '../../../entities/principal';
import { toIdProviderRow } from './id-providers.rows';

const provider: IdProvider = {
  key: 'ldap',
  displayName: 'Company directory',
  description: 'Everyone with a company account',
  application: { key: 'com.enonic.app.ldapidprovider', displayName: 'LDAP ID Provider' },
  users: { total: 0 },
  groups: { total: 0 },
};

describe('toIdProviderRow', () => {
  it('keys the row by the provider key so the route param matches', () => {
    expect(toIdProviderRow(provider).key).toBe('ldap');
  });

  it('shows the display name over the provider key', () => {
    const { title, subtitle } = toIdProviderRow(provider);

    expect(title).toBe('Company directory');
    expect(subtitle).toBe('ldap');
  });

  it('carries the bound application as its only meta cell', () => {
    expect(toIdProviderRow(provider).meta).toEqual(['LDAP ID Provider']);
  });

  it('renders no cell at all for a provider bound to no application', () => {
    const unbound: IdProvider = {
      key: 'partners',
      displayName: 'Partners',
      users: { total: 0 },
      groups: { total: 0 },
    };

    expect(toIdProviderRow(unbound).meta).toBeUndefined();
  });
});
