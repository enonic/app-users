import { describe, expect, it } from 'vitest';

import type { Group } from '../../../entities/principal';
import { toGroupRow } from './groups.rows';

const group: Group = {
  type: 'group',
  key: 'group:ldap:developers',
  displayName: 'Developers',
  description: 'Deploys applications',
  modifiedTime: '2026-07-19T07:45:00Z',
};

describe('toGroupRow', () => {
  it('keys the row by the group key so the route param matches', () => {
    expect(toGroupRow(group).key).toBe('group:ldap:developers');
  });

  it('shows the display name over the group name', () => {
    const { title, subtitle } = toGroupRow(group);

    expect(title).toBe('Developers');
    expect(subtitle).toBe('developers');
  });

  it('names the provider in its only meta cell', () => {
    expect(toGroupRow(group, undefined, () => 'Company directory').meta).toEqual([
      'Company directory',
    ]);
  });

  it('leaves the cell out while the providers have not arrived', () => {
    expect(toGroupRow(group).meta).toBeUndefined();
  });

  it('carries the icon the page hands it', () => {
    expect(toGroupRow(group, 'icon').icon).toBe('icon');
  });
});
