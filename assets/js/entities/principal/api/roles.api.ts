import type { ResultAsync } from 'neverthrow';

import {
  nonEmpty,
  requestGraphQlDocument,
  written,
  type AppError,
  type GraphQlRoot,
} from '../../../shared/api';
import type {
  PrincipalKey,
  PrincipalRef,
  Role,
  RoleDetail,
  RoleKey,
} from '../model/principal.types';

const ROLE_FIELDS = `
  key
  displayName
  description
  modifiedTime
`;

/**
 * The role list, and deliberately without the members.
 *
 * ! `members` is one `getMembers` call per role — roughly 113 of them where twenty projects each
 * ! contribute five, serial on the app's single JS thread — for a list that renders a name and a
 * ! description. The schema keeps the field off `Role` entirely so no selection can ask for it by
 * ! accident; the panel reads it through `role(key)` when a row is actually selected.
 */
const ROLES_SELECTION = `{${ROLE_FIELDS}}`;

/**
 * The root field and selection for the role list, exported so a screen that needs roles alongside other
 * domains can put them in one document. What the wire looks like stays here either way.
 */
export const ROLES_ROOT: GraphQlRoot = { field: 'roles', selection: ROLES_SELECTION };

/**
 * One role with its members, for the details panel.
 *
 * A document rather than a root, because null is a legitimate answer: the key may name no role at all.
 * The scalars come along for free — `role(key)` reads the principal to answer at all — which is what lets
 * the panel stand on its own instead of waiting for the list to hold the row.
 */
const ROLE_DOCUMENT = `
  query Role($key: String!) {
    role(key: $key) {${ROLE_FIELDS}
      members {
        key
        type
        displayName
      }
    }
  }
`;

type PrincipalRefDto = {
  key: string;
  type: PrincipalRef['type'];
  displayName: string;
};

type RoleDto = {
  key: string;
  displayName: string;
  description: string | null;
  modifiedTime: string | null;
};

type RoleDetailDto = RoleDto & {
  members: PrincipalRefDto[];
};

/** What a new role is created with. `members` is additions: a role starts out held by nobody. */
export type RoleInput = {
  displayName: string;
  description?: string;
  members: readonly PrincipalKey[];
};

/** What an edit changes about a role: the two lists are what moved, not what the role is to hold. */
export type RoleChanges = {
  displayName: string;
  description?: string;
  addMembers: readonly PrincipalKey[];
  removeMembers: readonly PrincipalKey[];
};

const CREATE_ROLE_DOCUMENT = `
  mutation CreateRole($name: String!, $displayName: String!, $description: String, $members: [String!]) {
    createRole(name: $name, displayName: $displayName, description: $description, members: $members) {${ROLE_FIELDS}}
  }
`;

const UPDATE_ROLE_DOCUMENT = `
  mutation UpdateRole($key: String!, $displayName: String!, $description: String, $addMembers: [String!], $removeMembers: [String!]) {
    updateRole(key: $key, displayName: $displayName, description: $description, addMembers: $addMembers, removeMembers: $removeMembers) {${ROLE_FIELDS}}
  }
`;

type CreateRoleData = { createRole: RoleDto | null };

type UpdateRoleData = { updateRole: RoleDto | null };

export type RolesData = { roles: RoleDto[] | null };

/** `role` is null for a key nothing answers to, which is an answer rather than a failure. */
type RoleDetailData = { role: RoleDetailDto | null };

export function toRoles(dtos: readonly RoleDto[]): Role[] {
  return dtos.map(toRole);
}

/** The role a details panel shows. `undefined` for a key nothing answers to. */
export function fetchRoleDetail(
  key: string,
  signal?: AbortSignal,
): ResultAsync<RoleDetail | undefined, AppError> {
  return requestGraphQlDocument<RoleDetailData>(ROLE_DOCUMENT, { key }, signal).map(({ role }) =>
    role == null ? undefined : { ...toRole(role), members: role.members.map(toPrincipalRef) },
  );
}

export function sendRoleCreation(name: string, input: RoleInput): ResultAsync<Role, AppError> {
  return requestGraphQlDocument<CreateRoleData>(CREATE_ROLE_DOCUMENT, {
    name,
    ...input,
  }).andThen(({ createRole }) => written(createRole, toRole, 'The role was not written'));
}

export function sendRoleUpdate(key: string, changes: RoleChanges): ResultAsync<Role, AppError> {
  return requestGraphQlDocument<UpdateRoleData>(UPDATE_ROLE_DOCUMENT, {
    key,
    ...changes,
  }).andThen(({ updateRole }) => written(updateRole, toRole, 'The role was not written'));
}

//
// * Helpers
//

function toRole(dto: RoleDto): Role {
  return {
    type: 'role',
    key: dto.key as RoleKey,
    displayName: dto.displayName,
    description: nonEmpty(dto.description),
    modifiedTime: nonEmpty(dto.modifiedTime),
  };
}

function toPrincipalRef(dto: PrincipalRefDto): PrincipalRef {
  return {
    key: dto.key as PrincipalKey,
    type: dto.type,
    displayName: dto.displayName,
  };
}
