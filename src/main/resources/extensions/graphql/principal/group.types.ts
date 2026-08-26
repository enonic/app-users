import {
  GraphQLBoolean,
  GraphQLString,
  list,
  nonNull,
  type GraphQLFields,
  type GraphQLType,
} from '/lib/graphql';

import { generator } from '../schema/generator';
import {
  listGroupGroups,
  listGroupMembers,
  listGroupRoles,
  type GroupSource,
} from './group.source';
import { displayNameOf } from './principal.source';
import { PrincipalType, PrincipalTypeEnum } from './principal.types';

const principals = nonNull(list(nonNull(PrincipalType)));

/** Everything about a group that costs nothing, spread into the two types that show it. */
const groupFields: GraphQLFields = {
  key: {
    type: nonNull(GraphQLString),
  },
  type: {
    type: nonNull(PrincipalTypeEnum),
  },
  displayName: {
    type: nonNull(GraphQLString),
    resolve: (env: { source: GroupSource }) => displayNameOf(env.source),
  },
  description: {
    type: GraphQLString,
  },
};

export const GroupType: GraphQLType = generator.createObjectType({
  name: 'Group',
  description:
    'A group as the list shows it. Its members and its memberships are reachable through `group(key)` only.',
  fields: groupFields,
});

/**
 * One group by key: the same scalars plus the three lists the list field cannot reach.
 *
 * ! A call per list — `getMembers` once, `getMemberships` once per membership field — and none has a cheap
 * ! count behind it, so unlike an id provider there is no `total` to ask for instead. As fields of `Group`
 * ! they made `groups { members roles }` a legal query costing that per group on the instance, serial on
 * ! the app's single JS thread, and lib-graphql has no query-cost analysis to refuse it. Groups are the
 * ! half that cannot wait: roles are bounded, groups are not.
 *
 * The scalars are repeated for the reason `RoleDetail` gives: they are already in hand, and they are what
 * lets the panel answer without the list.
 */
export const GroupDetailType: GraphQLType = generator.createObjectType({
  name: 'GroupDetail',
  description: 'One group by key, with what a details panel needs and a list must not ask for.',
  fields: {
    ...groupFields,
    members: {
      type: principals,
      description: 'Users and groups in this group, flat. Empty when nobody is in it.',
      resolve: (env: { source: GroupSource }) => listGroupMembers(env.source.key),
    },
    roles: {
      type: principals,
      description:
        'Roles this group holds. `transitive` includes those held through a parent group; without it, only the roles set on the group itself.',
      args: { transitive: nonNull(GraphQLBoolean) },
      resolve: (env: { source: GroupSource; args: { transitive: boolean } }) =>
        listGroupRoles(env.source.key, env.args.transitive),
    },
    groups: {
      type: principals,
      description:
        'Groups this group sits in. `transitive` includes those reached through another group. Not its members — those are in `members`.',
      args: { transitive: nonNull(GraphQLBoolean) },
      resolve: (env: { source: GroupSource; args: { transitive: boolean } }) =>
        listGroupGroups(env.source.key, env.args.transitive),
    },
  },
});
