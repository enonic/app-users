import { describe, expect, it } from 'vitest';

import type { Group } from '../../../entities/principal';
import { sortGroups } from './groups.sort';

function group(name: string, displayName: string, provider = 'system'): Group {
  return {
    type: 'group',
    key: `group:${provider}:${name}`,
    displayName,
  };
}

const writers = group('writers', 'Writers', 'ldap');
const editors = group('editors', 'Editors', 'ldap');
const admins = group('admins', 'Admins');
const groups = [writers, admins, editors];

describe('sortGroups', () => {
  it('orders by display name in both directions', () => {
    expect(sortGroups(groups, 'displayNameAsc')).toEqual([admins, editors, writers]);
    expect(sortGroups(groups, 'displayNameDesc')).toEqual([writers, editors, admins]);
  });

  it('groups by the provider name the key carries, ordering by display name inside one', () => {
    expect(sortGroups(groups, 'idProviderAsc')).toEqual([editors, writers, admins]);
  });

  it('reverses the providers alone, leaving the names inside one ascending', () => {
    expect(sortGroups(groups, 'idProviderDesc')).toEqual([admins, editors, writers]);
  });
});
