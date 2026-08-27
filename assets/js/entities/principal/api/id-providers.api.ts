import { err, ok, type ResultAsync } from 'neverthrow';

import {
  AppError,
  requestGraphQl,
  requestGraphQlDocument,
  type GraphQlRoot,
} from '../../../shared/api';
import type {
  IdProvider,
  IdProviderAccess,
  IdProviderName,
  IdProviderPermission,
  IdProviderPermissions,
  IdProviderPrincipals,
  PrincipalPage,
  PrincipalRef,
  PrincipalSetType,
} from '../model/principal.types';

/**
 * ! Two roots over one field, because a selection carries a cost and not only a shape. `application`
 * ! resolves through a descriptor read per provider, and each of `users` and `groups` through a
 * ! `findPrincipals` search per provider — three server operations each, for a list Users, Groups and
 * ! Roles read only to name where a principal comes from. Users re-runs its whole screen query on every
 * ! debounced keystroke, so the full selection there is that cost per keystroke.
 */
const ID_PROVIDER_NAMES_SELECTION = `{
  key
  displayName
}`;

/** For any screen naming a principal's origin: Users, Groups, Roles. */
export const ID_PROVIDER_NAMES_ROOT: GraphQlRoot = {
  field: 'idProviders',
  selection: ID_PROVIDER_NAMES_SELECTION,
};

export type IdProviderNamesData = { idProviders: IdProviderNameDto[] | null };

// One `count: 0` search per provider, which is what lets the Users filter hide a provider holding none
// and show the rest with a number, as the client-side filters of the other sections do.
const ID_PROVIDER_USER_COUNTS_SELECTION = `{
  key
  displayName
  users {
    total
  }
}`;

export const ID_PROVIDER_USER_COUNTS_ROOT: GraphQlRoot = {
  field: 'idProviders',
  selection: ID_PROVIDER_USER_COUNTS_SELECTION,
};

type IdProviderUserCountDto = IdProviderNameDto & { users: { total: number } };

export type IdProviderUserCountsData = { idProviders: IdProviderUserCountDto[] | null };

export type IdProviderUserCount = IdProviderName & { users: number };

export function toIdProviderUserCounts(
  dtos: readonly IdProviderUserCountDto[],
): IdProviderUserCount[] {
  return dtos.map(({ key, displayName, users }) => ({ key, displayName, users: users.total }));
}

// Counts only: `items` on either set is every principal the provider holds, which on a
// directory-backed install is the whole directory. The panel asks for numbers, not rows.
const ID_PROVIDERS_SELECTION = `{
  key
  displayName
  description
  application {
    key
    displayName
  }
  users {
    total
  }
  groups {
    total
  }
}`;

/** Everything the ID Providers section shows, and only that section. */
export const ID_PROVIDERS_ROOT: GraphQlRoot = {
  field: 'idProviders',
  selection: ID_PROVIDERS_SELECTION,
};

type IdProviderNameDto = IdProviderName;

type IdProviderDto = {
  key: string;
  displayName: string;
  description: string | null;
  application: { key: string; displayName: string } | null;
  users: { total: number };
  groups: { total: number };
};

export type IdProvidersData = { idProviders: IdProviderDto[] | null };

export function toIdProviders(dtos: readonly IdProviderDto[]): IdProvider[] {
  return dtos.map(toIdProvider);
}

export function toIdProviderNames(dtos: readonly IdProviderNameDto[]): IdProviderName[] {
  return dtos.map(({ key, displayName }) => ({ key, displayName }));
}

/** For the ID Providers section, which needs nothing else. */
export function fetchIdProviders(signal?: AbortSignal): ResultAsync<IdProvider[], AppError> {
  return requestGraphQl<{ idProviders: IdProviderDto[] }>(ID_PROVIDERS_ROOT, { signal }).map(
    ({ idProviders }) => toIdProviders(idProviders),
  );
}

const PRINCIPAL_REF_FIELDS = `
    key
    type
    displayName
  `;

const PERMISSIONS_SELECTION = `{
  principal {${PRINCIPAL_REF_FIELDS}}
  access
}`;

const ID_PROVIDER_PERMISSIONS_DOCUMENT = `query IdProviderPermissions($key: String!) {
  idProvider(key: $key) {
    key
    permissions ${PERMISSIONS_SELECTION}
  }
}`;

/** How many principals a page of the details panel holds. A provider may hold a whole directory. */
export const ID_PROVIDER_PRINCIPALS_PAGE = 50;

const PRINCIPAL_SET_FIELDS = `
    total
    items(start: $start, count: $count) {${PRINCIPAL_REF_FIELDS}}
  `;

/** Both sets, for a panel that has just been opened on a provider. */
const ID_PROVIDER_PRINCIPALS_DOCUMENT = `query IdProviderPrincipals($key: String!, $start: Int!, $count: Int!) {
  idProvider(key: $key) {
    key
    users {${PRINCIPAL_SET_FIELDS}}
    groups {${PRINCIPAL_SET_FIELDS}}
  }
}`;

/** One set, for `Load more`. Two documents because a field cannot be picked by a variable. */
const PRINCIPAL_PAGE_DOCUMENTS: Record<PrincipalSetType, string> = {
  user: `query IdProviderUsers($key: String!, $start: Int!, $count: Int!) {
  idProvider(key: $key) {
    key
    users {${PRINCIPAL_SET_FIELDS}}
  }
}`,
  group: `query IdProviderGroups($key: String!, $start: Int!, $count: Int!) {
  idProvider(key: $key) {
    key
    groups {${PRINCIPAL_SET_FIELDS}}
  }
}`,
};

type PrincipalSetDto = {
  total: number;
  items: PrincipalRef[];
};

type IdProviderPrincipalsDto = {
  key: string;
  users: PrincipalSetDto;
  groups: PrincipalSetDto;
};

/** The first page of both sets. `undefined` for a key nothing answers to. */
export function fetchIdProviderPrincipals(
  key: string,
  signal?: AbortSignal,
): ResultAsync<IdProviderPrincipals | undefined, AppError> {
  return requestGraphQlDocument<{ idProvider: IdProviderPrincipalsDto | null }>(
    ID_PROVIDER_PRINCIPALS_DOCUMENT,
    { key, start: 0, count: ID_PROVIDER_PRINCIPALS_PAGE },
    signal,
  ).map(({ idProvider }) => idProvider ?? undefined);
}

/** The next page of one set. `undefined` for a key nothing answers to, which ends the paging. */
export function fetchIdProviderPrincipalPage(
  key: string,
  type: PrincipalSetType,
  start: number,
  signal?: AbortSignal,
): ResultAsync<PrincipalPage | undefined, AppError> {
  return requestGraphQlDocument<{ idProvider: Record<string, PrincipalSetDto> | null }>(
    PRINCIPAL_PAGE_DOCUMENTS[type],
    { key, start, count: ID_PROVIDER_PRINCIPALS_PAGE },
    signal,
  ).map(({ idProvider }) => {
    const set = idProvider?.[type === 'user' ? 'users' : 'groups'];
    return set === undefined ? undefined : { total: set.total, items: set.items };
  });
}

const DEFAULT_ID_PROVIDER_PERMISSIONS_ROOT: GraphQlRoot = {
  field: 'defaultIdProviderPermissions',
  selection: PERMISSIONS_SELECTION,
};

type IdProviderPermissionDto = {
  principal: PrincipalRef;
  access: IdProviderAccess | null;
};

type IdProviderPermissionsDto = {
  key: string;
  permissions: IdProviderPermissionDto[];
};

/**
 * The provider's access control list. `undefined` when no provider answers to the key, which the editor
 * reads as "nothing to show" rather than as a failure.
 */
export function fetchIdProviderPermissions(
  key: string,
  signal?: AbortSignal,
): ResultAsync<IdProviderPermissions | undefined, AppError> {
  return requestGraphQlDocument<{ idProvider: IdProviderPermissionsDto | null }>(
    ID_PROVIDER_PERMISSIONS_DOCUMENT,
    { key },
    signal,
  ).map(({ idProvider }) =>
    idProvider == null
      ? undefined
      : { key: idProvider.key, permissions: idProvider.permissions.map(toPermission) },
  );
}

/** What a provider is to hold. Not a change list: it has one of each, so there is nothing to diff. */
export type IdProviderInput = {
  displayName: string;
  description?: string;
  /** Absent unbinds the provider from the application serving its login. */
  application?: string;
  permissions: readonly { principal: string; access: IdProviderAccess }[];
};

const WRITE_ARGS = `$displayName: String!, $description: String, $application: String, $permissions: [IdProviderPermissionInput!]`;

const WRITE_VALUES = `displayName: $displayName, description: $description, application: $application, permissions: $permissions`;

const CREATE_ID_PROVIDER_DOCUMENT = `
  mutation CreateIdProvider($name: String!, ${WRITE_ARGS}) {
    createIdProvider(name: $name, ${WRITE_VALUES}) ${ID_PROVIDERS_SELECTION}
  }
`;

const UPDATE_ID_PROVIDER_DOCUMENT = `
  mutation UpdateIdProvider($key: String!, ${WRITE_ARGS}) {
    updateIdProvider(key: $key, ${WRITE_VALUES}) ${ID_PROVIDERS_SELECTION}
  }
`;

const DELETE_ID_PROVIDERS_DOCUMENT = `
  mutation DeleteIdProviders($keys: [String!]!) {
    deleteIdProviders(keys: $keys) {
      key
      deleted
      reason
    }
  }
`;

type CreateIdProviderData = { createIdProvider: IdProviderDto | null };

type UpdateIdProviderData = { updateIdProvider: IdProviderDto | null };

export type IdProviderDeletion = {
  key: string;
  deleted: boolean;
  reason?: string;
};

type DeleteIdProvidersData = {
  deleteIdProviders: { key: string; deleted: boolean; reason: string | null }[] | null;
};

export function sendIdProviderCreation(
  name: string,
  input: IdProviderInput,
): ResultAsync<IdProvider, AppError> {
  return requestGraphQlDocument<CreateIdProviderData>(CREATE_ID_PROVIDER_DOCUMENT, {
    name,
    ...input,
  }).andThen(({ createIdProvider }) => written(createIdProvider));
}

export function sendIdProviderUpdate(
  key: string,
  input: IdProviderInput,
): ResultAsync<IdProvider, AppError> {
  return requestGraphQlDocument<UpdateIdProviderData>(UPDATE_ID_PROVIDER_DOCUMENT, {
    key,
    ...input,
  }).andThen(({ updateIdProvider }) => written(updateIdProvider));
}

export function sendIdProviderDeletion(
  keys: readonly string[],
): ResultAsync<IdProviderDeletion[], AppError> {
  return requestGraphQlDocument<DeleteIdProvidersData>(DELETE_ID_PROVIDERS_DOCUMENT, {
    keys,
  }).andThen((data) =>
    data.deleteIdProviders == null
      ? err(new AppError('The id providers were not deleted'))
      : ok(
          data.deleteIdProviders.map(({ key, deleted, reason }) => ({
            key,
            deleted,
            reason: reason ?? undefined,
          })),
        ),
  );
}

/** What a new provider starts from: the three entries app-users seeds one with. */
export function fetchDefaultIdProviderPermissions(
  signal?: AbortSignal,
): ResultAsync<IdProviderPermission[], AppError> {
  return requestGraphQl<{ defaultIdProviderPermissions: IdProviderPermissionDto[] }>(
    DEFAULT_ID_PROVIDER_PERMISSIONS_ROOT,
    { signal },
  ).map(({ defaultIdProviderPermissions }) => defaultIdProviderPermissions.map(toPermission));
}

//
// * Helpers
//

// ? `access` is absent for a principal the list grants nothing, which XP itself does not produce. Read
// ? as the narrowest level rather than dropped, so such an entry stays visible and can be corrected.
function toPermission(dto: IdProviderPermissionDto): IdProviderPermission {
  return { principal: dto.principal, access: dto.access ?? 'READ' };
}

// ! A write that answered null is a failure, unlike a read of one item: nothing says whether it happened.
function written(dto: IdProviderDto | null) {
  return dto == null ? err(new AppError('The id provider was not written')) : ok(toIdProvider(dto));
}

function toIdProvider(dto: IdProviderDto): IdProvider {
  return {
    key: dto.key,
    displayName: dto.displayName,
    description: dto.description ?? undefined,
    application: dto.application ?? undefined,
    users: { total: dto.users.total },
    groups: { total: dto.groups.total },
  };
}
