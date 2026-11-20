import { getMembers, hasRole, type Group, type User } from '/lib/xp/auth';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  adminHolderKeys,
  administratorOnlyKeys,
  isAdministratorCaller,
  requireChangeableMembers,
  requireIdProviderAdministrator,
  requireModifiable,
} from './administrator';

afterEach(() => {
  vi.resetAllMocks();
});

function user(key: string): User {
  return {
    type: 'user',
    key: key as User['key'],
    displayName: key,
    login: key,
    idProvider: 'corp',
    hasPassword: true,
  };
}

function group(key: string): Group {
  return {
    type: 'group',
    key: key as Group['key'],
    displayName: key,
    modifiedTime: '2026-08-01T10:00:00Z',
  };
}

function members(tree: Record<string, (User | Group)[]>): void {
  vi.mocked(getMembers).mockImplementation((key) => tree[key] ?? []);
}

function callerHolds(...roles: string[]): void {
  vi.mocked(hasRole).mockImplementation((role) => roles.includes(role));
}

describe('isAdministratorCaller', () => {
  it.each([
    { roles: ['role:system.admin'], expected: true },
    { roles: ['role:system.user.admin'], expected: false },
    { roles: [], expected: false },
  ])('answers $expected for a caller holding $roles', ({ roles, expected }) => {
    callerHolds(...roles);

    expect(isAdministratorCaller()).toBe(expected);
  });
});

describe('adminHolderKeys', () => {
  it('collects the role, its members and the members of its groups, however deep', () => {
    members({
      'role:system.admin': [user('user:system:su'), group('group:system:ops')],
      'group:system:ops': [user('user:corp:alice'), group('group:corp:oncall')],
      'group:corp:oncall': [user('user:corp:bob')],
    });

    expect([...adminHolderKeys()].sort()).toEqual([
      'group:corp:oncall',
      'group:system:ops',
      'role:system.admin',
      'user:corp:alice',
      'user:corp:bob',
      'user:system:su',
    ]);
  });

  it('reads each group once when groups hold each other', () => {
    members({
      'role:system.admin': [group('group:corp:a')],
      'group:corp:a': [group('group:corp:b')],
      'group:corp:b': [group('group:corp:a')],
    });

    expect([...adminHolderKeys()].sort()).toEqual([
      'group:corp:a',
      'group:corp:b',
      'role:system.admin',
    ]);
    expect(vi.mocked(getMembers)).toHaveBeenCalledTimes(3);
  });

  it('never asks for the members of a user', () => {
    members({ 'role:system.admin': [user('user:corp:alice')] });

    adminHolderKeys();

    expect(vi.mocked(getMembers).mock.calls).toEqual([['role:system.admin']]);
  });
});

describe('administratorOnlyKeys', () => {
  it('is the holders for a caller without the administrator role', () => {
    callerHolds('role:system.user.admin');
    members({ 'role:system.admin': [user('user:corp:alice')] });

    expect([...administratorOnlyKeys()].sort()).toEqual(['role:system.admin', 'user:corp:alice']);
  });

  it('is nobody for an administrator, who reads no members to learn it', () => {
    callerHolds('role:system.admin');

    expect(administratorOnlyKeys().size).toBe(0);
    expect(vi.mocked(getMembers)).not.toHaveBeenCalled();
  });
});

describe("the refusals, in the platform's own words", () => {
  const adminOnly = new Set(['role:system.admin', 'group:system:ops', 'user:corp:alice']);

  it("refuses to modify a principal that is an administrator's alone", () => {
    expect(() => requireModifiable(adminOnly, ['user:corp:bob', 'user:corp:alice'])).toThrow(
      '[user:corp:alice] can only be modified by an administrator',
    );
  });

  it("refuses to change the members of a holder that is an administrator's alone", () => {
    expect(() => requireChangeableMembers(adminOnly, ['role:editors', 'group:system:ops'])).toThrow(
      'Members of [group:system:ops] can only be changed by an administrator',
    );
  });

  it('lets every other principal through', () => {
    expect(() => requireModifiable(adminOnly, ['user:corp:bob'])).not.toThrow();
    expect(() => requireChangeableMembers(adminOnly, ['role:editors'])).not.toThrow();
  });

  it('refuses a provider to a caller without the administrator role', () => {
    callerHolds('role:system.user.admin');

    expect(() => requireIdProviderAdministrator('intranet')).toThrow(
      '[intranet] id provider can only be managed by an administrator',
    );
  });

  it('lets an administrator manage a provider', () => {
    callerHolds('role:system.admin');

    expect(() => requireIdProviderAdministrator('intranet')).not.toThrow();
  });
});
