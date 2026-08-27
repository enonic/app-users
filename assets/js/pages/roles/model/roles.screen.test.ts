import { errAsync, okAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { $idProviderNames } from '../../../entities/principal/model/id-providers.store';
import { $roles } from '../../../entities/principal/model/roles.store';
import { AppError } from '../../../shared/api';
import { fetchRolesScreen } from '../api/roles-screen.api';
import { loadRolesScreen } from './roles.screen';

// The screen owns the request and the cancelling; stubbing the api keeps the transport out of it and
// lets a test hold one answer back to show a slow load losing to a fast one.
vi.mock('../api/roles-screen.api', () => ({ fetchRolesScreen: vi.fn() }));

const ROLE = {
  key: 'role:system.admin',
  displayName: 'Administrator',
  description: null,
  modifiedTime: null,
};

// The lean root the screens use asks for these two fields and nothing else.
const PROVIDER = { key: 'system', displayName: 'System' };

function answered(data: Record<string, unknown>, message?: string) {
  return okAsync({ data, message } as never);
}

beforeEach(() => {
  vi.mocked(fetchRolesScreen).mockReset();
  vi.mocked(fetchRolesScreen).mockReturnValue(answered({ roles: [ROLE], idProviders: [PROVIDER] }));
});

afterEach(() => {
  $roles.set({ status: 'loading', items: [] });
  $idProviderNames.set({ status: 'loading', items: [] });
});

describe('loadRolesScreen', () => {
  it('fills all three stores from one answer', async () => {
    await loadRolesScreen();

    expect($roles.get().status).toBe('ready');
    expect($roles.get().items).toHaveLength(1);
    expect($idProviderNames.get().items).toEqual([{ key: 'system', displayName: 'System' }]);
  });

  it('asks for the three domains in a single request', async () => {
    await loadRolesScreen();

    expect(vi.mocked(fetchRolesScreen)).toHaveBeenCalledTimes(1);
  });

  // ! The whole point of the nullable root fields: one domain failing must not blank the others.
  it('fails only the domain whose field came back null', async () => {
    vi.mocked(fetchRolesScreen).mockReturnValue(
      answered({ roles: [ROLE], idProviders: [PROVIDER] }, 'Id provider repo is down'),
    );

    await loadRolesScreen();

    expect($roles.get().status).toBe('ready');
    expect($idProviderNames.get().status).toBe('ready');
  });

  it('fails every domain when the request itself fails', async () => {
    vi.mocked(fetchRolesScreen).mockReturnValue(errAsync(new AppError('Network is down')));

    await loadRolesScreen();

    expect($roles.get().status).toBe('error');
    expect($idProviderNames.get().status).toBe('error');
    expect($roles.get().error).toBe('Network is down');
  });

  it('reports loading again while it reloads', async () => {
    const seen: string[] = [];
    await loadRolesScreen();
    const stop = $roles.subscribe(({ status }) => seen.push(status));
    await loadRolesScreen();
    stop();

    expect(seen).toEqual(['ready', 'loading', 'ready']);
  });

  it('drops the answer of the load a newer one replaced', async () => {
    let answerSlowly: ((value: unknown) => void) | undefined;

    vi.mocked(fetchRolesScreen)
      .mockReturnValueOnce({
        // A promise the test settles by hand, shaped like the ResultAsync the api returns.
        match: (onOk: (value: unknown) => void) =>
          new Promise<void>((resolve) => {
            answerSlowly = (value) => {
              onOk(value);
              resolve();
            };
          }),
      } as never)
      .mockReturnValueOnce(answered({ roles: [], idProviders: [] }));

    const slow = loadRolesScreen();
    await loadRolesScreen();
    answerSlowly?.({ data: { roles: [ROLE], idProviders: [PROVIDER] } });
    await slow;

    expect($roles.get().items).toEqual([]);
  });
});
