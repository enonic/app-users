import { deletePrincipal, getIdProviders, type PrincipalKey } from '/lib/xp/auth';

/** A principal reduced to what a member or membership list shows. */
export type PrincipalItem = {
  key: string;
  type: string;
  displayName: string;
};

export type PrincipalDeletion = {
  key: string;
  deleted: boolean;
  reason?: string;
};

export function deletePrincipals(keys: readonly string[]): PrincipalDeletion[] {
  return keys.map(deleteOne);
}

export function requireIdProvider(key: string): void {
  if (!getIdProviders().some((provider) => provider.key === key)) {
    throw new Error(`No ID provider answers to [${key}]`);
  }
}

export function localNameOf(key: string): string {
  return key.slice(key.lastIndexOf(':') + 1);
}

/** Takes an id provider as readily as a principal: both are a key and a display name that may be absent. */
export function displayNameOf(value: { key: string; displayName?: string }): string {
  return nonEmpty(value.displayName) ?? localNameOf(value.key);
}

export function toPrincipalItem(principal: {
  key: string;
  type: string;
  displayName?: string;
}): PrincipalItem {
  return {
    key: principal.key,
    type: principal.type,
    displayName: displayNameOf(principal),
  };
}

export function byName(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

// ! Keep the null check. lib-common's PrincipalMapper writes every text field from a nullable Java
// ! getter, and the bridge drops the key rather than sending null — so a principal with no display
// ! name arrives without the property, whatever the declared type promises.
export function nonEmpty(value?: string): string | undefined {
  return value != null && value.length > 0 ? value : undefined;
}

// ! `false` is `DeletePrincipalHandler` swallowing PrincipalNotFoundException, and nothing else — every
// ! other refusal throws, `su` and `role:system.admin` included.
function deleteOne(key: string): PrincipalDeletion {
  try {
    return deletePrincipal(key as PrincipalKey)
      ? { key, deleted: true }
      : { key, deleted: false, reason: `No principal answers to [${key}]` };
  } catch (error) {
    return { key, deleted: false, reason: reasonOf(error) };
  }
}

function reasonOf(error: unknown): string {
  const { message } = (error ?? {}) as { message?: unknown };

  return typeof message === 'string' && message.length > 0
    ? message
    : 'The platform refused the delete without saying why';
}
