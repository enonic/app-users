import type { ResultAsync } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import {
  requestGroupExists,
  sendGroupCreation,
  sendGroupUpdate,
  type GroupChanges,
  type GroupInput,
} from '../api/groups.api';
import type { Group, PrincipalKey } from './principal.types';

export type GroupDraft = {
  idProvider: string;
  name: string;
  displayName: string;
  description: string;
  members: readonly PrincipalKey[];
  roles: readonly PrincipalKey[];
};

/** The same scalars, plus the membership the edit moved rather than the membership the group holds. */
export type GroupEdit = {
  displayName: string;
  description: string;
  addMembers: readonly PrincipalKey[];
  removeMembers: readonly PrincipalKey[];
  addRoles: readonly PrincipalKey[];
  removeRoles: readonly PrincipalKey[];
};

/**
 * Both return a `Result` rather than notifying, for the reason `role-commands.ts` gives: the dialog
 * stays open on failure and is the screen the save fails on.
 */
export function createGroup(draft: GroupDraft): ResultAsync<Group, AppError> {
  return sendGroupCreation(draft.idProvider, draft.name.trim(), {
    ...scalars(draft),
    members: draft.members,
    roles: draft.roles,
  } satisfies GroupInput);
}

export function updateGroup(key: PrincipalKey, edit: GroupEdit): ResultAsync<Group, AppError> {
  return sendGroupUpdate(key, {
    ...scalars(edit),
    addMembers: edit.addMembers,
    removeMembers: edit.removeMembers,
    addRoles: edit.addRoles,
    removeRoles: edit.removeRoles,
  } satisfies GroupChanges);
}

/**
 * Whether the provider already holds a group of this name — the wizard's advisory check, asked of a name
 * as it is typed.
 *
 * ! Advisory: the answer is a moment old by the time the save runs, and a provider the caller may not
 * ! read answers the same as an empty one. `createGroup` stays the authority on the duplicate.
 */
export function isGroupNameTaken(
  idProvider: string,
  name: string,
  signal?: AbortSignal,
): ResultAsync<boolean, AppError> {
  return requestGroupExists(`group:${idProvider}:${name}`, signal);
}

function scalars({ displayName, description }: { displayName: string; description: string }) {
  const described = description.trim();

  return {
    displayName: displayName.trim(),
    description: described.length > 0 ? described : undefined,
  };
}
