import { describe, expect, it } from 'vitest';

import type { IdProvider } from '../../../entities/principal';
import { visibleEntries } from '../../../widgets/browse-list/browse-filter';
import {
  applicationEntries,
  filterByApplication,
  searchIdProviders,
  UNBOUND_ENTRY,
} from './id-providers.filter';

const STANDARD = { key: 'com.enonic.app.standardidprovider', displayName: 'Standard ID Provider' };
const OIDC = { key: 'com.enonic.app.oidcidprovider', displayName: 'OIDC ID Provider' };

const system: IdProvider = {
  key: 'system',
  displayName: 'System',
  description: 'The users the installation was set up with',
  application: STANDARD,
  users: { total: 0 },
  groups: { total: 0 },
};

// Two providers on one application is what makes an application worth filtering by.
const staff: IdProvider = {
  key: 'staff',
  displayName: 'Staff',
  application: STANDARD,
  users: { total: 0 },
  groups: { total: 0 },
};

const entra: IdProvider = {
  key: 'entraid',
  displayName: 'EntraID',
  application: OIDC,
  users: { total: 0 },
  groups: { total: 0 },
};

// Bound to nothing, so it serves no login.
const partners: IdProvider = {
  key: 'partners',
  displayName: 'Partners',
  users: { total: 0 },
  groups: { total: 0 },
};

const providers = [system, partners];
const all = [system, staff, entra, partners];

describe('searchIdProviders', () => {
  it('returns every provider for an empty or blank query', () => {
    expect(searchIdProviders(providers, '')).toEqual(providers);
    expect(searchIdProviders(providers, '  ')).toEqual(providers);
  });

  it('matches the display name whatever the case', () => {
    expect(searchIdProviders(providers, 'PARTNERS')).toEqual([partners]);
  });

  it('matches the key, which is the provider name', () => {
    expect(searchIdProviders(providers, 'system')).toEqual([system]);
  });

  it('matches the description too', () => {
    expect(searchIdProviders(providers, 'installation')).toEqual([system]);
  });

  it('survives a provider without a description', () => {
    expect(searchIdProviders(providers, 'partn')).toEqual([partners]);
  });

  it('leaves the providers it was given alone', () => {
    const original = [...providers];
    searchIdProviders(providers, 'system');

    expect(providers).toEqual(original);
  });
});

describe('filterByApplication', () => {
  it('narrows nothing when no application is ticked', () => {
    expect(filterByApplication(all, new Set())).toEqual(all);
  });

  it('keeps every provider on the ticked application', () => {
    expect(filterByApplication(all, new Set([STANDARD.key]))).toEqual([system, staff]);
  });

  it('keeps the union of several ticked applications', () => {
    expect(filterByApplication(all, new Set([OIDC.key, UNBOUND_ENTRY]))).toEqual([entra, partners]);
  });

  it('collects the providers bound to nothing under one entry', () => {
    expect(filterByApplication(all, new Set([UNBOUND_ENTRY]))).toEqual([partners]);
  });

  it('leaves the providers it was given alone', () => {
    const original = [...all];
    filterByApplication(all, new Set([STANDARD.key]));

    expect(all).toEqual(original);
  });
});

describe('applicationEntries', () => {
  it('offers one entry per application, by display name, with the unbound last', () => {
    expect(applicationEntries(all, all, 'No application').map(({ id }) => id)).toEqual([
      OIDC.key,
      STANDARD.key,
      UNBOUND_ENTRY,
    ]);
  });

  it('names an entry after the application, not its key', () => {
    expect(applicationEntries(all, all, 'No application').map(({ label }) => label)).toEqual([
      'OIDC ID Provider',
      'Standard ID Provider',
      'No application',
    ]);
  });

  it('counts the providers on each application', () => {
    expect(applicationEntries(all, all, 'No application').map(({ count }) => count)).toEqual([
      1, 2, 1,
    ]);
  });

  it('leaves the unbound entry out when every provider is bound', () => {
    expect(
      applicationEntries([system, entra], [system, entra], 'No application').map(({ id }) => id),
    ).toEqual([OIDC.key, STANDARD.key]);
  });

  it('counts the matched providers, so the counts follow the query', () => {
    const searched = searchIdProviders(all, 'staff');

    expect(applicationEntries(all, searched, 'No application')).toEqual([
      { id: OIDC.key, label: 'OIDC ID Provider', count: 0 },
      { id: STANDARD.key, label: 'Standard ID Provider', count: 1 },
      { id: UNBOUND_ENTRY, label: 'No application', count: 0 },
    ]);
  });

  // ! The entry a search emptied still has to be offered, or a ticked one disappears from the menu while
  // ! it goes on narrowing the list — and with nothing matching there is no way left to untick it.
  it('keeps offering an application the query matched nothing from', () => {
    const searched = searchIdProviders(all, 'nothing matches this');

    const offered = applicationEntries(all, searched, 'No application');
    expect(offered.map(({ count }) => count)).toEqual([0, 0, 0]);
    expect(visibleEntries(offered, new Set([OIDC.key])).map(({ id }) => id)).toEqual([OIDC.key]);
  });

  it('offers nothing on an instance with no providers', () => {
    expect(applicationEntries([], [], 'No application')).toEqual([]);
  });
});
