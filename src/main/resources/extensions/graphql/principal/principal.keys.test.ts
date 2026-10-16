import { describe, expect, it } from 'vitest';

import {
  isImplicitRole,
  isPlatformRole,
  isSystemUser,
  toGroupKeys,
  toMemberKeys,
  toRoleKeys,
} from './principal.keys';

describe('isSystemUser', () => {
  it('holds for su and anonymous alone', () => {
    expect(isSystemUser('user:system:su')).toBe(true);
    expect(isSystemUser('user:system:anonymous')).toBe(true);
    expect(isSystemUser('user:system:alice')).toBe(false);
    expect(isSystemUser('user:ldap:su')).toBe(false);
  });
});

describe('isImplicitRole', () => {
  it('holds for Everyone and Authenticated alone', () => {
    expect(isImplicitRole('role:system.everyone')).toBe(true);
    expect(isImplicitRole('role:system.authenticated')).toBe(true);
    expect(isImplicitRole('role:system.admin')).toBe(false);
  });
});

describe('isPlatformRole', () => {
  it('holds for the system roles and the cms ones outside any project', () => {
    expect(isPlatformRole('role:system.admin')).toBe(true);
    expect(isPlatformRole('role:system.everyone')).toBe(true);
    expect(isPlatformRole('role:cms.admin')).toBe(true);
    expect(isPlatformRole('role:cms.cm.app')).toBe(true);
  });

  it('fails for a project role and a role an administrator created', () => {
    expect(isPlatformRole('role:cms.project.default.owner')).toBe(false);
    expect(isPlatformRole('role:store.manager')).toBe(false);
  });
});

describe('toRoleKeys', () => {
  it('passes role keys through, in order', () => {
    expect(toRoleKeys(['role:cms.admin', 'role:system.admin'])).toEqual([
      'role:cms.admin',
      'role:system.admin',
    ]);
  });

  it('refuses a group key, which the write guards would never read a provider off', () => {
    expect(() => toRoleKeys(['role:cms.admin', 'group:remote:staff'])).toThrow(
      'Not a role key: [group:remote:staff]',
    );
  });

  it('refuses a user key and a role key with a provider segment', () => {
    expect(() => toRoleKeys(['user:system:su'])).toThrow(/Not a role key/);
    expect(() => toRoleKeys(['role:system:admin'])).toThrow(/Not a role key/);
  });

  it('answers empty for an empty list', () => {
    expect(toRoleKeys([])).toEqual([]);
  });
});

describe('toGroupKeys', () => {
  it('passes group keys through', () => {
    expect(toGroupKeys(['group:system:editors'])).toEqual(['group:system:editors']);
  });

  it('refuses a role key and a user key', () => {
    expect(() => toGroupKeys(['role:cms.admin'])).toThrow('Not a group key: [role:cms.admin]');
    expect(() => toGroupKeys(['user:system:alice'])).toThrow(/Not a group key/);
  });
});

describe('toMemberKeys', () => {
  it('passes user and group keys through', () => {
    expect(toMemberKeys(['user:system:alice', 'group:system:editors'])).toEqual([
      'user:system:alice',
      'group:system:editors',
    ]);
  });

  it('refuses a role key: a role holds members, it is never one', () => {
    expect(() => toMemberKeys(['role:cms.admin'])).toThrow(
      'Not a user or group key: [role:cms.admin]',
    );
  });
});
