import { describe, expect, it } from 'vitest';

import type { Group } from '../../../entities/principal';
import {
  filterByIdProvider,
  ID_PROVIDER_FIELD,
  idProviderField,
  searchGroups,
} from './groups.filter';

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

  // Several text tags join into one query, so every word has to count on its own.
  it('needs every word, in any order and across fields', () => {
    expect(searchGroups(groups, 'publishes editors')).toEqual([editors]);
    expect(searchGroups(groups, 'editors nobody')).toEqual([]);
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

describe('idProviderField', () => {
  // What the page hands in: the loaded providers, named as an administrator recognises them.
  const named = (key: Group['key']) =>
    ({ system: 'System', ldap: 'Company directory' })[key.split(':')[1] ?? ''];

  // What it hands in before the providers have arrived.
  const unnamed = () => undefined;

  it('is the ID provider field, named as the page says', () => {
    const field = idProviderField(all, all, named, 'ID provider');

    expect(field.id).toBe(ID_PROVIDER_FIELD);
    expect(field.label).toBe('ID provider');
  });

  it('offers one value per provider, keyed by name and labelled by display name', () => {
    expect(idProviderField(all, all, named, 'ID provider').values).toEqual([
      { id: 'ldap', label: 'Company directory', count: 1 },
      { id: 'system', label: 'System', count: 2 },
    ]);
  });

  it('sorts by the label, so the order follows the names on screen', () => {
    expect(
      idProviderField(all, all, named, 'ID provider').values.map(({ label }) => label),
    ).toEqual(['Company directory', 'System']);
  });

  it('falls back to the provider name while the providers are still loading', () => {
    expect(idProviderField(all, all, unnamed, 'ID provider').values).toEqual([
      { id: 'ldap', label: 'ldap', count: 1 },
      { id: 'system', label: 'system', count: 2 },
    ]);
  });

  it('counts the matched groups, so the counts follow the query', () => {
    const searched = searchGroups(all, 'support');

    expect(idProviderField(all, searched, named, 'ID provider').values).toEqual([
      { id: 'ldap', label: 'Company directory', count: 0 },
      { id: 'system', label: 'System', count: 1 },
    ]);
  });

  // ! A value the search emptied is still there, or a term holding it would go on narrowing the list
  // ! with nothing in the filter to say so; it just cannot be picked.
  it('keeps a provider the query matched nothing from, as a value that cannot be picked', () => {
    const searched = searchGroups(all, 'nothing matches this');

    const { values } = idProviderField(all, searched, named, 'ID provider');
    expect(values.map(({ id }) => id)).toEqual(['ldap', 'system']);
    expect(values.map(({ count }) => count)).toEqual([0, 0]);
  });

  it('offers no value on an instance with no groups', () => {
    expect(idProviderField([], [], named, 'ID provider').values).toEqual([]);
  });
});
