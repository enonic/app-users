import { generateKid } from '/lib/publickey';
import {
  addMembers,
  changePassword,
  createUser as createUserPrincipal,
  findUsers,
  getMemberships,
  getPrincipal,
  getProfile,
  modifyProfile,
  modifyUser,
  removeMembers,
  type GroupKey,
  type RoleKey,
  type User,
  type UserKey,
} from '/lib/xp/auth';

import { byName, requireIdProvider, toPrincipalItem, type PrincipalItem } from './principal.source';

export type UserSource = User;

export type UserInput = {
  displayName: string;
  email?: string;
  password?: string;
  roles: readonly string[];
  groups: readonly string[];
};

export type UserChanges = {
  displayName: string;
  email?: string;
  password?: string;
  addRoles: readonly string[];
  removeRoles: readonly string[];
  addGroups: readonly string[];
  removeGroups: readonly string[];
};

/** One page of users, and how many the search matched in total. */
export type UserPage = {
  total: number;
  hits: User[];
};

/** The orders the list offers. An id, never a raw expression: `sort` is parsed, so it is injectable. */
export type UserSort = 'displayNameAsc' | 'displayNameDesc';

export type UserQuery = {
  start?: number;
  count?: number;
  search?: string;
  idProviders?: readonly string[];
  sort?: UserSort;
};

const DEFAULT_COUNT = 50;

// ! A page size clamped at both ends, and the lower bound is the interesting one: `count: -1` is
// ! `GET_ALL_SIZE_FLAG` to `findUsers`, i.e. every user, which on a directory-backed install means the
// ! whole directory read inside the app's single JS thread — so an upper bound alone would not do, since
// ! `Math.min(-1, 100)` is `-1`. Zero stays allowed: it asks for the total without a single row, the same
// ! trick `id-provider.source.ts` counts principals with — `SecurityServiceImpl` takes the total from the
// ! search rather than from the hits, so a page of none still reports how many matched.
const MIN_COUNT = 0;
const MAX_COUNT = 100;

/**
 * ! How far paging may reach, and it is a real limit rather than a nicety. Elasticsearch refuses a query
 * ! whose `from + size` passes `index.max_result_window` — 10 000 by default, and XP's
 * ! `search-settings.json` does not raise it — with a `QueryPhaseExecutionException` that
 * ! `SecurityServiceImpl.query` does not catch (it catches only `NodeNotFoundException`). The `users`
 * ! field would then error and the whole list would blank. Two hundred `Load more` clicks reach it, so
 * ! this is not a hypothetical on the installs this section exists for. Clamped rather than refused: a
 * ! caller asking beyond the window gets the last page it can have, not a broken screen.
 */
const MAX_START = 10_000 - MAX_COUNT;

/**
 * `displayName` and `_allText`, the pair XP itself searches principals on.
 * `findPrincipals` builds this expression in `PrincipalQueryNodeQueryTranslator`; `findUsers` takes a
 * raw constraint expression instead, so the same thing has to be written here. Both halves are kept:
 * `fulltext` matches whole words, `ngram` matches a prefix as it is typed.
 */
const SEARCH_FIELDS = '_allText,displayName';

/**
 * Sort expressions, with the node path breaking ties.
 * ! The tie-break is what makes paging sound: over a partial order, two users sharing a display name can
 * ! swap places between requests, and a row then appears on two pages or on none.
 *
 * ! It has to be `_path`, and the reasoning is worth keeping because the obvious candidates both fail.
 * ! `principalKey` is declared in `PrincipalIndexConfigFactory` but **never written**: `toCreateNodeParams`
 * ! stores only `displayName`, `principalType`, `userStoreKey` and the type-specific fields, and index
 * ! config for an absent property produces no index item — so ordering by it is silently ignored
 * ! (`SortQueryBuilderFactory` sets `unmappedType`, so it does not even error). `_name` is written and
 * ! orderable (`NodeStoreDocumentFactory` indexes it `FULLTEXT`) but is only unique **within a provider**,
 * ! so two providers holding an `alice` leave the order partial again. `_path` is written `IndexConfig.PATH`
 * ! and is unique repo-wide, which makes the order total.
 *
 * Ordering is case-insensitive for free: `OrderByValueResolver` lowercases what it writes to `_orderby`.
 */
const SORT_EXPRESSIONS: Record<UserSort, string> = {
  displayNameAsc: 'displayName ASC, _path ASC',
  displayNameDesc: 'displayName DESC, _path ASC',
};

export function listUsers({ start, count, search, idProviders, sort }: UserQuery): UserPage {
  const { total, hits } = findUsers({
    start: clampStart(start),
    count: clampCount(count),
    query: queryExpression(search, idProviders),
    sort: SORT_EXPRESSIONS[sort ?? 'displayNameAsc'],
  });

  return { total, hits };
}

/**
 * Null for a key no user answers to, which is a legitimate answer rather than a failure.
 *
 * Two guards, because one is not enough:
 *
 * ! The shape check keeps the field honest about *what* it answers for. `getPrincipal` answers for whatever
 * ! a key names, so `group:system:editors` would come back as a group and be served as a user — with its
 * ! memberships read as that user's.
 *
 * ! The `catch` keeps it honest about *failing*. This pattern is only a superset of what XP accepts:
 * ! `PrincipalKey.ofUser` validates the id through `ID_VALIDATOR`, which rejects spaces and HTML specials
 * ! among others, and **throws** rather than returning nothing. Replicating that charset here would be a
 * ! second copy to keep in step, so the throw is caught instead — a key the platform will not parse names
 * ! no user, which is exactly what null says.
 */
const USER_KEY = /^user:[^:]+:[^:]+$/;

export function getUser(key: string): User | null {
  if (!USER_KEY.test(key)) {
    return null;
  }

  try {
    return getPrincipal(key as UserKey);
  } catch {
    return null;
  }
}

export type PublicKeyItem = {
  kid: string;
  publicKey?: string;
  label?: string;
  creationTime?: string;
};

type PublicKeyProfile = {
  publicKeys?: PublicKeyItem | PublicKeyItem[];
};

export function listUserPublicKeys(key: UserKey): PublicKeyItem[] {
  return toPublicKeys(getProfile<PublicKeyProfile>({ key })?.publicKeys);
}

function toPublicKeys(keys?: PublicKeyItem | PublicKeyItem[]): PublicKeyItem[] {
  if (keys == null) {
    return [];
  }

  return Array.isArray(keys) ? keys : [keys];
}

export function listUserRoles(key: UserKey, transitive: boolean): PrincipalItem[] {
  return membershipsOf(key, 'role', transitive);
}

export function listUserGroups(key: UserKey, transitive: boolean): PrincipalItem[] {
  return membershipsOf(key, 'group', transitive);
}

export function addPublicKey(key: string, publicKey: string, label?: string): PublicKeyItem {
  const kid = generateKid(publicKey);

  const profile = modifyProfile<PublicKeyProfile>({
    key: key as UserKey,
    editor: (current) => {
      const stored = toPublicKeys(current?.publicKeys);

      if (stored.some((stored_) => stored_.kid === kid)) {
        throw new Error(`A public key with id [${kid}] is already stored for [${key}]`);
      }

      return {
        ...current,
        publicKeys: [...stored, { kid, publicKey, label, creationTime: new Date().toISOString() }],
      };
    },
  });

  const written = toPublicKeys(profile?.publicKeys).find((stored) => stored.kid === kid);

  if (written === undefined) {
    throw new Error(`The public key was not stored for [${key}]`);
  }

  return written;
}

export function removePublicKey(key: string, kid: string): boolean {
  const profile = modifyProfile<PublicKeyProfile>({
    key: key as UserKey,
    editor: (current) => ({
      ...current,
      publicKeys: toPublicKeys(current?.publicKeys).filter((stored) => stored.kid !== kid),
    }),
  });

  if (profile == null) {
    throw new Error(`No user answers to [${key}]`);
  }

  return !toPublicKeys(profile.publicKeys).some((stored) => stored.kid === kid);
}

export function createUser(idProvider: string, name: string, input: UserInput): User {
  requireIdProvider(idProvider);

  // ! Every refusal this function owns comes before the first write. There is no transaction around the
  // ! principal, the password and the memberships, so a password refused after `createUserPrincipal` would
  // ! leave a passwordless user behind under a name the retry can no longer use.
  const password = input.password != null && input.password.length > 0 ? input.password : undefined;
  if (password !== undefined) {
    requirePassword(password);
  }

  const user = createUserPrincipal({
    idProvider,
    name,
    displayName: input.displayName,
    email: input.email,
  });

  if (password !== undefined) {
    changePassword({ userKey: user.key, password });
  }

  applyMemberships(user.key, input.roles, [], input.groups, []);

  return user;
}

export function updateUser(key: string, changes: UserChanges): User {
  if (getUser(key) == null) {
    throw new Error(`No user answers to [${key}]`);
  }

  if (changes.password != null) {
    requirePassword(changes.password);

    changePassword({
      userKey: key as UserKey,
      password: changes.password.length > 0 ? changes.password : null,
    });
  }

  applyMemberships(
    key as UserKey,
    changes.addRoles,
    changes.removeRoles,
    changes.addGroups,
    changes.removeGroups,
  );

  const user = modifyUser({
    key: key as UserKey,
    editor: (current) => ({
      ...current,
      displayName: changes.displayName,
      email: changes.email ?? '',
    }),
  });

  if (user == null) {
    throw new Error(`No user answers to [${key}]`);
  }

  return user;
}

// *
// * Helpers
// *

/**
 * ! Escapes a value for a query-DSL string literal, and is the only place that does.
 *
 * ! The grammar reads string literals with jparsec's double-quote tokenizer, which honours backslash
 * ! escapes — so a backslash and a double quote are what have to be escaped, backslash first or the
 * ! second pass would escape the escapes. app-users interpolates the search box straight into the
 * ! expression (`textQuery` in its `lib/principals.js`), where one typed `"` produces an unparseable
 * ! query; that is the bug this exists to not repeat.
 */
export function escapeQueryValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * The constraint expression: the search, the provider filter, both, or nothing.
 *
 * `findUsers` adds only `principalType = USER` of its own (`UserQueryNodeQueryTranslator`), so every
 * other narrowing belongs here. The provider lives on the node under its old name, `userStoreKey`.
 */
function queryExpression(search?: string, idProviders?: readonly string[]): string {
  const parts: string[] = [];

  const needle = search?.trim();
  if (needle != null && needle.length > 0) {
    const args = `"${SEARCH_FIELDS}","${escapeQueryValue(needle)}","AND"`;
    parts.push(`(fulltext(${args}) OR ngram(${args}))`);
  }

  // Several providers are an OR of the same constraint, so the filter can tick more than one, as the
  // client-side filters of the other sections do.
  const providers = (idProviders ?? []).filter((provider) => provider.length > 0);
  if (providers.length > 0) {
    const constraints = providers
      .map((provider) => `userStoreKey="${escapeQueryValue(provider)}"`)
      .join(' OR ');
    parts.push(providers.length === 1 ? constraints : `(${constraints})`);
  }

  return parts.join(' AND ');
}

function clampCount(count?: number): number {
  return Math.min(Math.max(count ?? DEFAULT_COUNT, MIN_COUNT), MAX_COUNT);
}

function clampStart(start?: number): number {
  return Math.min(Math.max(start ?? 0, 0), MAX_START);
}

function requirePassword(password: string): void {
  if (/\s/.test(password)) {
    throw new Error('A password cannot contain whitespace');
  }
}

function applyMemberships(
  key: UserKey,
  addRoles: readonly string[],
  removeRoles: readonly string[],
  addGroups: readonly string[],
  removeGroups: readonly string[],
): void {
  addRoles.forEach((role) => addMembers(role as RoleKey, [key]));
  removeRoles.forEach((role) => removeMembers(role as RoleKey, [key]));
  addGroups.forEach((group) => addMembers(group as GroupKey, [key]));
  removeGroups.forEach((group) => removeMembers(group as GroupKey, [key]));
}

function membershipsOf(key: UserKey, type: 'role' | 'group', transitive: boolean): PrincipalItem[] {
  return getMemberships(key, transitive)
    .filter((membership) => membership.type === type)
    .map(toPrincipalItem)
    .sort((a, b) => byName(a.displayName, b.displayName));
}
