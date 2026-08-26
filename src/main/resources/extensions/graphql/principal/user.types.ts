import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLString,
  list,
  nonNull,
  type GraphQLType,
} from '/lib/graphql';

import { generator } from '../schema/generator';
import { displayNameOf } from './principal.source';
import { PrincipalType, PrincipalTypeEnum } from './principal.types';
import {
  listUserGroups,
  listUserPublicKeys,
  listUserRoles,
  type UserPage,
  type UserSource,
} from './user.source';

export const UserSortEnum: GraphQLType = generator.createEnumType({
  name: 'UserSort',
  description:
    'The orders the user list offers. Display name is the only orderable field it shows.',
  values: ['displayNameAsc', 'displayNameDesc'],
});

const principals = nonNull(list(nonNull(PrincipalType)));

export const PublicKeyType: GraphQLType = generator.createObjectType({
  name: 'PublicKey',
  description: 'A public key a user can authenticate with, stored in its profile.',
  fields: {
    kid: {
      type: nonNull(GraphQLString),
      description: 'The key id, derived from the key itself.',
    },
    publicKey: {
      type: GraphQLString,
    },
    label: {
      type: GraphQLString,
    },
    creationTime: {
      type: GraphQLString,
    },
  },
});

export const UserType: GraphQLType = generator.createObjectType({
  name: 'User',
  description: 'A user, and the roles and groups it holds.',
  fields: {
    key: {
      type: nonNull(GraphQLString),
    },
    type: {
      type: nonNull(PrincipalTypeEnum),
    },
    displayName: {
      type: nonNull(GraphQLString),
      resolve: (env: { source: UserSource }) => displayNameOf(env.source),
    },
    login: {
      type: nonNull(GraphQLString),
    },
    email: {
      type: GraphQLString,
      description: 'Absent for a user created without one.',
    },
    idProvider: {
      type: nonNull(GraphQLString),
      description: 'The provider this user belongs to, which its key also carries.',
    },
    hasPassword: {
      type: nonNull(GraphQLBoolean),
      description: 'Whether an authentication hash is stored — not whether the user may log in.',
    },
    // ! No `disabled`, though `PrincipalMapper` serializes it: nothing persists it.
    // ! `populateUserData` never writes the property and `createUserFromNode` never reads one, so
    // ! `User.isDisabled()` is the builder default and the field is always `false`. The Active/Inactive
    // ! cell the mockups show has no source — see § 5 of `docs/browse-framework.md`.
    // ! No `description` or `createdTime` either, for the same reason: a user node stores neither.
    roles: {
      type: principals,
      description:
        'Roles this user holds. `transitive` includes those held through a group; without it, only the roles set on the user itself.',
      args: { transitive: nonNull(GraphQLBoolean) },
      resolve: (env: { source: UserSource; args: { transitive: boolean } }) =>
        listUserRoles(env.source.key, env.args.transitive),
    },
    groups: {
      type: principals,
      description:
        'Groups this user is in. `transitive` includes those reached through another group.',
      args: { transitive: nonNull(GraphQLBoolean) },
      resolve: (env: { source: UserSource; args: { transitive: boolean } }) =>
        listUserGroups(env.source.key, env.args.transitive),
    },
    // ! One `getProfile` per user, so it stays lazy.
    publicKeys: {
      type: nonNull(list(nonNull(PublicKeyType))),
      description: 'Public keys this user can authenticate with. Empty when it has none.',
      resolve: (env: { source: UserSource }) => listUserPublicKeys(env.source.key),
    },
  },
});

/**
 * One page of users plus the size of the whole match.
 *
 * `total` is what the list needs to know whether to offer `Load more`, and it costs nothing: the search
 * reports it alongside the page.
 */
export const UserPageType: GraphQLType = generator.createObjectType({
  name: 'UserPage',
  fields: {
    total: {
      type: nonNull(GraphQLInt),
      description: 'How many users the search matched, not how many this page carries.',
      resolve: (env: { source: UserPage }) => env.source.total,
    },
    hits: {
      type: nonNull(list(nonNull(UserType))),
      resolve: (env: { source: UserPage }) => env.source.hits,
    },
  },
});
