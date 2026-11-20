import { describe, expect, it } from 'vitest';

import type { User } from '../../../entities/principal';
import type { ActionContext, SectionAction } from '../../../widgets/browse-toolbar/actions';
import { createUserActions } from './users.actions';

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
  const found = createUserActions(true).find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`No user action with id ${id}`);
  }
  return found;
}

describe('user actions', () => {
  it('offers new and delete in that order', () => {
    expect(createUserActions(true).map(({ id }) => id)).toEqual(['new', 'delete']);
  });
});

describe('new user', () => {
  it('needs no target', () => {
    expect(action('new').enabled(context())).toBe(true);
  });

  it('is off when no provider takes a new user', () => {
    const create = createUserActions(false).find(({ id }) => id === 'new');

    expect(create?.enabled(context())).toBe(false);
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

describe('Delete, when a target holds the administrator role and the caller does not', () => {
  const holder = { key: 'user:corp:alice', displayName: 'Holder' } as never;
  const other = { key: 'user:corp:alice-other', displayName: 'Other' } as never;
  const remove = createUserActions(true, new Set(['user:corp:alice'])).find(
    ({ id }) => id === 'delete',
  );

  it('is not offered for a selection it is part of', () => {
    expect(remove?.enabled({ selected: [holder, other], active: undefined })).toBe(false);
  });

  it('is offered for the rest', () => {
    expect(remove?.enabled({ selected: [other], active: undefined })).toBe(true);
  });
});
