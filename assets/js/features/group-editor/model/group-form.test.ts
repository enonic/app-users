import { describe, expect, it } from 'vitest';

import type { Group, PrincipalRef } from '../../../entities/principal';
import {
  GROUP_FORM_FIELDS,
  initialGroupForm,
  nextGroupForm,
  sameGroupForm,
  validateGroupForm,
  type GroupForm,
} from './group-form';

const group: Group = {
  type: 'group',
  key: 'group:store:managers',
  displayName: 'Store Managers',
  description: 'Runs the shops',
};

const members = [{ key: 'user:store:alice', type: 'user', displayName: 'Alice' }] as const;

const roles = [
  { key: 'role:cms.admin', type: 'role', displayName: 'Content Studio Administrator' },
] as const;

function form(overrides: Partial<GroupForm> = {}): GroupForm {
  return {
    idProvider: 'store',
    name: 'managers',
    displayName: 'Store Managers',
    description: '',
    members: [],
    roles: [],
    ...overrides,
  };
}

describe('initialGroupForm', () => {
  it('starts empty for a new group, on the provider it was given', () => {
    expect(initialGroupForm({ mode: 'create' }, 'store')).toEqual({
      idProvider: 'store',
      name: '',
      displayName: '',
      description: '',
      members: [],
      roles: [],
    });
  });

  it('starts on no provider when there is none to default to', () => {
    expect(initialGroupForm({ mode: 'create' }).idProvider).toBe('');
  });

  it('reads the provider and the name out of the key', () => {
    const values = initialGroupForm({ mode: 'edit', group });

    expect(values.idProvider).toBe('store');
    expect(values.name).toBe('managers');
  });

  it('takes members and roles it is handed, separately', () => {
    const values = initialGroupForm({ mode: 'edit', group }, '', members, roles);

    expect(values.members).toEqual(members);
    expect(values.roles).toEqual(roles);
  });

  it('starts with neither while they are still being loaded', () => {
    const values = initialGroupForm({ mode: 'edit', group });

    expect(values.members).toEqual([]);
    expect(values.roles).toEqual([]);
  });

  it('reads a missing description as an empty field', () => {
    expect(
      initialGroupForm({ mode: 'edit', group: { ...group, description: undefined } }).description,
    ).toBe('');
  });
});

describe('nextGroupForm', () => {
  const previous = form();

  it('lets the name follow the display name while the user has not touched it', () => {
    const next = { ...previous, displayName: 'Store Floor Managers' };

    expect(nextGroupForm(previous, next, 'create', false)).toEqual({
      values: { ...next, name: 'store.floor.managers' },
      nameEdited: false,
    });
  });

  it('keeps a typed name exactly as typed, in the same edit that reports it', () => {
    const next = { ...previous, name: 'm' };

    expect(nextGroupForm(previous, next, 'create', false)).toEqual({
      values: next,
      nameEdited: true,
    });
  });

  it('never derives while editing, where the name is fixed', () => {
    const next = { ...previous, displayName: 'Renamed' };

    expect(nextGroupForm(previous, next, 'edit', false).values.name).toBe('managers');
  });

  it('leaves a provider change alone', () => {
    const next = { ...previous, idProvider: 'system' };

    expect(nextGroupForm(previous, next, 'create', false).values.idProvider).toBe('system');
  });
});

describe('sameGroupForm', () => {
  const alice = { key: 'user:store:alice', type: 'user', displayName: 'Alice' } as PrincipalRef;
  const bob = { key: 'user:store:bob', type: 'user', displayName: 'Bob' } as PrincipalRef;
  const admin = { key: 'role:cms.admin', type: 'role', displayName: 'CS Admin' } as PrincipalRef;

  it('reports an untouched form as unchanged', () => {
    expect(sameGroupForm(form(), form())).toBe(true);
  });

  it('sees a renamed group', () => {
    expect(sameGroupForm(form(), form({ displayName: 'Shop Managers' }))).toBe(false);
  });

  it('sees a re-described group, and a cleared description too', () => {
    expect(sameGroupForm(form(), form({ description: 'Something else' }))).toBe(false);
    expect(sameGroupForm(form({ description: 'Runs the shops' }), form({ description: '' }))).toBe(
      false,
    );
  });

  // The command trims before sending, so a change that survives trimming is the only kind there is.
  it('ignores whitespace the save would trim away', () => {
    expect(sameGroupForm(form(), form({ displayName: '  Store Managers  ' }))).toBe(true);
  });

  it('sees a member added and a member removed', () => {
    expect(sameGroupForm(form({ members: [alice] }), form({ members: [alice, bob] }))).toBe(false);
    expect(sameGroupForm(form({ members: [alice, bob] }), form({ members: [alice] }))).toBe(false);
  });

  // The two lists are separate arguments, so a change to either has to be seen on its own.
  it('sees a role added while the members stood still', () => {
    expect(
      sameGroupForm(form({ members: [alice] }), form({ members: [alice], roles: [admin] })),
    ).toBe(false);
  });

  it('ignores the order either list is held in', () => {
    expect(sameGroupForm(form({ members: [alice, bob] }), form({ members: [bob, alice] }))).toBe(
      true,
    );
  });
});

describe('validateGroupForm', () => {
  it('passes a filled form', () => {
    expect(validateGroupForm(form(), 'create')).toEqual({});
  });

  it('requires a display name', () => {
    expect(validateGroupForm(form({ displayName: ' ' }), 'create').displayName).toBe(
      'groups.dialog.displayNameRequired',
    );
  });

  it('requires a provider while creating, because the key carries it', () => {
    expect(validateGroupForm(form({ idProvider: '' }), 'create').idProvider).toBe(
      'groups.dialog.idProviderRequired',
    );
  });

  it('requires a name while creating', () => {
    expect(validateGroupForm(form({ name: '' }), 'create').name).toBe('groups.dialog.nameRequired');
  });

  it('refuses a name carrying a character XP rejects', () => {
    expect(validateGroupForm(form({ name: 'store managers' }), 'create').name).toBe(
      'groups.dialog.nameInvalid',
    );
  });

  // Both are fixed once the group exists: the key holds the provider and the name.
  it('says nothing about the provider or the name while editing', () => {
    expect(validateGroupForm(form({ idProvider: '', name: '' }), 'edit')).toEqual({});
  });
});

describe('GROUP_FORM_FIELDS', () => {
  it('names every field the validator can complain about', () => {
    const invalid = validateGroupForm(
      form({ idProvider: '', name: '', displayName: '' }),
      'create',
    );

    expect(Object.keys(invalid).length).toBeGreaterThan(0);
    expect(Object.keys(invalid).every((field) => GROUP_FORM_FIELDS.includes(field as never))).toBe(
      true,
    );
  });
});
