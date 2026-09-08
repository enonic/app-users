import { describe, expect, it } from 'vitest';

import { groupEditFrom } from './group-edit';
import type { GroupForm } from './group-form';

const ALICE = { key: 'user:store:alice', displayName: 'Alice', type: 'user' } as const;
const BOB = { key: 'user:store:bob', displayName: 'Bob', type: 'user' } as const;
const ADMIN = { key: 'role:cms.admin', displayName: 'Administrator', type: 'role' } as const;

const SAVED: GroupForm = {
  idProvider: 'store',
  name: 'managers',
  displayName: 'Managers',
  description: '',
  members: [ALICE],
  roles: [ADMIN],
};

describe('groupEditFrom', () => {
  it('sends nothing to move while the lists are untouched', () => {
    expect(groupEditFrom(SAVED, SAVED)).toMatchObject({
      addMembers: [],
      removeMembers: [],
      addRoles: [],
      removeRoles: [],
    });
  });

  it('names what moved rather than the lists themselves', () => {
    const edit = groupEditFrom({ ...SAVED, members: [BOB], roles: [] }, SAVED);

    expect(edit.addMembers).toEqual(['user:store:bob']);
    expect(edit.removeMembers).toEqual(['user:store:alice']);
    expect(edit.removeRoles).toEqual(['role:cms.admin']);
  });

  it('carries the scalars as typed, for the command to trim', () => {
    const edit = groupEditFrom(
      { ...SAVED, displayName: ' Shop Managers ', description: 'x' },
      SAVED,
    );

    expect(edit).toMatchObject({ displayName: ' Shop Managers ', description: 'x' });
  });
});
