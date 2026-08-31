import { errAsync, okAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../../shared/api';
import { setPhrases } from '../../../shared/i18n';
import { createSelectionStore, type SelectionStore } from '../../../shared/selection';
import { sendPrincipalDeletion } from '../api/principal-deletion.api';
import { deletePrincipals, type PrincipalSectionScope } from './principal-commands';
import type { PrincipalKey } from './principal.types';

vi.mock('../api/principal-deletion.api', () => ({
  sendPrincipalDeletion: vi.fn(),
}));

function target(key: string, displayName: string) {
  return { key: key as PrincipalKey, displayName };
}

const editors = target('role:editors', 'Editors');
const admin = target('role:system.admin', 'Administrator');

let resync: () => void;
let closeItem: () => void;
let selection: SelectionStore;

function scope(activeKey?: string): PrincipalSectionScope {
  return { resync, closeItem, activeKey, selection };
}

beforeEach(() => {
  setPhrases(
    {
      'principal.notify.deleted': '{0} deleted',
      'principal.notify.deletedMany': '{0} items deleted',
      'principal.notify.deleteFailed': 'Could not delete {0}',
      'principal.notify.deleteFailedReason': 'Could not delete {0}: {1}',
    },
    'en',
  );
  resync = vi.fn();
  closeItem = vi.fn();
  selection = createSelectionStore();
  vi.mocked(sendPrincipalDeletion).mockReset();
});

describe('deletePrincipals', () => {
  it('sends the keys of every target in one request', async () => {
    vi.mocked(sendPrincipalDeletion).mockReturnValue(
      okAsync([
        { key: editors.key, deleted: true },
        { key: admin.key, deleted: true },
      ]),
    );

    await deletePrincipals([editors, admin], scope());

    expect(sendPrincipalDeletion).toHaveBeenCalledTimes(1);
    expect(sendPrincipalDeletion).toHaveBeenCalledWith([editors.key, admin.key]);
  });

  it('names the one deleted principal and puts the list back in step', async () => {
    vi.mocked(sendPrincipalDeletion).mockReturnValue(
      okAsync([{ key: editors.key, deleted: true }]),
    );

    const notices = await deletePrincipals([editors], scope());

    expect(notices).toEqual({ success: 'Editors deleted', failures: [] });
    expect(resync).toHaveBeenCalledTimes(1);
  });

  it('reports a count when several principals went together', async () => {
    vi.mocked(sendPrincipalDeletion).mockReturnValue(
      okAsync([
        { key: editors.key, deleted: true },
        { key: admin.key, deleted: true },
      ]),
    );

    const notices = await deletePrincipals([editors, admin], scope());

    expect(notices).toEqual({ success: '2 items deleted', failures: [] });
  });

  it('names the principal the server refused, with the reason it gave', async () => {
    vi.mocked(sendPrincipalDeletion).mockReturnValue(
      okAsync([
        { key: editors.key, deleted: true },
        { key: admin.key, deleted: false, reason: 'Not allowed' },
      ]),
    );

    const notices = await deletePrincipals([editors, admin], scope());

    expect(notices).toEqual({
      success: 'Editors deleted',
      failures: ['Could not delete Administrator: Not allowed'],
    });
  });

  it('reports a refusal that carried no reason by name alone', async () => {
    vi.mocked(sendPrincipalDeletion).mockReturnValue(okAsync([{ key: admin.key, deleted: false }]));

    const notices = await deletePrincipals([admin], scope());

    expect(notices.success).toBeUndefined();
    expect(notices.failures).toEqual(['Could not delete Administrator']);
  });

  it('reloads the list even when every key was refused', async () => {
    vi.mocked(sendPrincipalDeletion).mockReturnValue(
      okAsync([{ key: admin.key, deleted: false, reason: 'Not allowed' }]),
    );

    await deletePrincipals([admin], scope());

    expect(resync).toHaveBeenCalledTimes(1);
  });

  it('unticks what is gone and leaves what is still there ticked', async () => {
    selection.replace([editors.key, admin.key]);
    vi.mocked(sendPrincipalDeletion).mockReturnValue(
      okAsync([
        { key: editors.key, deleted: true },
        { key: admin.key, deleted: false, reason: 'Not allowed' },
      ]),
    );

    await deletePrincipals([editors, admin], scope());

    expect([...selection.$selected.get()]).toEqual([admin.key]);
  });

  it('closes the details route when the item it was showing is gone', async () => {
    vi.mocked(sendPrincipalDeletion).mockReturnValue(
      okAsync([{ key: editors.key, deleted: true }]),
    );

    await deletePrincipals([editors], scope(editors.key));

    expect(closeItem).toHaveBeenCalledTimes(1);
  });

  it('leaves the details route alone when the open item was not a target', async () => {
    vi.mocked(sendPrincipalDeletion).mockReturnValue(
      okAsync([{ key: editors.key, deleted: true }]),
    );

    await deletePrincipals([editors], scope(admin.key));

    expect(closeItem).not.toHaveBeenCalled();
  });

  it('keeps the details route open when the item it shows was refused', async () => {
    vi.mocked(sendPrincipalDeletion).mockReturnValue(
      okAsync([{ key: admin.key, deleted: false, reason: 'Not allowed' }]),
    );

    await deletePrincipals([admin], scope(admin.key));

    expect(closeItem).not.toHaveBeenCalled();
  });

  it('reports every target when the request itself fails, and reloads nothing', async () => {
    vi.mocked(sendPrincipalDeletion).mockReturnValue(errAsync(new AppError('Forbidden')));

    const notices = await deletePrincipals([editors, admin], scope());

    expect(notices.success).toBeUndefined();
    expect(notices.failures).toEqual([
      'Could not delete Editors: Forbidden',
      'Could not delete Administrator: Forbidden',
    ]);
    expect(resync).not.toHaveBeenCalled();
    expect(closeItem).not.toHaveBeenCalled();
  });

  it('asks the server nothing for an empty target list', async () => {
    await deletePrincipals([], scope());

    expect(sendPrincipalDeletion).not.toHaveBeenCalled();
    expect(resync).not.toHaveBeenCalled();
  });
});
