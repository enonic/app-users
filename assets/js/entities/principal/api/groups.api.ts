import type { ResultAsync } from 'neverthrow';

import {
  nonEmpty,
  requestGraphQlDocument,
  written,
  type AppError,
  type GraphQlRoot,
} from '../../../shared/api';
import type {
  Group,
  GroupDetail,
  GroupKey,
  Memberships,
  PrincipalKey,
  PrincipalRef,
} from '../model/principal.types';

const GROUP_FIELDS = `
  key
  displayName
  description
`;

/**
 * The group list, and deliberately without the members or the roles.
 *
 * ! Two calls per group — `getMembers` plus `getMemberships` — and neither has a cheap count behind it, so
 * ! there is not even a `total` to ask for instead. Groups are the half of this that could not wait:
 * ! roles are bounded, groups are not. Both fields are off `Group` in the schema, and the panel reads
 * ! them through `group(key)` for the one row that is selected.
 */
const GROUPS_SELECTION = `{${GROUP_FIELDS}}`;

/**
 * The root field and selection for the group list, exported so a screen that needs groups alongside
 * other domains can put them in one document. What the wire looks like stays here either way.
 */
export const GROUPS_ROOT: GraphQlRoot = { field: 'groups', selection: GROUPS_SELECTION };

const PRINCIPAL_REF_FIELDS = `
  key
  type
  displayName
`;

const MEMBERSHIP_FIELDS = `
  roles(transitive: $transitive) {${PRINCIPAL_REF_FIELDS}}
  groups(transitive: $transitive) {${PRINCIPAL_REF_FIELDS}}
`;

/**
 * One group with its members and its memberships, for the details panel. A document rather than a root,
 * because null — the key names no group — is a legitimate answer.
 */
const GROUP_DOCUMENT = `
  query Group($key: String!, $transitive: Boolean!) {
    group(key: $key) {${GROUP_FIELDS}
      members {${PRINCIPAL_REF_FIELDS}}${MEMBERSHIP_FIELDS}
    }
  }
`;

/**
 * The memberships alone, for the panel already showing the group: the transitive toggle changes only
 * those, and re-reading the members would cost a `getMembers` call for a list that has not moved.
 */
const GROUP_MEMBERSHIPS_DOCUMENT = `
  query GroupMemberships($key: String!, $transitive: Boolean!) {
    group(key: $key) {${MEMBERSHIP_FIELDS}}
  }
`;

type PrincipalRefDto = {
  key: string;
  type: PrincipalRef['type'];
  displayName: string;
};

type GroupDto = {
  key: string;
  displayName: string;
  description: string | null;
};

type MembershipsDto = {
  roles: PrincipalRefDto[];
  groups: PrincipalRefDto[];
};

type GroupDetailDto = GroupDto &
  MembershipsDto & {
    members: PrincipalRefDto[];
  };

/** What a new group is created with. Both lists are additions: a group starts out holding nobody. */
export type GroupInput = {
  displayName: string;
  description?: string;
  members: readonly PrincipalKey[];
  roles: readonly PrincipalKey[];
};

/** What an edit changes about a group: the four lists are what moved, not what the group is to hold. */
export type GroupChanges = {
  displayName: string;
  description?: string;
  addMembers: readonly PrincipalKey[];
  removeMembers: readonly PrincipalKey[];
  addRoles: readonly PrincipalKey[];
  removeRoles: readonly PrincipalKey[];
};

const CREATE_GROUP_DOCUMENT = `
  mutation CreateGroup($idProvider: String!, $name: String!, $displayName: String!, $description: String, $members: [String!], $roles: [String!]) {
    createGroup(idProvider: $idProvider, name: $name, displayName: $displayName, description: $description, members: $members, roles: $roles) {${GROUP_FIELDS}}
  }
`;

const UPDATE_GROUP_DOCUMENT = `
  mutation UpdateGroup($key: String!, $displayName: String!, $description: String, $addMembers: [String!], $removeMembers: [String!], $addRoles: [String!], $removeRoles: [String!]) {
    updateGroup(key: $key, displayName: $displayName, description: $description, addMembers: $addMembers, removeMembers: $removeMembers, addRoles: $addRoles, removeRoles: $removeRoles) {${GROUP_FIELDS}}
  }
`;

type CreateGroupData = { createGroup: GroupDto | null };

type UpdateGroupData = { updateGroup: GroupDto | null };

export type GroupsData = { groups: GroupDto[] | null };

/** `group` is null for a key nothing answers to, which is an answer rather than a failure. */
type GroupDetailData = { group: GroupDetailDto | null };

type GroupMembershipsData = { group: MembershipsDto | null };

export function toGroups(dtos: readonly GroupDto[]): Group[] {
  return dtos.map(toGroup);
}

/** The group a details panel shows. `undefined` for a key nothing answers to. */
export function fetchGroupDetail(
  key: string,
  transitive: boolean,
  signal?: AbortSignal,
): ResultAsync<GroupDetail | undefined, AppError> {
  return requestGraphQlDocument<GroupDetailData>(GROUP_DOCUMENT, { key, transitive }, signal).map(
    ({ group }) =>
      group == null
        ? undefined
        : {
            ...toGroup(group),
            ...toMemberships(group),
            members: group.members.map(toPrincipalRef),
          },
  );
}

/**
 * The group's roles and the groups it sits in, for a panel that already shows the group. `undefined` for
 * a key nothing answers to.
 */
export function fetchGroupMemberships(
  key: string,
  transitive: boolean,
  signal?: AbortSignal,
): ResultAsync<Memberships | undefined, AppError> {
  return requestGraphQlDocument<GroupMembershipsData>(
    GROUP_MEMBERSHIPS_DOCUMENT,
    { key, transitive },
    signal,
  ).map(({ group }) => (group == null ? undefined : toMemberships(group)));
}

export function sendGroupCreation(
  idProvider: string,
  name: string,
  input: GroupInput,
): ResultAsync<Group, AppError> {
  return requestGraphQlDocument<CreateGroupData>(CREATE_GROUP_DOCUMENT, {
    idProvider,
    name,
    ...input,
  }).andThen(({ createGroup }) => written(createGroup, toGroup, 'The group was not written'));
}

export function sendGroupUpdate(key: string, changes: GroupChanges): ResultAsync<Group, AppError> {
  return requestGraphQlDocument<UpdateGroupData>(UPDATE_GROUP_DOCUMENT, {
    key,
    ...changes,
  }).andThen(({ updateGroup }) => written(updateGroup, toGroup, 'The group was not written'));
}

//
// * Helpers
//

function toGroup(dto: GroupDto): Group {
  return {
    type: 'group',
    key: dto.key as GroupKey,
    displayName: dto.displayName,
    description: nonEmpty(dto.description),
  };
}

function toMemberships(dto: MembershipsDto): Memberships {
  return {
    roles: dto.roles.map(toPrincipalRef),
    groups: dto.groups.map(toPrincipalRef),
  };
}

function toPrincipalRef(dto: PrincipalRefDto): PrincipalRef {
  return {
    key: dto.key as PrincipalKey,
    type: dto.type,
    displayName: dto.displayName,
  };
}
