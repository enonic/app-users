import { errAsync, okAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../../shared/api';

const { fetchRepositories } = vi.hoisted(() => ({ fetchRepositories: vi.fn() }));

vi.mock('../api/repositories.api', () => ({ fetchRepositories }));

const REPOSITORIES = [{ id: 'com.enonic.cms.default', branches: ['master', 'draft'] }];

/**
 * The load is memoized for the life of the module, which is the behaviour under test — so each case
 * gets a fresh module graph and reads the store from that same graph.
 */
async function run() {
  vi.resetModules();

  const [{ loadRepositories }, { $repositories }] = await Promise.all([
    import('./repositories.load'),
    import('./repositories.store'),
  ]);

  return { loadRepositories, $repositories };
}

beforeEach(() => {
  fetchRepositories.mockReset();
  fetchRepositories.mockReturnValue(okAsync(REPOSITORIES));
});

describe('loadRepositories', () => {
  it('fills the store with what the section may report on', async () => {
    const { loadRepositories, $repositories } = await run();

    await loadRepositories();

    expect($repositories.get()).toEqual({ status: 'ready', items: REPOSITORIES });
  });

  it('asks once however many sections need the list', async () => {
    const { loadRepositories } = await run();

    await Promise.all([loadRepositories(), loadRepositories()]);
    await loadRepositories();

    expect(fetchRepositories).toHaveBeenCalledTimes(1);
  });

  it('reports a failure as store state, since the panel has nothing to offer without it', async () => {
    fetchRepositories.mockReturnValue(errAsync(new AppError('no')));

    const { loadRepositories, $repositories } = await run();

    await loadRepositories();

    expect($repositories.get()).toEqual({ status: 'error', items: [], error: 'no' });
  });

  it('asks again after a failure, so the next section to mount is not stuck with it', async () => {
    fetchRepositories.mockReturnValueOnce(errAsync(new AppError('no')));

    const { loadRepositories, $repositories } = await run();

    await loadRepositories();
    await loadRepositories();

    expect(fetchRepositories).toHaveBeenCalledTimes(2);
    expect($repositories.get()).toEqual({ status: 'ready', items: REPOSITORIES });
  });

  it('shows the retry as loading rather than as the failure it replaces', async () => {
    fetchRepositories.mockReturnValueOnce(errAsync(new AppError('no')));

    const { loadRepositories, $repositories } = await run();

    await loadRepositories();
    const retry = loadRepositories();

    expect($repositories.get()).toEqual({ status: 'loading', items: [] });

    await retry;
  });
});
