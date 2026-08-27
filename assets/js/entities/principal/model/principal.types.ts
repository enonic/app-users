import type {
  Group as XpGroup,
  PrincipalKey,
  PrincipalType,
  Role as XpRole,
  User as XpUser,
} from '@enonic-types/core';

/**
 * The principal shapes come from the platform's own types, so nothing here can drift from what
 * `lib/xp/auth` returns: `PrincipalKey` is the template-literal union `user:` / `group:` / `role:`,
 * and `Principal` discriminates on `type`.
 */
export type {
  GroupKey,
  Principal,
  PrincipalKey,
  PrincipalType,
  RoleKey,
  UserKey,
} from '@enonic-types/core';

/**
 * A principal as it appears in a member or membership list: the three fields such a row shows. The
 * full `Principal` union also carries login, email and provider, which no list renders and which
 * would make every membership list polymorphic on the wire to no purpose.
 */
export type PrincipalRef = {
  type: PrincipalType;
  key: PrincipalKey;
  displayName: string;
};

/**
 * A role as a list row.
 *
 * `modifiedTime` is optional here although `@enonic-types/core` declares it required: it is written
 * from a nullable Java getter, and the script bridge drops the key instead of sending null.
 */
export type Role = Omit<XpRole, 'modifiedTime'> & {
  modifiedTime?: string;
};

/**
 * A role with the principals holding it, which the platform answers separately through `getMembers`.
 *
 * Only the details panel needs them, and one `getMembers` per row is what a list must never pay, so they
 * are fetched by key for the selected role rather than carried on every row.
 */
export type RoleDetail = Role & {
  members: readonly PrincipalRef[];
};

/**
 * A group as a list row.
 *
 * `modifiedTime` is optional here although `@enonic-types/core` declares it required, for the reason
 * given on `Role`.
 */
export type Group = Omit<XpGroup, 'modifiedTime'> & {
  modifiedTime?: string;
};

/**
 * What a `getMemberships` read answers with, split by type: the roles the principal holds and the groups
 * it sits in. Both a user and a group have them, and either list may be held through a group rather than
 * set on the principal itself.
 */
export type Memberships = {
  roles: readonly PrincipalRef[];
  groups: readonly PrincipalRef[];
};

/**
 * A group with its members and its own memberships. Members and memberships are separate calls in the
 * platform — `getMembers` and `getMemberships` — so both are fetched by key for the selected group, and a
 * member that is itself a group appears as a plain reference without members of its own: the UI shows no
 * nesting.
 */
export type GroupDetail = Group &
  Memberships & {
    members: readonly PrincipalRef[];
  };

/**
 * A user as a list row: what the server returns a page of.
 *
 * ! No `description`, no `createdTime`, no `disabled`. XP stores none of them for a user —
 * ! `populateUserData` writes email, login, the authentication hash and the profile, and nothing else —
 * ! so the description and the created/modified pair the mockups draw have no source, and `disabled`
 * ! arrives from `PrincipalMapper` always `false` because nothing ever persists it. See the `disabled`
 * ! and `modifiedTime` entries in `docs/platform-facts.md`.
 *
 * `modifiedTime` is dropped from the platform's type for the same reason it is optional on `Role`.
 */
export type User = Omit<XpUser, 'modifiedTime'>;

/**
 * A user with the roles and groups it holds, which the platform answers separately through
 * `getMemberships`.
 *
 * Only the details panel needs them, and the list is paged, so they are fetched by key for one user
 * rather than carried on every row.
 */
export type UserDetail = User &
  Memberships & {
    publicKeys: readonly PublicKey[];
  };

/** A key a user can authenticate with, stored in its profile — so only a detail read carries it. */
export type PublicKey = {
  kid: string;
  publicKey?: string;
  label?: string;
  creationTime?: string;
};

/**
 * An ID provider with the principals that belong to it — users and groups, the two kinds a provider
 * holds. Roles have no provider at all, so there is none of them here.
 *
 * Declared locally rather than off `@enonic-types/lib-auth`: every field below either replaces one
 * of the platform's or has no counterpart in it, so the intersection would promise a shape the wire
 * does not carry.
 *
 * There is no `Active` / `Inactive` flag: the platform has none, and which reading it should take is
 * still open — see § 5 of `docs/browse-framework.md`.
 */
/**
 * A provider as the other sections know it: the name to show where a principal comes from.
 *
 * Its own section needs `IdProvider` below, and the difference is not cosmetic — every field that one
 * adds costs the server a descriptor read or a search per provider, so a screen that only names a
 * principal's origin asks for this and nothing more.
 */
export type IdProviderName = {
  key: string;
  displayName: string;
};

export type IdProvider = IdProviderName & {
  description?: string;
  /**
   * The application the provider is bound to, named as an administrator recognises it. Absent means
   * bound to nothing, and such a provider serves no login.
   *
   * Not the platform's `idProviderConfig`: that carries the application *key* and the per-instance
   * config tree, and every screen wants the name. The key rides along because the details panel
   * still identifies the application by it.
   */
  application?: BoundApplication;
  users: PrincipalSet;
  groups: PrincipalSet;
};

/**
 * How far a principal may reach into a provider, from the platform's own `IdProviderAccess`. The order
 * is the platform's too — widening — and the pickers keep it.
 */
export type IdProviderAccess =
  | 'READ'
  | 'CREATE_USERS'
  | 'WRITE_USERS'
  | 'ID_PROVIDER_MANAGER'
  | 'ADMINISTRATOR';

/** One entry of a provider's access control list. */
export type IdProviderPermission = {
  principal: PrincipalRef;
  access: IdProviderAccess;
};

/**
 * A provider's access control list, read by key.
 *
 * Its own read: the list costs a security-service call per provider, so no list query carries it and
 * only the editor asks for it.
 */
export type IdProviderPermissions = {
  key: string;
  permissions: readonly IdProviderPermission[];
};

/** Which of a provider's two sets a read is about. */
export type PrincipalSetType = 'user' | 'group';

/** One page of a set, with how many there are in all. */
export type PrincipalPage = {
  total: number;
  items: readonly PrincipalRef[];
};

/** The principals a provider holds, read by key and a page at a time: it may hold a whole directory. */
export type IdProviderPrincipals = {
  key: string;
  users: PrincipalPage;
  groups: PrincipalPage;
};

export type BoundApplication = {
  key: string;
  displayName: string;
};

/**
 * A set of principals whose size is known and whose contents may not be.
 *
 * A provider can hold a whole corporate directory, so the two are separate requests: `total` comes
 * from the search itself and costs nothing, while `items` is every row and is asked for only when
 * something means to render them. Absent `items` is "not fetched", never "none".
 *
 * There is no `roles` counterpart yet. The roles a provider's principals hold is an aggregate with
 * no cheap query behind it — see #23.
 */
export type PrincipalSet = {
  total: number;
  items?: readonly PrincipalRef[];
};
