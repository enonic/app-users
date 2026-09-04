import { describe, expect, it } from 'vitest';

import type { User } from '../../../entities/principal';
import type { ActionContext, SectionAction } from '../../../widgets/browse-toolbar/actions';
import { SERVICE_ACCOUNT_ACTIONS } from './service-accounts.actions';

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
  const found = SERVICE_ACCOUNT_ACTIONS.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`No service account action with id ${id}`);
  }
  return found;
}

describe('service account actions', () => {
  it('offers new, edit and delete in that order', () => {
    expect(SERVICE_ACCOUNT_ACTIONS.map(({ id }) => id)).toEqual(['new', 'edit', 'delete']);
  });
});

describe('new service account', () => {
  it('needs no target', () => {
    expect(action('new').enabled(context())).toBe(true);
  });
});

describe('edit service account', () => {
  it('needs exactly one target', () => {
    expect(action('edit').enabled(context())).toBe(false);
    expect(action('edit').enabled(context({ selected: [reporting] }))).toBe(true);
    expect(action('edit').enabled(context({ selected: [reporting, indexer] }))).toBe(false);
  });

  it('falls back to the active row when nothing is ticked', () => {
    expect(action('edit').enabled(context({ active: reporting }))).toBe(true);
  });

  it('edits a platform user, which only delete refuses', () => {
    expect(action('edit').enabled(context({ selected: [su] }))).toBe(true);
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
