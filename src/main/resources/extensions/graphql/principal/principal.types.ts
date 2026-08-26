import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLString,
  list,
  nonNull,
  type GraphQLType,
} from '/lib/graphql';

import { generator } from '../schema/generator';
import { countPrincipals, listPrincipals, type PrincipalSetSource } from './id-provider.source';

// ? Lowercase values, against GraphQL habit: they mirror the platform's own discriminator, so the
// ? wire shape is the one `Principal` from @enonic-types/core already describes and neither side
// ? has to translate it.
export const PrincipalTypeEnum: GraphQLType = generator.createEnumType({
  name: 'PrincipalType',
  description: 'Which kind of principal this is.',
  values: ['user', 'group', 'role'],
});

export const PrincipalType: GraphQLType = generator.createObjectType({
  name: 'Principal',
  description: 'A principal as it appears in a member or membership list.',
  fields: {
    key: {
      type: nonNull(GraphQLString),
      description: 'Qualified key: `<type>:<provider>:<name>`, or `role:<name>` for a role.',
    },
    type: {
      type: nonNull(PrincipalTypeEnum),
    },
    displayName: {
      type: nonNull(GraphQLString),
      description: 'Falls back to the name read off the key when the principal declares none.',
    },
  },
});

export const PrincipalDeletionType: GraphQLType = generator.createObjectType({
  name: 'PrincipalDeletion',
  description: 'What became of one key a delete was asked for.',
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
      description: 'Why the principal is still there. Null when it is gone.',
    },
  },
});

/**
 * A set of principals whose size and contents cost very different amounts.
 *
 * The container itself resolves for free, so `total` can be had without `items`. That separation is
 * the point rather than a nicety: an id provider may hold a whole corporate directory, and a screen
 * that shows `Users (4213)` must never be the one that fetched 4213 rows to count them.
 */
export const PrincipalSetType: GraphQLType = generator.createObjectType({
  name: 'PrincipalSet',
  fields: {
    total: {
      type: nonNull(GraphQLInt),
      description: 'Counted by the search itself, without fetching a single row.',
      resolve: (env: { source: PrincipalSetSource }) => countPrincipals(env.source),
    },
    items: {
      type: nonNull(list(nonNull(PrincipalType))),
      description:
        'A page of the set, in the order the search answered — `findPrincipals` takes no order, so paging is sound only as long as nothing re-sorts it. `count: -1` is every row, which on a directory-backed provider is the whole directory.',
      args: { start: nonNull(GraphQLInt), count: nonNull(GraphQLInt) },
      resolve: (env: { source: PrincipalSetSource; args: { start: number; count: number } }) =>
        listPrincipals(env.source, env.args.start, env.args.count),
    },
  },
});
