import type { ResultAsync } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import {
  createAvailabilityCheck,
  type AvailabilityCheck,
  type AvailabilityCheckOptions,
} from './availability-check';
import { isGroupNameTaken } from './group-commands';
import { isIdProviderNameTaken } from './id-provider-commands';
import { isIllegalPrincipalName } from './principal-name';
import type { PrincipalType } from './principal.types';
import { isRoleNameTaken } from './role-commands';
import { isUserNameTaken } from './user-commands';

/**
 * What a wizard names: a user or a group inside a provider, a role on its own, and the provider itself,
 * which is no principal but is named the same way.
 */
export type NameCheckedType = PrincipalType | 'idProvider';

export type PrincipalNameCheckOptions = AvailabilityCheckOptions;

export type PrincipalNameCheck = AvailabilityCheck;

// The question each kind asks.
const ASK: Record<
  NameCheckedType,
  (idProvider: string, name: string, signal?: AbortSignal) => ResultAsync<boolean, AppError>
> = {
  user: isUserNameTaken,
  group: isGroupNameTaken,
  role: (_idProvider, name, signal) => isRoleNameTaken(name, signal),
  idProvider: (_idProvider, name, signal) => isIdProviderNameTaken(name, signal),
};

/**
 * Whether the name is already held — by the provider for a user or a group, by the platform for a role
 * or an ID provider, which have no provider and pass `''`.
 */
export function createPrincipalNameCheck(type: NameCheckedType): PrincipalNameCheck {
  return createAvailabilityCheck({
    ask: (idProvider, name, _except, signal) => ASK[type](idProvider, name, signal),
    keyOf: (idProvider, name) =>
      isIllegalPrincipalName(name) ? undefined : keyOf(type, idProvider, name),
  });
}

//
// * Internal
//

// The answer is filed under the key the named thing would have, so one name in two providers is two
// questions. A user or a group has no key until its provider is chosen; an ID provider's key is its name.
function keyOf(type: NameCheckedType, idProvider: string, name: string): string | undefined {
  if (type === 'role') {
    return `role:${name}`;
  }

  if (type === 'idProvider') {
    return name;
  }

  return idProvider.length === 0 ? undefined : `${type}:${idProvider}:${name}`;
}
