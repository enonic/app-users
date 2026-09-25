import { describe, expect, it } from 'vitest';

import {
  idProviderOf,
  isPlatformRole,
  isReservedRole,
  isSystemUser,
  principalName,
  principalRefOf,
  projectRoleIdOf,
} from './principal.keys';

describe('projectRoleIdOf', () => {
  it('reads the project out of a project role key', () => {
    expect(projectRoleIdOf('role:cms.project.intranet.editor')).toBe('intranet');
  });

  it('reads a project id that itself contains dots', () => {
    expect(projectRoleIdOf('role:cms.project.intranet.no.viewer')).toBe('intranet.no');
  });

  it('answers undefined for a role that belongs to no project', () => {
    expect(projectRoleIdOf('role:cms.admin')).toBeUndefined();
    expect(projectRoleIdOf('role:store.manager')).toBeUndefined();
  });
});

describe('isPlatformRole', () => {
  it('holds for a role the platform ships', () => {
    expect(isPlatformRole('role:system.admin')).toBe(true);
    expect(isPlatformRole('role:system.everyone')).toBe(true);
  });

  it('holds for the cms roles a role:system. check alone misses', () => {
    expect(isPlatformRole('role:cms.admin')).toBe(true);
    expect(isPlatformRole('role:cms.cm.app')).toBe(true);
    expect(isPlatformRole('role:cms.expert')).toBe(true);
  });

  it('fails for a project role, which the platform does not own', () => {
    expect(isPlatformRole('role:cms.project.default.owner')).toBe(false);
  });

  it('fails for a role an administrator created', () => {
    expect(isPlatformRole('role:store.manager')).toBe(false);
  });

  it('fails for a principal that is not a role', () => {
    expect(isPlatformRole('user:system:su')).toBe(false);
    expect(isPlatformRole('group:system:administrators')).toBe(false);
  });
});

describe('isReservedRole', () => {
  it('holds for a platform role', () => {
    expect(isReservedRole('role:system.admin')).toBe(true);
    expect(isReservedRole('role:cms.admin')).toBe(true);
  });

  it('holds for a project role, whose deletion would break the project', () => {
    expect(isReservedRole('role:cms.project.default.owner')).toBe(true);
  });

  it('fails for a role an administrator created', () => {
    expect(isReservedRole('role:store.manager')).toBe(false);
  });
});

describe('isSystemUser', () => {
  it('holds for the two users the platform owns', () => {
    expect(isSystemUser('user:system:su')).toBe(true);
    expect(isSystemUser('user:system:anonymous')).toBe(true);
  });

  it('fails for a user an administrator created, even in the system provider', () => {
    expect(isSystemUser('user:system:jane')).toBe(false);
    expect(isSystemUser('user:ldap:alice')).toBe(false);
  });
});

describe('principalName', () => {
  it('takes the name a role key ends with, dots and all', () => {
    expect(principalName('role:cms.admin')).toBe('cms.admin');
    expect(principalName('role:cms.project.default.owner')).toBe('cms.project.default.owner');
  });

  it('takes the name after the provider for a user or a group', () => {
    expect(principalName('user:ldap:alice')).toBe('alice');
    expect(principalName('group:system:administrators')).toBe('administrators');
  });
});

describe('idProviderOf', () => {
  it('reads the provider out of a user or group key', () => {
    expect(idProviderOf('user:system:su')).toBe('system');
    expect(idProviderOf('group:ldap:developers')).toBe('ldap');
  });

  it('gives a role no provider', () => {
    expect(idProviderOf('role:system.admin')).toBeUndefined();
  });
});

describe('principalRefOf', () => {
  it('names a user or a group by the name its key ends with', () => {
    expect(principalRefOf('user:ldap:alice')).toEqual({
      type: 'user',
      key: 'user:ldap:alice',
      displayName: 'alice',
    });
    expect(principalRefOf('group:system:administrators')).toEqual({
      type: 'group',
      key: 'group:system:administrators',
      displayName: 'administrators',
    });
  });

  it('names a role by everything after the prefix, dots and all', () => {
    expect(principalRefOf('role:cms.project.default.owner')).toEqual({
      type: 'role',
      key: 'role:cms.project.default.owner',
      displayName: 'cms.project.default.owner',
    });
  });

  it('answers undefined for a string that is no principal key', () => {
    expect(principalRefOf('alice')).toBeUndefined();
    expect(principalRefOf('user:alice')).toBeUndefined();
    expect(principalRefOf('role:system:admin')).toBeUndefined();
    expect(principalRefOf('user::alice')).toBeUndefined();
    expect(principalRefOf('')).toBeUndefined();
  });
});
