import { err, ok } from 'neverthrow';
import { describe, expect, it } from 'vitest';

import { AppError } from '../../../shared/api';
import type { Role } from './principal.types';
import { $roles, beginRolesLoad, receiveRoles } from './roles.store';

function role(key: string): Role {
  return {
    type: 'role',
    key: `role:${key}` as Role['key'],
    displayName: key,
    modifiedTime: '2026-07-21T08:05:00Z',
  };
}

describe('roles.store', () => {
  it('starts out loading with nothing to show', () => {
    expect($roles.get().status).toBe('loading');
    expect($roles.get().items).toEqual([]);
  });

  it('reports the roles it is handed as ready', () => {
    receiveRoles(ok([role('admin')]));

    const { status, items, error } = $roles.get();
    expect(status).toBe('ready');
    expect(items).toEqual([role('admin')]);
    expect(error).toBeUndefined();
  });

  it('keeps the loaded roles on screen while a reload runs', () => {
    receiveRoles(ok([role('admin')]));
    beginRolesLoad();

    const { status, items } = $roles.get();
    expect(status).toBe('loading');
    expect(items).toEqual([role('admin')]);
  });

  it('drops the roles and keeps the message on failure', () => {
    receiveRoles(ok([role('admin')]));
    receiveRoles(err(new AppError('Principals are unreachable')));

    const { status, items, error } = $roles.get();
    expect(status).toBe('error');
    expect(items).toEqual([]);
    expect(error).toBe('Principals are unreachable');
  });
});
