import { describe, expect, it } from 'vitest';

import type { PrincipalsMessage } from '../../../shared/admin-events';
import { collapsePrincipalChanges } from './principal-changes';

function message(
  operation: PrincipalsMessage['operation'],
  ...keys: readonly string[]
): PrincipalsMessage {
  return { operation, changes: keys.map((key) => ({ kind: 'user', key })) };
}

describe('collapsePrincipalChanges', () => {
  it('keeps one event per principal, the last word on it', () => {
    const events = collapsePrincipalChanges([
      message('updated', 'user:system:alice', 'user:system:bob'),
      message('updated', 'user:system:alice'),
    ]);

    expect(events).toEqual([
      { kind: 'user', key: 'user:system:bob', operation: 'updated' },
      { kind: 'user', key: 'user:system:alice', operation: 'updated' },
    ]);
  });

  it('keeps a creation through the edits that follow it', () => {
    const [event] = collapsePrincipalChanges([
      message('created', 'user:system:alice'),
      message('updated', 'user:system:alice'),
    ]);

    expect(event?.operation).toBe('created');
  });

  it('lets a deletion end whatever came before, and a re-creation start over', () => {
    expect(
      collapsePrincipalChanges([
        message('created', 'user:system:alice'),
        message('deleted', 'user:system:alice'),
      ])[0]?.operation,
    ).toBe('deleted');

    expect(
      collapsePrincipalChanges([
        message('deleted', 'user:system:alice'),
        message('created', 'user:system:alice'),
      ])[0]?.operation,
    ).toBe('created');
  });

  it('tells kinds apart even when the keys collide', () => {
    const events = collapsePrincipalChanges([
      { operation: 'updated', changes: [{ kind: 'idProvider', key: 'system' }] },
      { operation: 'deleted', changes: [{ kind: 'group', key: 'system' }] },
    ]);

    expect(events).toHaveLength(2);
  });
});
