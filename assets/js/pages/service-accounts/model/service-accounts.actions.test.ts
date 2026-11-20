import { describe, expect, it } from 'vitest';

import type { User } from '../../../entities/principal';
import type { ActionContext, SectionAction } from '../../../widgets/browse-toolbar/actions';
import { createServiceAccountActions } from './service-accounts.actions';

function account(login: string): User {
  return {
    type: 'user',
    key: `user:system:${login}`,
    displayName: login,
    login,
    idProvider: 'system',
    hasPassword: true,
  };
}

const su = account('su');
const anonymous = account('anonymous');
const reporting = account('reporting');
const indexer = account('indexer');

function context(overrides: Partial<ActionContext<User>> = {}): ActionContext<User> {
  return { selected: [], active: undefined, ...overrides };
}

function action(id: string): SectionAction<User> {
  const found = createServiceAccountActions().find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`No service account action with id ${id}`);
  }
  return found;
}

describe('service account actions', () => {
  it('offers new and delete in that order', () => {
    expect(createServiceAccountActions().map(({ id }) => id)).toEqual(['new', 'delete']);
  });
});

describe('new service account', () => {
  it('needs no target', () => {
    expect(action('new').enabled(context())).toBe(true);
  });
});

describe('delete service account', () => {
  it('needs a target', () => {
    expect(action('delete').enabled(context())).toBe(false);
  });

  it('deletes one or more accounts an administrator created', () => {
    expect(action('delete').enabled(context({ selected: [reporting] }))).toBe(true);
    expect(action('delete').enabled(context({ selected: [reporting, indexer] }))).toBe(true);
    expect(action('delete').enabled(context({ active: indexer }))).toBe(true);
  });

  it('refuses the two users the platform owns', () => {
    expect(action('delete').enabled(context({ selected: [su] }))).toBe(false);
    expect(action('delete').enabled(context({ selected: [anonymous] }))).toBe(false);
  });

  it('refuses as soon as one platform user is a target', () => {
    expect(action('delete').enabled(context({ selected: [reporting, su] }))).toBe(false);
  });
});

describe('Delete, when a target holds the administrator role and the caller does not', () => {
  const holder = { key: 'user:system:ci', displayName: 'Holder' } as never;
  const other = { key: 'user:system:ci-other', displayName: 'Other' } as never;
  const remove = createServiceAccountActions(new Set(['user:system:ci'])).find(
    ({ id }) => id === 'delete',
  );

  it('is not offered for a selection it is part of', () => {
    expect(remove?.enabled({ selected: [holder, other], active: undefined })).toBe(false);
  });

  it('is offered for the rest', () => {
    expect(remove?.enabled({ selected: [other], active: undefined })).toBe(true);
  });
});
