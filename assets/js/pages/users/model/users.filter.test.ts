import { describe, expect, it } from 'vitest';

import type { IdProviderUserCount } from '../../../entities/principal';
import { ID_PROVIDER_FIELD, providerField } from './users.filter';

function provider(key: string, displayName: string, users: number): IdProviderUserCount {
  return { key, displayName, mode: 'LOCAL', users };
}

const providers = [
  provider('system', 'System', 4),
  provider('ldap', 'Company directory', 7),
  provider('adfs', 'Federation', 0),
];

describe('providerField', () => {
  it('offers one value per provider, named and counted as the provider reports', () => {
    const field = providerField([provider('ldap', 'Company directory', 7)], 'ID provider');

    expect(field.id).toBe(ID_PROVIDER_FIELD);
    expect(field.label).toBe('ID provider');
    expect(field.values).toEqual([{ id: 'ldap', label: 'Company directory', count: 7 }]);
  });

  // ? The system store's users are the Service Accounts section's, so a value here could only
  // ? ever narrow the list to nothing.
  it('leaves the system store out', () => {
    expect(providerField(providers, 'ID provider').values.map(({ id }) => id)).toEqual([
      'ldap',
      'adfs',
    ]);
  });

  // ! The count is the provider's total under the search, not the loaded page's: a provider absent from
  // ! this page still has users to offer, and the number has to say so.
  it('carries a provider holding no users as a value that cannot be picked', () => {
    const [ldap, adfs] = providerField(providers, 'ID provider').values;

    expect(ldap?.count).toBe(7);
    expect(adfs?.count).toBe(0);
  });

  it('says its values are on their way while the counts load', () => {
    expect(providerField([], 'ID provider', { loading: true }).loading).toBe(true);
    expect(providerField(providers, 'ID provider').loading).toBeUndefined();
  });

  it('offers no value on an instance with no providers', () => {
    expect(providerField([], 'ID provider').values).toEqual([]);
  });
});
