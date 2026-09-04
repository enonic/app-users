import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestText } from './client';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('requestText', () => {
  it('resolves the body as it came, without parsing it', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('Path, Read\n/,X'));

    const result = await requestText('/report');

    expect(result._unsafeUnwrap()).toBe('Path, Read\n/,X');
  });

  it('fails with the server-supplied message on an error status', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response('{"message":"nope"}', { status: 500 }));

    const result = await requestText('/report');

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe('nope');
  });
});
