import { err, ok } from 'neverthrow';
import { describe, expect, it } from 'vitest';

import { AppError } from '../../../shared/api';
import { $groups, beginGroupsLoad, receiveGroups } from './groups.store';
import type { Group } from './principal.types';

function group(name: string): Group {
  return {
    type: 'group',
    key: `group:system:${name}` as Group['key'],
    displayName: name,
  };
}

describe('groups.store', () => {
  it('starts out loading with nothing to show', () => {
    expect($groups.get().status).toBe('loading');
    expect($groups.get().items).toEqual([]);
  });

  it('reports the groups it is handed as ready', () => {
    receiveGroups(ok([group('administrators')]));

    const { status, items, error } = $groups.get();
    expect(status).toBe('ready');
    expect(items).toEqual([group('administrators')]);
    expect(error).toBeUndefined();
  });

  it('keeps the loaded groups on screen while a reload runs', () => {
    receiveGroups(ok([group('administrators')]));
    beginGroupsLoad();

    expect($groups.get().status).toBe('loading');
    expect($groups.get().items).toEqual([group('administrators')]);
  });

  it('drops the groups and keeps the message on failure', () => {
    receiveGroups(ok([group('administrators')]));
    receiveGroups(err(new AppError('Principals are unreachable')));

    const { status, items, error } = $groups.get();
    expect(status).toBe('error');
    expect(items).toEqual([]);
    expect(error).toBe('Principals are unreachable');
  });
});
