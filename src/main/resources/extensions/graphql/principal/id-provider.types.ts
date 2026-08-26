import { GraphQLBoolean, GraphQLString, list, nonNull, type GraphQLType } from '/lib/graphql';

import { generator } from '../schema/generator';
import {
  boundApplicationOf,
  listIdProviderPermissions,
  principalSetOf,
  type IdProviderSource,
} from './id-provider.source';
import { displayNameOf } from './principal.source';
import { PrincipalSetType, PrincipalType } from './principal.types';

const BoundApplicationType: GraphQLType = generator.createObjectType({
  name: 'BoundApplication',
  description: 'The application a provider is bound to. Absent means it serves no login yet.',
  fields: {
    key: {
      type: nonNull(GraphQLString),
    },
    displayName: {
      type: nonNull(GraphQLString),
      description: "The application's own title, falling back to its key.",
    },
    // TODO: [#8] The per-instance `config` tree of the binding is left out until the PropertyTree
    // wire format is settled — see the open question in `docs/unified-api.md`. Nothing renders it.
  },
});

const IdProviderAccessType: GraphQLType = generator.createEnumType({
  name: 'IdProviderAccess',
  description: "How far a principal may reach into a provider. XP's own `IdProviderAccess`.",
  values: ['READ', 'CREATE_USERS', 'WRITE_USERS', 'ID_PROVIDER_MANAGER', 'ADMINISTRATOR'],
});

export const IdProviderPermissionType: GraphQLType = generator.createObjectType({
  name: 'IdProviderPermission',
  description: "One entry of a provider's access control list.",
  fields: {
    principal: {
      type: nonNull(PrincipalType),
    },
    access: {
      type: IdProviderAccessType,
      description: 'Absent for an entry the list carries no access for, which XP does not produce.',
    },
  },
});

export const IdProviderPermissionInputType: GraphQLType = generator.createInputObjectType({
  name: 'IdProviderPermissionInput',
  description:
    'One entry of a permissions write. The principal is a key rather than a principal, since a write names what it grants to, not what that principal is.',
  fields: {
    principal: {
      type: nonNull(GraphQLString),
    },
    access: {
      type: nonNull(IdProviderAccessType),
    },
  },
});

export const IdProviderDeletionType: GraphQLType = generator.createObjectType({
  name: 'IdProviderDeletion',
  description:
    'What became of one provider a delete was asked for. Its own type rather than `PrincipalDeletion`: an id provider is not a principal.',
  fields: {
    key: {
      type: nonNull(GraphQLString),
      description: 'The key that was asked for, so an outcome can be matched back to its target.',
    },
    deleted: {
      type: nonNull(GraphQLBoolean),
    },
    reason: {
      type: GraphQLString,
      description: 'Why the provider is still there. Null when it is gone.',
    },
  },
});

export const IdProviderType: GraphQLType = generator.createObjectType({
  name: 'IdProvider',
  description: 'An id provider instance, as configured under ID Providers.',
  fields: {
    key: {
      type: nonNull(GraphQLString),
    },
    displayName: {
      type: nonNull(GraphQLString),
      resolve: (env: { source: IdProviderSource }) => displayNameOf(env.source),
    },
    description: {
      type: GraphQLString,
    },
    application: {
      type: BoundApplicationType,
      resolve: (env: { source: IdProviderSource }) => boundApplicationOf(env.source),
    },
    // Both containers resolve for free — nothing is counted or fetched until a leaf below is asked.
    permissions: {
      type: nonNull(list(nonNull(IdProviderPermissionType))),
      description:
        'Who may reach this provider and how far. One bean call, so it stays off the list query.',
      resolve: (env: { source: IdProviderSource }) => listIdProviderPermissions(env.source.key),
    },
    users: {
      type: nonNull(PrincipalSetType),
      resolve: (env: { source: IdProviderSource }) => principalSetOf(env.source.key, 'user'),
    },
    groups: {
      type: nonNull(PrincipalSetType),
      resolve: (env: { source: IdProviderSource }) => principalSetOf(env.source.key, 'group'),
    },
    // ! No `roles` field yet, deliberately. The roles a provider's principals hold is an aggregate
    // ! with no cheap query behind it: `findPrincipals` cannot filter roles by provider, and walking
    // ! memberships means one call per principal. The affordable shape — one pass over all roles,
    // ! bucketing by the provider segment of each member key — is only worth writing once resolvers
    // ! can memoize per request, which is the batching item in #23.
  },
});
