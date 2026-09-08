import { describe, expect, it } from 'vitest';

import { groupDraftFrom } from './group-draft';
import type { GroupForm } from './group-form';

const FORM: GroupForm = {
  idProvider: 'store',
  name: 'managers',
  displayName: 'Managers',
  description: 'Runs the shops',
  members: [{ key: 'user:store:alice', displayName: 'Alice', type: 'user' }],
  roles: [{ key: 'role:cms.admin', displayName: 'Administrator', type: 'role' }],
};

describe('groupDraftFrom', () => {
  it('flattens the picked principals to their keys', () => {
    const draft = groupDraftFrom(FORM);

    expect(draft.members).toEqual(['user:store:alice']);
    expect(draft.roles).toEqual(['role:cms.admin']);
  });

  it('carries the identity fields through untouched', () => {
    expect(groupDraftFrom(FORM)).toMatchObject({
      idProvider: 'store',
      name: 'managers',
      displayName: 'Managers',
      description: 'Runs the shops',
    });
  });

  it('drops the wizard-only field', () => {
    expect('nameEdited' in groupDraftFrom({ ...FORM, nameEdited: true })).toBe(false);
  });
});
