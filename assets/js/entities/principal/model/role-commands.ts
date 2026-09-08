import type { ResultAsync } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import {
  requestRoleExists,
  sendRoleCreation,
  sendRoleUpdate,
  type RoleChanges,
  type RoleInput,
} from '../api/roles.api';
import type { PrincipalKey, Role } from './principal.types';

export type RoleDraft = {
  name: string;
  displayName: string;
  description: string;
  members: readonly PrincipalKey[];
};

/** The same scalars, plus the membership the edit moved rather than the membership the role holds. */
export type RoleEdit = {
  displayName: string;
  description: string;
  addMembers: readonly PrincipalKey[];
  removeMembers: readonly PrincipalKey[];
};

/**
 * Both return a `Result` rather than notifying: the dialog stays open on failure and is the screen the
 * save fails on. A command whose caller has no such screen — every toolbar action — still reports through
 * `notify` itself.
 */
export function createRole(draft: RoleDraft): ResultAsync<Role, AppError> {
  return sendRoleCreation(draft.name.trim(), {
    ...scalars(draft),
    members: draft.members,
  } satisfies RoleInput);
}

export function updateRole(key: PrincipalKey, edit: RoleEdit): ResultAsync<Role, AppError> {
  return sendRoleUpdate(key, {
    ...scalars(edit),
    addMembers: edit.addMembers,
    removeMembers: edit.removeMembers,
  } satisfies RoleChanges);
}

/**
 * Whether a role of this name already exists — the wizard's advisory check, asked of a name as it is
 * typed. A role has no provider: its name is unique across the platform.
 *
 * ! Advisory: the answer is a moment old by the time the save runs. `createRole` stays the authority on
 * ! the duplicate.
 */
export function isRoleNameTaken(
  name: string,
  signal?: AbortSignal,
): ResultAsync<boolean, AppError> {
  return requestRoleExists(`role:${name}`, signal);
}

function scalars({ displayName, description }: { displayName: string; description: string }) {
  const described = description.trim();

  return {
    displayName: displayName.trim(),
    description: described.length > 0 ? described : undefined,
  };
}
