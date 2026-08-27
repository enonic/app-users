import { errAsync, okAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fakeHost, forgetNotifications, notified } from '../../../../../test/mocks/fake-host';
import { AppError } from '../../../shared/api';
import { setHost } from '../../../shared/host';
import { setPhrases } from '../../../shared/i18n';
import { createSelectionStore, type SelectionStore } from '../../../shared/selection';
import {
  sendIdProviderCreation,
  sendIdProviderDeletion,
  sendIdProviderUpdate,
} from '../api/id-providers.api';
import {
  createIdProvider,
  deleteIdProviders,
  updateIdProvider,
  type IdProviderDraft,
  type IdProviderSectionScope,
} from './id-provider-commands';
import type { IdProvider, PrincipalKey } from './principal.types';

vi.mock('../api/id-providers.api', () => ({
  sendIdProviderCreation: vi.fn(),
  sendIdProviderDeletion: vi.fn(),
  sendIdProviderUpdate: vi.fn(),
}));

const admins = {
  key: 'role:system.admin' as PrincipalKey,
  type: 'role' as const,
  displayName: 'Administrator',
};

function draft(overrides: Partial<IdProviderDraft> = {}): IdProviderDraft {
  return {
    name: 'ldap',
    displayName: 'Company directory',
    description: '',
    application: 'com.example.ldap',
    permissions: [{ principal: admins, access: 'ADMINISTRATOR' }],
    ...overrides,
  };
}

function written(displayName: string): IdProvider {
  return { key: 'ldap', displayName, users: { total: 0 }, groups: { total: 0 } };
}

function notificationTexts(): string[] {
  return notified.map(({ message }) => message);
}

let resync: () => void;
let closeItem: () => void;
let selection: SelectionStore;

function scope(activeKey?: string): IdProviderSectionScope {
  return { resync, closeItem, activeKey, selection };
}

beforeEach(() => {
  forgetNotifications();
  setHost(fakeHost());
  setPhrases(
    {
      'idProviders.notify.deleteFailed': 'Could not delete {0}',
      'idProviders.notify.deleteFailedReason': 'Could not delete {0}: {1}',
    },
    'en',
  );
  resync = vi.fn();
  closeItem = vi.fn();
  selection = createSelectionStore();
  vi.mocked(sendIdProviderCreation).mockReset();
  vi.mocked(sendIdProviderUpdate).mockReset();
  vi.mocked(sendIdProviderDeletion).mockReset();
});

describe('createIdProvider', () => {
  it('sends the permissions as principal keys, and trims what the form padded', () => {
    vi.mocked(sendIdProviderCreation).mockReturnValue(okAsync(written('Company directory')));

    void createIdProvider(draft({ name: ' ldap ', displayName: ' Company directory ' }));

    expect(vi.mocked(sendIdProviderCreation)).toHaveBeenCalledWith('ldap', {
      displayName: 'Company directory',
      description: undefined,
      application: 'com.example.ldap',
      permissions: [{ principal: 'role:system.admin', access: 'ADMINISTRATOR' }],
    });
  });

  it('reports an empty description and an empty application as absent', () => {
    vi.mocked(sendIdProviderCreation).mockReturnValue(okAsync(written('Company directory')));

    void createIdProvider(draft({ description: '   ', application: '' }));

    const input = vi.mocked(sendIdProviderCreation).mock.calls[0]?.[1];

    expect(input?.description).toBeUndefined();
    expect(input?.application).toBeUndefined();
  });
});

describe('updateIdProvider', () => {
  it('writes what the form holds against the key it was opened on', () => {
    vi.mocked(sendIdProviderUpdate).mockReturnValue(okAsync(written('Renamed')));

    void updateIdProvider('ldap', draft({ displayName: 'Renamed' }));

    expect(vi.mocked(sendIdProviderUpdate)).toHaveBeenCalledWith('ldap', {
      displayName: 'Renamed',
      description: undefined,
      application: 'com.example.ldap',
      permissions: [{ principal: 'role:system.admin', access: 'ADMINISTRATOR' }],
    });
  });
});

describe('deleteIdProviders', () => {
  const ldap = { key: 'ldap', displayName: 'Company directory' };
  const system = { key: 'system', displayName: 'System' };

  it('asks for nothing when there is nothing to delete', async () => {
    await deleteIdProviders([], scope());

    expect(vi.mocked(sendIdProviderDeletion)).not.toHaveBeenCalled();
  });

  it('clears the selection of what is gone and puts the list back in step', async () => {
    selection.toggle('ldap', true);
    vi.mocked(sendIdProviderDeletion).mockReturnValue(okAsync([{ key: 'ldap', deleted: true }]));

    await deleteIdProviders([ldap], scope());

    expect(selection.$selected.get().has('ldap')).toBe(false);
    expect(resync).toHaveBeenCalled();
  });

  it('names the provider and the reason a refusal came with', async () => {
    vi.mocked(sendIdProviderDeletion).mockReturnValue(
      okAsync([{ key: 'system', deleted: false, reason: 'It holds users' }]),
    );

    await deleteIdProviders([system], scope());

    expect(notificationTexts()).toEqual(['Could not delete System: It holds users']);
  });

  // ! `deleted: false` also covers a provider somebody else deleted first, so the list still reloads.
  it('reloads even when every key was refused', async () => {
    vi.mocked(sendIdProviderDeletion).mockReturnValue(okAsync([{ key: 'system', deleted: false }]));

    await deleteIdProviders([system], scope());

    expect(notificationTexts()).toEqual(['Could not delete System']);
    expect(resync).toHaveBeenCalled();
  });

  it('closes the details panel when the provider it shows is gone', async () => {
    vi.mocked(sendIdProviderDeletion).mockReturnValue(okAsync([{ key: 'ldap', deleted: true }]));

    await deleteIdProviders([ldap], scope('ldap'));

    expect(closeItem).toHaveBeenCalled();
  });

  it('leaves the panel alone when another provider was deleted', async () => {
    vi.mocked(sendIdProviderDeletion).mockReturnValue(okAsync([{ key: 'ldap', deleted: true }]));

    await deleteIdProviders([ldap], scope('system'));

    expect(closeItem).not.toHaveBeenCalled();
  });

  it('names every target when the request itself failed', async () => {
    vi.mocked(sendIdProviderDeletion).mockReturnValue(errAsync(new AppError('Offline')));

    await deleteIdProviders([ldap, system], scope());

    expect(notificationTexts()).toEqual([
      'Could not delete Company directory: Offline',
      'Could not delete System: Offline',
    ]);
    expect(resync).not.toHaveBeenCalled();
  });
});
