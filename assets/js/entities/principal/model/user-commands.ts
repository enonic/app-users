import type { ResultAsync } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import {
  requestUserExists,
  sendPublicKeyAddition,
  sendPublicKeyRemoval,
  sendUserCreation,
  sendUserUpdate,
  type UserChanges,
  type UserInput,
} from '../api/users.api';
import type { PrincipalKey, PublicKey, User } from './principal.types';

export type UserDraft = {
  idProvider: string;
  name: string;
  displayName: string;
  email: string;
  password?: string;
  roles: readonly PrincipalKey[];
  groups: readonly PrincipalKey[];
};

export type UserEdit = {
  displayName: string;
  email: string;
  password?: string;
  addRoles: readonly PrincipalKey[];
  removeRoles: readonly PrincipalKey[];
  addGroups: readonly PrincipalKey[];
  removeGroups: readonly PrincipalKey[];
};

export function createUser(draft: UserDraft): ResultAsync<User, AppError> {
  return sendUserCreation(draft.idProvider, draft.name.trim(), {
    displayName: draft.displayName.trim(),
    email: trimmed(draft.email),
    password: draft.password,
    roles: draft.roles,
    groups: draft.groups,
  } satisfies UserInput);
}

export function updateUser(key: PrincipalKey, edit: UserEdit): ResultAsync<User, AppError> {
  return sendUserUpdate(key, {
    displayName: edit.displayName.trim(),
    email: trimmed(edit.email),
    password: edit.password,
    addRoles: edit.addRoles,
    removeRoles: edit.removeRoles,
    addGroups: edit.addGroups,
    removeGroups: edit.removeGroups,
  } satisfies UserChanges);
}

export function addPublicKey(
  key: PrincipalKey,
  publicKey: string,
  label?: string,
): ResultAsync<PublicKey, AppError> {
  return sendPublicKeyAddition(key, publicKey, trimmed(label ?? ''));
}

export function removePublicKey(key: PrincipalKey, kid: string): ResultAsync<void, AppError> {
  return sendPublicKeyRemoval(key, kid);
}

/**
 * Whether the provider already holds a user of this name — the wizard's advisory check, asked of a name
 * as it is typed.
 *
 * ! Advisory: the answer is a moment old by the time the save runs, and a provider the caller may not
 * ! read answers the same as an empty one. `createUser` stays the authority on the duplicate.
 */
export function isUserNameTaken(
  idProvider: string,
  name: string,
  signal?: AbortSignal,
): ResultAsync<boolean, AppError> {
  return requestUserExists(`user:${idProvider}:${name}`, signal);
}

// What an optional text field sends: trimmed, and absent rather than empty. The counterpart of `nonEmpty`
// in `shared/api`, which reads the same distinction off an answer.
function trimmed(value: string): string | undefined {
  const text = value.trim();
  return text.length > 0 ? text : undefined;
}
