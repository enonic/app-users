import { describe, expect, it } from 'vitest';

import type { Group } from '../../../entities/principal';
import { visibleEntries } from '../../../widgets/browse-list/browse-filter';
import { filterByIdProvider, idProviderEntries, searchGroups } from './groups.filter';

function group(key: string, displayName: string, description?: string, provider = 'system'): Group {
  return {
    type: 'group',
    key: `group:${provider}:${key}`,
    displayName,
    description,
  };
}

const editors = group('editors', 'Editors', 'Edits and publishes content');
const support = group('support', 'Support');
const developers = group('developers', 'Developers', undefined, 'ldap');
const groups = [editors, support];
const all = [editors, support, developers];

describe('searchGroups', () => {
  it('returns every group for an empty or blank query', () => {
    expect(searchGroups(groups, '')).toEqual(groups);
    expect(searchGroups(groups, '  ')).toEqual(groups);
  });

  it('matches the display name whatever the case', () => {
    expect(searchGroups(groups, 'SUPPORT')).toEqual([support]);
  });

  it('matches the description too', () => {
    expect(searchGroups(groups, 'publishes')).toEqual([editors]);
  });

  it('survives a group without a description', () => {
    expect(searchGroups(groups, 'sup')).toEqual([support]);
  });

  it('ignores the group key', () => {
    expect(searchGroups(groups, 'system')).toEqual([]);
  });

  it('leaves the groups it was given alone', () => {
    const original = [...groups];
    searchGroups(groups, 'editors');

    expect(groups).toEqual(original);
  });
});

describe('filterByIdProvider', () => {
  it('narrows nothing when no provider is ticked', () => {
    expect(filterByIdProvider(all, new Set())).toEqual(all);
  });

  it('keeps every group from the ticked provider', () => {
    expect(filterByIdProvider(all, new Set(['system']))).toEqual([editors, support]);
  });

  it('keeps the union of several ticked providers', () => {
    expect(filterByIdProvider(all, new Set(['system', 'ldap']))).toEqual(all);
  });

  it('answers empty when no group comes from the ticked provider', () => {
    expect(filterByIdProvider(all, new Set(['entraid']))).toEqual([]);
  });

  it('leaves the groups it was given alone', () => {
    const original = [...all];
    filterByIdProvider(all, new Set(['system']));

    expect(all).toEqual(original);
  });
});

describe('idProviderEntries', () => {
  // What the page hands in: the loaded providers, named as an administrator recognises them.
  const named = (key: Group['key']) =>
    ({ system: 'System', ldap: 'Company directory' })[key.split(':')[1] ?? ''];

  // What it hands in before the providers have arrived.
  const unnamed = () => undefined;

  it('offers one entry per provider, keyed by name and labelled by display name', () => {
    expect(idProviderEntries(all, all, named)).toEqual([
      { id: 'ldap', label: 'Company directory', count: 1 },
      { id: 'system', label: 'System', count: 2 },
    ]);
  });

  it('sorts by the label, so the order follows the names on screen', () => {
    expect(idProviderEntries(all, all, named).map(({ label }) => label)).toEqual([
      'Company directory',
      'System',
    ]);
  });

  it('falls back to the provider name while the providers are still loading', () => {
    expect(idProviderEntries(all, all, unnamed)).toEqual([
      { id: 'ldap', label: 'ldap', count: 1 },
      { id: 'system', label: 'system', count: 2 },
    ]);
  });

  it('counts the matched groups, so the counts follow the query', () => {
    const searched = searchGroups(all, 'support');

    expect(idProviderEntries(all, searched, named)).toEqual([
      { id: 'ldap', label: 'Company directory', count: 0 },
      { id: 'system', label: 'System', count: 1 },
    ]);
  });

  // ! The entry a search emptied still has to be offered, or a ticked one disappears from the menu while
  // ! it goes on narrowing the list — and with nothing matching there is no way left to untick it.
  it('keeps offering a provider the query matched nothing from', () => {
    const searched = searchGroups(all, 'nothing matches this');

    const offered = idProviderEntries(all, searched, named);
    expect(offered.map(({ id }) => id)).toEqual(['ldap', 'system']);
    expect(visibleEntries(offered, new Set(['ldap'])).map(({ id }) => id)).toEqual(['ldap']);
  });

  it('offers nothing on an instance with no groups', () => {
    expect(idProviderEntries([], [], named)).toEqual([]);
  });
});
