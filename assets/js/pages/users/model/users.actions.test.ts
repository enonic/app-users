import { describe, expect, it } from 'vitest';

import type { User } from '../../../entities/principal';
import type { ActionContext, SectionAction } from '../../../widgets/browse-toolbar/actions';
import { USER_ACTIONS } from './users.actions';

function user(idProvider: string, login: string): User {
  return {
    type: 'user',
    key: `user:${idProvider}:${login}`,
    displayName: login,
    login,
    idProvider,
    hasPassword: true,
  };
}

const su = user('system', 'su');
const anonymous = user('system', 'anonymous');
const jane = user('system', 'jane');
const alice = user('ldap', 'alice');

function context(overrides: Partial<ActionContext<User>> = {}): ActionContext<User> {
  return { selected: [], active: undefined, ...overrides };
}

function action(id: string): SectionAction<User> {
  const found = USER_ACTIONS.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`No user action with id ${id}`);
  }
  return found;
}

describe('user actions', () => {
  it('offers new, edit and delete in that order', () => {
    expect(USER_ACTIONS.map(({ id }) => id)).toEqual(['new', 'edit', 'delete']);
  });
});

describe('new user', () => {
  it('needs no target', () => {
    expect(action('new').enabled(context())).toBe(true);
  });
});

describe('edit user', () => {
  it('needs exactly one target', () => {
    expect(action('edit').enabled(context())).toBe(false);
    expect(action('edit').enabled(context({ selected: [jane] }))).toBe(true);
    expect(action('edit').enabled(context({ selected: [jane, alice] }))).toBe(false);
  });

  it('falls back to the active row when nothing is ticked', () => {
    expect(action('edit').enabled(context({ active: jane }))).toBe(true);
  });

  it('edits a platform user, which only delete refuses', () => {
    expect(action('edit').enabled(context({ selected: [su] }))).toBe(true);
  });
});

describe('delete user', () => {
  it('needs a target', () => {
    expect(action('delete').enabled(context())).toBe(false);
  });

  it('deletes one or more users an administrator created', () => {
    expect(action('delete').enabled(context({ selected: [jane] }))).toBe(true);
    expect(action('delete').enabled(context({ selected: [jane, alice] }))).toBe(true);
    expect(action('delete').enabled(context({ active: alice }))).toBe(true);
  });

  it('refuses the two users the platform owns', () => {
    expect(action('delete').enabled(context({ selected: [su] }))).toBe(false);
    expect(action('delete').enabled(context({ selected: [anonymous] }))).toBe(false);
  });

  it('refuses as soon as one platform user is a target', () => {
    expect(action('delete').enabled(context({ selected: [jane, su] }))).toBe(false);
  });
});
