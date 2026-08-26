import {
  addMembers,
  createGroup as createGroupPrincipal,
  findPrincipals,
  getMembers,
  getMemberships,
  getPrincipal,
  modifyGroup,
  removeMembers,
  type Group,
  type GroupKey,
  type Principal,
  type RoleKey,
  type UserKey,
} from '/lib/xp/auth';

import {
  byName,
  displayNameOf,
  requireIdProvider,
  toPrincipalItem,
  type PrincipalItem,
} from './principal.source';

export type GroupSource = Group;

/** What a new group is created with. Both lists are additions: a group starts out holding nobody. */
export type GroupInput = {
  displayName: string;
  description?: string;
  members: readonly string[];
  roles: readonly string[];
};

/** What an edit changes about a group: the scalars, and only the membership that moved. */
export type GroupChanges = {
  displayName: string;
  description?: string;
  addMembers: readonly string[];
  removeMembers: readonly string[];
  addRoles: readonly string[];
  removeRoles: readonly string[];
};

export function listGroups(): Group[] {
  // ? count: -1 is NodeSearchService.GET_ALL_SIZE_FLAG, honoured in SearchExecutor:50 — not
  // ? PrincipalQuery's same-valued constant, which is private. findPrincipals defaults to 10, so
  // ? without it the list truncates on any install carrying more groups, with nothing to show for it.
  const { hits } = findPrincipals({ type: 'group', count: -1 });

  return hits.filter(isGroup).sort((a, b) => byName(displayNameOf(a), displayNameOf(b)));
}

/** A group key carries its provider, so the two-segment form a role uses is not one. */
const GROUP_KEY = /^group:[^:]+:[^:]+$/;

/**
 * Null for a key no group answers to, which is a legitimate answer rather than a failure. The three
 * guards are the ones `getRole` and `getUser` explain: the pattern and the type check keep the field
 * honest about what it answers for, and the `catch` about failing — `PrincipalKey.ofGroup` throws on an
 * id `ID_VALIDATOR` rejects rather than returning nothing.
 */
export function getGroup(key: string): Group | null {
  if (!GROUP_KEY.test(key)) {
    return null;
  }

  try {
    const principal = getPrincipal(key as GroupKey);
    return principal != null && principal.type === 'group' ? principal : null;
  } catch {
    return null;
  }
}

export function listGroupMembers(key: GroupKey): PrincipalItem[] {
  return getMembers(key)
    .map(toPrincipalItem)
    .sort((a, b) => byName(a.displayName, b.displayName));
}

export function listGroupRoles(key: GroupKey, transitive: boolean): PrincipalItem[] {
  return membershipsOf(key, 'role', transitive);
}

export function listGroupGroups(key: GroupKey, transitive: boolean): PrincipalItem[] {
  return membershipsOf(key, 'group', transitive);
}

export function createGroup(idProvider: string, name: string, input: GroupInput): Group {
  requireIdProvider(idProvider);

  const group = createGroupPrincipal({
    idProvider,
    name,
    displayName: input.displayName,
    description: input.description,
  });

  applyMembers(group.key, input.members, []);
  applyRoles(group.key, input.roles, []);

  return group;
}

export function updateGroup(key: string, changes: GroupChanges): Group {
  const group = modifyGroup({
    key: key as GroupKey,
    // ! `ModifyGroupHandler` assigns a field only when the editor returned a non-null value, so the
    // ! empty string is what clears a description and `undefined` would not.
    editor: (current) => ({
      ...current,
      displayName: changes.displayName,
      description: changes.description ?? '',
    }),
  });

  if (group == null) {
    throw new Error(`No group answers to [${key}]`);
  }

  applyMembers(group.key, changes.addMembers, changes.removeMembers);
  applyRoles(group.key, changes.addRoles, changes.removeRoles);

  return group;
}

// *
// * Helpers
// *

// Nothing is read first: both writes are idempotent at the node level, see `docs/platform-facts.md`.
function applyMembers(key: GroupKey, added: readonly string[], removed: readonly string[]): void {
  if (added.length > 0) {
    addMembers(key, added as (UserKey | GroupKey)[]);
  }
  if (removed.length > 0) {
    removeMembers(key, removed as (UserKey | GroupKey)[]);
  }
}

// ! A membership is a relationship the *role* holds, and the platform has no `addMemberships` — so this
// ! is one call against each role, never one against the group.
function applyRoles(key: GroupKey, added: readonly string[], removed: readonly string[]): void {
  added.forEach((role) => addMembers(role as RoleKey, [key]));
  removed.forEach((role) => removeMembers(role as RoleKey, [key]));
}

function isGroup(principal: Principal): principal is Group {
  return principal.type === 'group';
}

function membershipsOf(
  key: GroupKey,
  type: 'role' | 'group',
  transitive: boolean,
): PrincipalItem[] {
  return getMemberships(key, transitive)
    .filter((membership) => membership.type === type)
    .map(toPrincipalItem)
    .sort((a, b) => byName(a.displayName, b.displayName));
}
