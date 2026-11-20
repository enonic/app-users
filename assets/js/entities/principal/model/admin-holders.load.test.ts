import { AppError } from '@enonic/ui-utils';
import { errAsync, okAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { $config, type Config } from '../../../shared/config';
import { fetchAdminHolders } from '../api/admin-holders.api';
import { reloadAdminHolders } from './admin-holders.load';
import { $adminHolders, receiveAdminHolders } from './admin-holders.store';

vi.mock('../api/admin-holders.api', () => ({ fetchAdminHolders: vi.fn() }));

function callerIs(administrator: boolean): void {
  $config.set({ administrator } as Config);
}

beforeEach(() => {
  receiveAdminHolders(['role:system.admin']);
});

afterEach(() => {
  $config.set(undefined);
  vi.resetAllMocks();
});

describe('reloadAdminHolders', () => {
  it('replaces the holders with what the server answers', async () => {
    callerIs(false);
    vi.mocked(fetchAdminHolders).mockReturnValue(okAsync(['role:system.admin', 'user:corp:alice']));

    reloadAdminHolders();
    await Promise.resolve();

    expect([...$adminHolders.get()]).toEqual(['role:system.admin', 'user:corp:alice']);
  });

  it('keeps the holders it has when the read fails', async () => {
    callerIs(false);
    vi.mocked(fetchAdminHolders).mockReturnValue(errAsync(new AppError('Denied')));

    reloadAdminHolders();
    await Promise.resolve();

    expect([...$adminHolders.get()]).toEqual(['role:system.admin']);
  });

  it('asks nothing for an administrator, who is locked out of nothing', () => {
    callerIs(true);

    reloadAdminHolders();

    expect(fetchAdminHolders).not.toHaveBeenCalled();
  });
});
