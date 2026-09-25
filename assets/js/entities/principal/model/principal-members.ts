import { isServiceAccount } from './principal.keys';
import type { PrincipalRef } from './principal.types';

export type PrincipalMembers = {
  users: PrincipalRef[];
  serviceAccounts: PrincipalRef[];
  groups: PrincipalRef[];
};

/** A group's or role's `getMembers` answer, split by kind. */
export function splitMembers(members: readonly PrincipalRef[]): PrincipalMembers {
  const split: PrincipalMembers = { users: [], serviceAccounts: [], groups: [] };

  for (const member of members) {
    if (member.type === 'group') {
      split.groups.push(member);
    } else if (isServiceAccount(member.key)) {
      split.serviceAccounts.push(member);
    } else {
      split.users.push(member);
    }
  }

  return split;
}
