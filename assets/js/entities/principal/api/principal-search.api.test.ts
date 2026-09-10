import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setGraphQlEndpoint } from '../../../shared/api';
import { searchPrincipals } from './principal-search.api';

let sent: { query?: string; variables?: Record<string, unknown> } | undefined;

function respondWith(body: unknown): void {
  globalThis.fetch = vi.fn((_url: unknown, options?: { body?: string }) => {
    sent = JSON.parse(options?.body ?? '{}') as typeof sent;
    return Promise.resolve(new Response(JSON.stringify(body)));
  }) as unknown as typeof globalThis.fetch;
}

beforeEach(() => {
  setGraphQlEndpoint('/admin/tool/_/admin:extension/app:users/graphql');
  sent = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('searchPrincipals', () => {
  it('maps a page to the offer and its total', async () => {
    respondWith({
      data: {
        principals: {
          total: 41,
          hits: [{ key: 'user:system:su', type: 'user', displayName: 'Super User' }],
        },
      },
    });

    const result = await searchPrincipals({
      types: ['user', 'group'],
      search: 'su',
      start: 20,
      count: 20,
    });

    expect(result._unsafeUnwrap()).toEqual({
      total: 41,
      items: [{ key: 'user:system:su', type: 'user', displayName: 'Super User' }],
    });
    expect(sent?.variables).toEqual({
      types: ['user', 'group'],
      search: 'su',
      start: 20,
      count: 20,
    });
  });

  it('sends no provider and no search when either is blank', async () => {
    respondWith({ data: { principals: { total: 0, hits: [] } } });

    await searchPrincipals({ types: ['role'], idProvider: '', search: '  ', start: 0, count: 20 });

    expect(sent?.variables).toEqual({ types: ['role'], start: 0, count: 20 });
  });

  it('reads a null page as an empty offer', async () => {
    respondWith({ data: { principals: null } });

    const result = await searchPrincipals({ types: ['group'], search: '', start: 0, count: 20 });

    expect(result._unsafeUnwrap()).toEqual({ total: 0, items: [] });
  });
});
