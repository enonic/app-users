import { err, ok, type ResultAsync } from 'neverthrow';

import { AppError, requestGraphQlDocument, written, type GraphQlRoot } from '../../../shared/api';
import type {
  PrincipalKey,
  PrincipalRef,
  PublicKey,
  User,
  UserDetail,
  UserKey,
} from '../model/principal.types';

const USER_FIELDS = `
  key
  displayName
  login
  email
  idProvider
  hasPassword
`;

/**
 * The user list, one page at a time.
 * ! Users is the only section the server narrows: search, provider filter, order and paging all happen
 * ! in `findUsers`, because a directory-backed install holds more users than a screen can load whole —
 * ! see the `findUsers` entry in `docs/platform-facts.md`. Every argument therefore rides as a variable;
 * ! nothing typed into the search box becomes part of the document.
 */
export const USERS_ROOT: GraphQlRoot = {
  field: 'users',
  args: '(start: $start, count: $count, search: $search, idProviders: $idProviders, sort: $sort)',
  variables: {
    start: 'Int',
    count: 'Int',
    search: 'String',
    idProviders: '[String]',
    sort: 'UserSort',
  },
  selection: `{
  total
  hits {${USER_FIELDS}}
}`,
};

const PUBLIC_KEY_FIELDS = `
  publicKeys {
    kid
    publicKey
    label
    creationTime
  }
`;

const MEMBERSHIP_FIELDS = `
  roles(transitive: $transitive) {
    key
    type
    displayName
  }
  groups(transitive: $transitive) {
    key
    type
    displayName
  }
`;

/**
 * What the details panel is missing when it already has the row: the memberships and nothing else.
 *
 * A row carries every scalar the panel shows — the list selected them — so asking for them again would
 * be re-reading what is on screen. Only the roles and groups are absent from a row, because they are a
 * `getMemberships` call per user and no list can afford one per row.
 */
const USER_MEMBERSHIPS_DOCUMENT = `
  query UserMemberships($key: String!, $transitive: Boolean!) {
    user(key: $key) {${MEMBERSHIP_FIELDS}${PUBLIC_KEY_FIELDS}}
  }
`;

/**
 * The whole user, for when the panel has no row to build on: a link opened straight at
 * `/users/<key>`, or a search that has since narrowed the loaded page away from it.
 *
 * Null is a legitimate answer to both documents — the key may name nobody — which is why they travel as
 * documents rather than as roots.
 */
const USER_DOCUMENT = `
  query User($key: String!, $transitive: Boolean!) {
    user(key: $key) {${USER_FIELDS}${MEMBERSHIP_FIELDS}${PUBLIC_KEY_FIELDS}}
  }
`;

type UserDto = {
  key: string;
  displayName: string;
  login: string;
  email: string | null;
  idProvider: string;
  hasPassword: boolean;
};

export type UsersPageDto = {
  total: number;
  hits: UserDto[];
};

export type UsersData = { users: UsersPageDto | null };

type PrincipalRefDto = {
  key: string;
  type: PrincipalRef['type'];
  displayName: string;
};

type PublicKeyDto = {
  kid: string;
  publicKey?: string | null;
  label: string | null;
  creationTime: string | null;
};

type UserDetailDto = UserDto & {
  roles: PrincipalRefDto[];
  groups: PrincipalRefDto[];
  publicKeys: PublicKeyDto[];
};

type MembershipsDto = {
  publicKeys: PublicKeyDto[];
  roles: PrincipalRefDto[];
  groups: PrincipalRefDto[];
};

/** `user` is null for a key nothing answers to, which is an answer rather than a failure. */
type UserDetailData = { user: UserDetailDto | null };

type UserMembershipsData = { user: MembershipsDto | null };

/**
 * The whole user, for a panel with no row to build on. `undefined` for a key nothing answers to.
 */
export function fetchUserDetail(
  key: string,
  transitive: boolean,
  signal?: AbortSignal,
): ResultAsync<UserDetail | undefined, AppError> {
  return requestGraphQlDocument<UserDetailData>(USER_DOCUMENT, { key, transitive }, signal).map(
    ({ user }) => (user == null ? undefined : { ...toUser(user), ...toMemberships(user) }),
  );
}

/**
 * The row the list already holds, completed with what only a by-key read can answer: its roles and
 * groups. Cheaper than the whole user, and every other field is already on screen.
 */
export function fetchUserMemberships(
  row: User,
  transitive: boolean,
  signal?: AbortSignal,
): ResultAsync<UserDetail | undefined, AppError> {
  return requestGraphQlDocument<UserMembershipsData>(
    USER_MEMBERSHIPS_DOCUMENT,
    { key: row.key, transitive },
    signal,
  ).map(({ user }) => (user == null ? undefined : { ...row, ...toMemberships(user) }));
}

export type UserInput = {
  displayName: string;
  email?: string;
  password?: string;
  roles: readonly PrincipalKey[];
  groups: readonly PrincipalKey[];
};

export type UserChanges = {
  displayName: string;
  email?: string;
  password?: string;
  addRoles: readonly PrincipalKey[];
  removeRoles: readonly PrincipalKey[];
  addGroups: readonly PrincipalKey[];
  removeGroups: readonly PrincipalKey[];
};

const CREATE_USER_DOCUMENT = `
  mutation CreateUser($idProvider: String!, $name: String!, $displayName: String!, $email: String, $password: String, $roles: [String!], $groups: [String!]) {
    createUser(idProvider: $idProvider, name: $name, displayName: $displayName, email: $email, password: $password, roles: $roles, groups: $groups) {${USER_FIELDS}}
  }
`;

const UPDATE_USER_DOCUMENT = `
  mutation UpdateUser($key: String!, $displayName: String!, $email: String, $password: String, $addRoles: [String!], $removeRoles: [String!], $addGroups: [String!], $removeGroups: [String!]) {
    updateUser(key: $key, displayName: $displayName, email: $email, password: $password, addRoles: $addRoles, removeRoles: $removeRoles, addGroups: $addGroups, removeGroups: $removeGroups) {${USER_FIELDS}}
  }
`;

type CreateUserData = { createUser: UserDto | null };

type UpdateUserData = { updateUser: UserDto | null };

export function sendUserCreation(
  idProvider: string,
  name: string,
  input: UserInput,
): ResultAsync<User, AppError> {
  return requestGraphQlDocument<CreateUserData>(CREATE_USER_DOCUMENT, {
    idProvider,
    name,
    ...input,
  }).andThen(({ createUser }) => written(createUser, toUser, 'The user was not written'));
}

const ADD_PUBLIC_KEY_DOCUMENT = `
  mutation AddPublicKey($key: String!, $publicKey: String!, $label: String) {
    addPublicKey(key: $key, publicKey: $publicKey, label: $label) {
      kid
      label
      creationTime
    }
  }
`;

const REMOVE_PUBLIC_KEY_DOCUMENT = `
  mutation RemovePublicKey($key: String!, $kid: String!) {
    removePublicKey(key: $key, kid: $kid)
  }
`;

type AddPublicKeyData = { addPublicKey: PublicKeyDto | null };

type RemovePublicKeyData = { removePublicKey: boolean | null };

export function sendPublicKeyAddition(
  key: string,
  publicKey: string,
  label?: string,
): ResultAsync<PublicKey, AppError> {
  return requestGraphQlDocument<AddPublicKeyData>(ADD_PUBLIC_KEY_DOCUMENT, {
    key,
    publicKey,
    label,
  }).andThen(({ addPublicKey }) =>
    written(addPublicKey, toPublicKey, 'The public key was not stored'),
  );
}

export function sendPublicKeyRemoval(key: string, kid: string): ResultAsync<void, AppError> {
  return requestGraphQlDocument<RemovePublicKeyData>(REMOVE_PUBLIC_KEY_DOCUMENT, {
    key,
    kid,
  }).andThen(({ removePublicKey }) =>
    removePublicKey === true ? ok(undefined) : err(new AppError('The public key is still there')),
  );
}

export function sendUserUpdate(key: string, changes: UserChanges): ResultAsync<User, AppError> {
  return requestGraphQlDocument<UpdateUserData>(UPDATE_USER_DOCUMENT, {
    key,
    ...changes,
  }).andThen(({ updateUser }) => written(updateUser, toUser, 'The user was not written'));
}

export type UsersPage = {
  total: number;
  items: User[];
};

export function toUsersPage({ total, hits }: UsersPageDto): UsersPage {
  return { total, items: hits.map(toUser) };
}

// * Helpers

function toMemberships(dto: MembershipsDto): Pick<UserDetail, 'roles' | 'groups' | 'publicKeys'> {
  return {
    roles: dto.roles.map(toPrincipalRef),
    groups: dto.groups.map(toPrincipalRef),
    publicKeys: dto.publicKeys.map(toPublicKey),
  };
}

function toPublicKey(dto: PublicKeyDto): PublicKey {
  return {
    kid: dto.kid,
    publicKey: dto.publicKey ?? undefined,
    label: dto.label ?? undefined,
    creationTime: dto.creationTime ?? undefined,
  };
}

function toPrincipalRef(dto: PrincipalRefDto): PrincipalRef {
  return {
    key: dto.key as PrincipalKey,
    type: dto.type,
    displayName: dto.displayName,
  };
}

function toUser(dto: UserDto): User {
  return {
    type: 'user',
    key: dto.key as UserKey,
    displayName: dto.displayName,
    login: dto.login,
    email: dto.email ?? undefined,
    idProvider: dto.idProvider,
    hasPassword: dto.hasPassword,
  };
}
