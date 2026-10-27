import { describe, expect, it } from 'vitest';

import { searchApplications } from './application-search';
import type { IdProviderApplication } from './application.types';

const APPLICATIONS: IdProviderApplication[] = [
  {
    key: 'com.enonic.app.standardidprovider',
    displayName: 'Standard ID Provider',
    hasConfig: true,
  },
  { key: 'com.enonic.app.auth0', displayName: 'Auth0 ID Provider', hasConfig: true },
];

describe('searchApplications', () => {
  it('returns every application for a blank query', () => {
    expect(searchApplications(APPLICATIONS, '  ')).toEqual(APPLICATIONS);
  });

  it('matches the display name case-insensitively', () => {
    expect(searchApplications(APPLICATIONS, 'AUTH').map(({ key }) => key)).toEqual([
      'com.enonic.app.auth0',
    ]);
  });

  it('matches the key', () => {
    expect(searchApplications(APPLICATIONS, 'standardid').map(({ key }) => key)).toEqual([
      'com.enonic.app.standardidprovider',
    ]);
  });

  it('returns nothing when no field matches', () => {
    expect(searchApplications(APPLICATIONS, 'ldap')).toEqual([]);
  });
});
