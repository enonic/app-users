import { describe, expect, it } from 'vitest';

import { roleEditFrom } from './role-edit';
import type { RoleForm } from './role-form';

const ALICE = { key: 'user:store:alice', displayName: 'Alice', type: 'user' } as const;
const BOB = { key: 'user:store:bob', displayName: 'Bob', type: 'user' } as const;

const SAVED: RoleForm = {
  name: 'store.manager',
  displayName: 'Store Manager',
  description: '',
  members: [ALICE],
};

describe('roleEditFrom', () => {
  it('sends nothing to move while the members are untouched', () => {
    expect(roleEditFrom(SAVED, SAVED)).toMatchObject({ addMembers: [], removeMembers: [] });
  });

  it('names what moved rather than the list itself', () => {
    const edit = roleEditFrom({ ...SAVED, members: [BOB] }, SAVED);

    expect(edit.addMembers).toEqual(['user:store:bob']);
    expect(edit.removeMembers).toEqual(['user:store:alice']);
  });

  it('carries the scalars as typed, for the command to trim', () => {
    const edit = roleEditFrom({ ...SAVED, displayName: ' Shop Manager ', description: 'x' }, SAVED);

    expect(edit).toMatchObject({ displayName: ' Shop Manager ', description: 'x' });
  });
});
