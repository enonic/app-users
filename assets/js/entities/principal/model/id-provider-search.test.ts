import { describe, expect, it } from 'vitest';

import { searchIdProviderNames } from './id-provider-search';
import type { IdProviderName } from './principal.types';

const PROVIDERS: IdProviderName[] = [
  { key: 'system', displayName: 'System ID Provider', mode: 'LOCAL' },
  { key: 'ldap', displayName: 'Corporate directory', mode: 'LOCAL' },
];

describe('searchIdProviderNames', () => {
  it('returns every provider for a blank query', () => {
    expect(searchIdProviderNames(PROVIDERS, '  ')).toEqual(PROVIDERS);
  });

  it('matches the display name case-insensitively', () => {
    expect(searchIdProviderNames(PROVIDERS, 'CORP').map(({ key }) => key)).toEqual(['ldap']);
  });

  it('matches the key', () => {
    expect(searchIdProviderNames(PROVIDERS, 'lda').map(({ key }) => key)).toEqual(['ldap']);
  });

  it('returns nothing when no field matches', () => {
    expect(searchIdProviderNames(PROVIDERS, 'oauth')).toEqual([]);
  });
});
