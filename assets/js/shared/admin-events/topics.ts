/**
 * The admin events hub topics these sections subscribe. The names are the host's — app-settings
 * registers and publishes them — copied from the table in its `docs/extensions/docs.md` § Events,
 * which is the source of truth.
 */
export const HUB_TOPICS = {
  /** Principal changes, `{operation, changes: [{kind, key}]}`, kinds user/group/role/idProvider. */
  principals: 'com.enonic.xp.app.settings:principals',
} as const;

/** Ids only, never data: a subscriber re-reads through its gateway. `idProvider` keys are the bare provider name. */
export type PrincipalsMessage = {
  operation: PrincipalOperation;
  changes: readonly PrincipalChange[];
};

export type PrincipalOperation = 'created' | 'updated' | 'deleted' | 'permissionsUpdated';

export type PrincipalKind = 'user' | 'group' | 'role' | 'idProvider';

export type PrincipalChange = {
  kind: PrincipalKind;
  key: string;
};

const OPERATIONS: readonly string[] = ['created', 'updated', 'deleted', 'permissionsUpdated'];

const KINDS: readonly string[] = ['user', 'group', 'role', 'idProvider'];

/** The wire boundary: checked, never cast. One unknown change drops the whole message, not half a batch. */
export function toPrincipalsMessage(data: unknown): PrincipalsMessage | undefined {
  if (data == null || typeof data !== 'object') {
    return undefined;
  }

  const { operation, changes } = data as { operation?: unknown; changes?: unknown };
  if (!isOperation(operation) || !Array.isArray(changes)) {
    return undefined;
  }

  const parsed = changes.map(toChange);
  if (parsed.some((change) => change === undefined)) {
    return undefined;
  }

  return { operation, changes: parsed.filter((change) => change !== undefined) };
}

function toChange(value: unknown): PrincipalChange | undefined {
  if (value == null || typeof value !== 'object') {
    return undefined;
  }

  const { kind, key } = value as { kind?: unknown; key?: unknown };
  if (!isKind(kind) || typeof key !== 'string' || key === '') {
    return undefined;
  }

  return { kind, key };
}

function isOperation(value: unknown): value is PrincipalOperation {
  return typeof value === 'string' && OPERATIONS.includes(value);
}

function isKind(value: unknown): value is PrincipalKind {
  return typeof value === 'string' && KINDS.includes(value);
}
