import { afterEach, describe, expect, it } from 'vitest';

import type { IdProvider } from '../../../entities/principal';
import { $idProviderEditor, closeIdProviderEditor } from '../../../features/idprovider-editor';
import type { ActionContext, SectionAction } from '../../../widgets/browse-toolbar/actions';
import { ID_PROVIDER_ACTIONS } from './id-providers.actions';

const system: IdProvider = {
  key: 'system',
  displayName: 'System',
  users: { total: 0 },
  groups: { total: 0 },
};
const empty: IdProvider = {
  key: 'partners',
  displayName: 'Partners',
  users: { total: 0 },
  groups: { total: 0 },
};
const populated: IdProvider = {
  key: 'ldap',
  displayName: 'Company directory',
  users: { total: 1 },
  groups: { total: 0 },
};
const grouped: IdProvider = {
  key: 'partners-old',
  displayName: 'Partners (old)',
  users: { total: 0 },
  groups: { total: 2 },
};

function context(overrides: Partial<ActionContext<IdProvider>> = {}): ActionContext<IdProvider> {
  return { selected: [], active: undefined, ...overrides };
}

function action(id: string): SectionAction<IdProvider> {
  const found = ID_PROVIDER_ACTIONS.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`No ID provider action with id ${id}`);
  }
  return found;
}

afterEach(() => {
  closeIdProviderEditor();
});

describe('ID provider actions', () => {
  it('offers new and delete in that order', () => {
    expect(ID_PROVIDER_ACTIONS.map(({ id }) => id)).toEqual(['new', 'delete']);
  });

  it('opens the editor with no provider to create one', () => {
    void action('new').run(context());

    expect($idProviderEditor.get()).toMatchObject({ open: true, mode: 'create' });
  });
});

describe('delete provider', () => {
  it('needs a target', () => {
    expect(action('delete').enabled(context())).toBe(false);
  });

  it('deletes an empty provider', () => {
    expect(action('delete').enabled(context({ selected: [empty] }))).toBe(true);
    expect(action('delete').enabled(context({ active: empty }))).toBe(true);
  });

  it('refuses the provider the installation is built on', () => {
    expect(action('delete').enabled(context({ selected: [system] }))).toBe(false);
  });

  it('refuses a provider that still has users', () => {
    expect(action('delete').enabled(context({ selected: [populated] }))).toBe(false);
    expect(action('delete').enabled(context({ selected: [empty, populated] }))).toBe(false);
  });

  // The platform deletes the provider's whole node path, so groups go with it as silently as users do.
  it('refuses a provider that still has groups', () => {
    expect(action('delete').enabled(context({ selected: [grouped] }))).toBe(false);
  });
});
