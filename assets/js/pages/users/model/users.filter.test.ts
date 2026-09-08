import { describe, expect, it } from 'vitest';

import type { IdProviderUserCount } from '../../../entities/principal';
import { visibleEntries } from '../../../widgets/browse-list/browse-filter';
import { providerEntries } from './users.filter';

function provider(key: string, displayName: string, users: number): IdProviderUserCount {
  return { key, displayName, users };
}

const providers = [
  provider('system', 'System', 4),
  provider('ldap', 'Company directory', 7),
  provider('adfs', 'Federation', 0),
];

describe('providerEntries', () => {
  it('offers one entry per provider, named and counted as the provider reports', () => {
    expect(providerEntries([provider('ldap', 'Company directory', 7)])).toEqual([
      { id: 'ldap', label: 'Company directory', count: 7 },
    ]);
  });

  // ? The system store's users are the Service Accounts section's (#2674), so an entry here could only
  // ? ever narrow the list to nothing.
  it('leaves the system store out of the menu', () => {
    expect(providerEntries(providers).map(({ id }) => id)).toEqual(['ldap', 'adfs']);
  });

  // ! The count is the provider's whole total, not the loaded page's: a provider absent from this page
  // ! still has users to offer, and the number has to say so.
  it('leaves a provider holding no users out of the menu', () => {
    const shown = visibleEntries(providerEntries(providers), new Set());

    expect(shown.map(({ id }) => id)).toEqual(['ldap']);
  });

  it('keeps an empty provider that is ticked, so a filter can be unticked again', () => {
    const shown = visibleEntries(providerEntries(providers), new Set(['adfs']));

    expect(shown.map(({ id }) => id)).toEqual(['ldap', 'adfs']);
  });

  it('offers nothing on an instance with no providers', () => {
    expect(providerEntries([])).toEqual([]);
  });
});
