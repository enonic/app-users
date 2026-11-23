import {
  deletePrincipal,
  findPrincipals,
  getPrincipal,
  type GroupKey,
  type Principal,
  type PrincipalKey,
  type PrincipalType,
  type RoleKey,
  type UserKey,
} from '/lib/xp/auth';

/** A principal reduced to what a member or membership list shows. */
export type PrincipalItem = {
  key: string;
  type: string;
  displayName: string;
};

export type PrincipalPage = {
  total: number;
  hits: PrincipalItem[];
};

export type PrincipalSearch = {
  types: readonly PrincipalType[];
  idProvider?: string;
  search?: string;
  start?: number;
  count?: number;
};

export type PrincipalDeletion = {
  key: string;
  deleted: boolean;
  reason?: string;
};

const ALL_TYPES: readonly PrincipalType[] = ['user', 'group', 'role'];

const DEFAULT_SEARCH_COUNT = 20;

// ! A page size clamped at both ends, and the lower bound is the interesting one: `count: -1` is
// ! `GET_ALL_SIZE_FLAG` to `findUsers` and `findPrincipals` alike, i.e. every row, which on a
// ! directory-backed install means the whole directory read inside the app's single JS thread — so an
// ! upper bound alone would not do, since `Math.min(-1, 100)` is `-1`. Zero stays allowed: it asks for
// ! the total without a single row — `SecurityServiceImpl` takes the total from the search rather than
// ! from the hits, so a page of none still reports how many matched.
const MIN_COUNT = 0;
const MAX_COUNT = 100;

/**
 * ! How far paging may reach, and it is a real limit rather than a nicety. Elasticsearch refuses a query
 * ! whose `from + size` passes `index.max_result_window` — 10 000 by default, and XP's
 * ! `search-settings.json` does not raise it — with a `QueryPhaseExecutionException` that
 * ! `SecurityServiceImpl.query` does not catch (it catches only `NodeNotFoundException`). The field would
 * ! then error and the whole list would blank. Two hundred `Load more` clicks reach it, so this is not a
 * ! hypothetical on the installs this section exists for. Clamped rather than refused: a caller asking
 * ! beyond the window gets the last page it can have, not a broken screen.
 */
const MAX_START = 10_000 - MAX_COUNT;

export function searchPrincipals({
  types,
  idProvider,
  search,
  start,
  count,
}: PrincipalSearch): PrincipalPage {
  const kinds =
    types.length === 0 || ALL_TYPES.every((type) => types.includes(type))
      ? [undefined]
      : [...new Set(types)];
  const searchText = nonEmpty(search?.trim());
  const provider = nonEmpty(idProvider);

  let offset = clampStart(start);
  let remaining = clampCount(count, DEFAULT_SEARCH_COUNT);
  let total = 0;
  const hits: PrincipalItem[] = [];

  kinds.forEach((type) => {
    const found = findPrincipals({
      type,
      idProvider: provider,
      searchText,
      start: offset,
      count: remaining,
    });

    total += found.total;
    hits.push(...found.hits.map(toPrincipalItem));
    remaining -= found.hits.length;
    offset = Math.max(0, offset - found.total);
  });

  return { total, hits };
}

export function clampCount(count: number | undefined, fallback: number): number {
  return Math.min(Math.max(count ?? fallback, MIN_COUNT), MAX_COUNT);
}

export function clampStart(start?: number): number {
  return Math.min(Math.max(start ?? 0, 0), MAX_START);
}

export function deletePrincipals(keys: readonly string[]): PrincipalDeletion[] {
  return keys.map(deleteOne);
}

export function localNameOf(key: string): string {
  return key.slice(key.lastIndexOf(':') + 1);
}

/**
 * The principals the keys name, in the keys' order and without the keys nothing answers to: a stored
 * reference can outlive the principal it points at.
 */
export function getPrincipalsByKeys(keys: readonly string[]): PrincipalItem[] {
  return [...new Set(keys)].flatMap((key) => {
    const principal = getPrincipalOrNull(key);
    return principal == null ? [] : [toPrincipalItem(principal)];
  });
}

/**
 * The roles and groups a write is about to change the members of, and the members it is about to add,
 * under the keys the platform keeps.
 *
 * ! XP finds a node whatever the case of its path and guards a member list by that path, so
 * ! `role:SYSTEM.ADMIN` is the administrator role to the platform while every exact comparison here lets
 * ! it by — and the refusal then comes midway, after the first writes. The key a read answers with is
 * ! built from the node's own name, so everything downstream compares what the platform compares.
 * ! Lower-casing instead would be wrong: an id keeps its case, and a member is stored as the exact string.
 *
 * ! That exact string is why an added member comes through here as well. The platform resolves a
 * ! membership through the index, in any case, but removes a member by comparing strings — so
 * ! `user:SYSTEM:alice` would hold the role and survive the removal the UI sends under the real key.
 * ! A member being *removed* is passed as it was given, for the same reason: it has to match what is stored.
 *
 * A key nothing answers to is refused here, which is also before the first write.
 */
export function canonicalKeys<Key extends GroupKey | RoleKey | UserKey>(
  keys: readonly Key[],
): Key[] {
  return keys.map((key) => {
    const type = key.slice(0, key.indexOf(':'));
    const principal = getPrincipalOrNull(key);
    if (principal == null || principal.type !== type) {
      throw new Error(`No ${type} answers to [${key}]`);
    }

    return principal.key as Key;
  });
}

// ! `getPrincipal` throws on a key `PrincipalKey.from` rejects rather than answering nothing, and a
// ! stored reference is whatever the config carries.
function getPrincipalOrNull(key: string): Principal | null {
  try {
    return getPrincipal(key as PrincipalKey);
  } catch {
    return null;
  }
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
