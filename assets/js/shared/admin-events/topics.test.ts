import { describe, expect, it } from 'vitest';

import { toPrincipalsMessage } from './topics';

describe('toPrincipalsMessage', () => {
  it('accepts what the hub publishes', () => {
    const message = toPrincipalsMessage({
      operation: 'updated',
      changes: [
        { kind: 'user', key: 'user:system:alice' },
        { kind: 'idProvider', key: 'system' },
      ],
    });

    expect(message).toEqual({
      operation: 'updated',
      changes: [
        { kind: 'user', key: 'user:system:alice' },
        { kind: 'idProvider', key: 'system' },
      ],
    });
  });

  it('refuses anything that is not a message', () => {
    expect(toPrincipalsMessage(undefined)).toBeUndefined();
    expect(toPrincipalsMessage('deleted')).toBeUndefined();
    expect(toPrincipalsMessage({ operation: 'deleted' })).toBeUndefined();
    expect(toPrincipalsMessage({ operation: 'moved', changes: [] })).toBeUndefined();
  });

  it('drops the message whole when one change is unknown', () => {
    const message = toPrincipalsMessage({
      operation: 'created',
      changes: [
        { kind: 'user', key: 'user:system:alice' },
        { kind: 'folder', key: 'users' },
      ],
    });

    expect(message).toBeUndefined();
    expect(
      toPrincipalsMessage({ operation: 'created', changes: [{ kind: 'user', key: '' }] }),
    ).toBeUndefined();
  });
});
