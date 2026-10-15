import type {
  PrincipalChange,
  PrincipalOperation,
  PrincipalsMessage,
} from '../../../shared/admin-events';

export type PrincipalEvent = PrincipalChange & { operation: PrincipalOperation };

/** One event per principal out of a window of messages, the last word on each. */
export function collapsePrincipalChanges(messages: readonly PrincipalsMessage[]): PrincipalEvent[] {
  const events = new Map<string, PrincipalEvent>();

  for (const { operation, changes } of messages) {
    for (const change of changes) {
      const id = `${change.kind}:${change.key}`;
      const previous = events.get(id);

      events.delete(id);
      events.set(id, {
        ...change,
        operation: previous === undefined ? operation : merge(previous.operation, operation),
      });
    }
  }

  return [...events.values()];
}

// ! `created` survives the edits that follow it: an `updated` alone reaches only a row already loaded.
function merge(previous: PrincipalOperation, next: PrincipalOperation): PrincipalOperation {
  if (next === 'deleted') {
    return 'deleted';
  }
  if (previous === 'created' || previous === 'deleted' || next === 'created') {
    return 'created';
  }
  return previous === 'permissionsUpdated' ? previous : next;
}
