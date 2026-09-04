import { okAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ID_PROVIDER_NAMES_ROOT, USERS_ROOT } from '../../../entities/principal';
import { requestGraphQlRoots } from '../../../shared/api';
import { fetchServiceAccountsScreen } from './service-accounts-screen.api';

vi.mock('../../../shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../shared/api')>()),
  requestGraphQlRoots: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(requestGraphQlRoots).mockReset();
  vi.mocked(requestGraphQlRoots).mockReturnValue(okAsync({ data: { users: null } } as never));
});

describe('fetchServiceAccountsScreen', () => {
  // The names ride along for the details panel's provenance labels: this section may be the first one
  // mounted in a session, so nothing else would have loaded them.
  it('asks for the users and the provider names in one request', () => {
    void fetchServiceAccountsScreen({ start: 0, count: 50, sort: 'displayNameAsc' });

    expect(vi.mocked(requestGraphQlRoots).mock.calls[0]?.[0]).toEqual([
      USERS_ROOT,
      ID_PROVIDER_NAMES_ROOT,
    ]);
  });

  // ! The section's identity: whatever the query holds, the server is only ever asked for the system store.
  it('pins the query to the system provider', () => {
    void fetchServiceAccountsScreen({
      start: 50,
      count: 50,
      search: 'reporting',
      sort: 'displayNameDesc',
    });

    expect(vi.mocked(requestGraphQlRoots).mock.calls[0]?.[2]?.values).toEqual({
      start: 50,
      count: 50,
      search: 'reporting',
      idProviders: ['system'],
      sort: 'displayNameDesc',
    });
  });

  it('sends an absent search as null, like every optional variable', () => {
    void fetchServiceAccountsScreen({ start: 0, count: 50, sort: 'displayNameAsc' });

    expect(vi.mocked(requestGraphQlRoots).mock.calls[0]?.[2]?.values?.search).toBeNull();
  });
});
