import { describe, expect, it } from 'vitest';

import type { Role } from '../../../entities/principal';
import { toRoleRow } from './roles.rows';

const role: Role = {
  type: 'role',
  key: 'role:store.manager',
  displayName: 'Store Manager',
  description: 'Manage products and orders',
  modifiedTime: '2026-07-21T08:05:00Z',
};

describe('toRoleRow', () => {
  it('keys the row by the role key so the route param matches', () => {
    expect(toRoleRow(role).key).toBe('role:store.manager');
  });

  it('shows the display name over the role name', () => {
    const { title, subtitle } = toRoleRow(role);

    expect(title).toBe('Store Manager');
    expect(subtitle).toBe('store.manager');
  });

  it('leaves the meta cells to the sections that have provenance to show', () => {
    expect(toRoleRow(role).meta).toBeUndefined();
  });

  it('carries the icon the page hands it', () => {
    expect(toRoleRow(role).icon).toBeUndefined();
    expect(toRoleRow(role, 'icon').icon).toBe('icon');
  });
});
