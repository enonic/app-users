import { GraphQLString, list, nonNull, type GraphQLFields, type GraphQLType } from '/lib/graphql';

import { generator } from '../schema/generator';
import { displayNameOf } from './principal.source';
import { PrincipalType, PrincipalTypeEnum } from './principal.types';
import { listRoleMembers, type RoleSource } from './role.source';

/**
 * Everything about a role that costs nothing, shared by the two types that show it.
 *
 * Spread rather than inherited: lib-graphql's builder has no inheritance, and the same trick carries
 * `itemFields` across the three admin-extension types in `application-info.types.ts`.
 */
const roleFields: GraphQLFields = {
  key: {
    type: nonNull(GraphQLString),
  },
  type: {
    type: nonNull(PrincipalTypeEnum),
  },
  displayName: {
    type: nonNull(GraphQLString),
    resolve: (env: { source: RoleSource }) => displayNameOf(env.source),
  },
  description: {
    type: GraphQLString,
  },
  // ! Always null today, and kept anyway: `PrincipalNodeTranslator` never copies the timestamp off
  // ! the node, which is a defect on the XP side rather than a shape to design around — see the
  // ! `modifiedTime` entry in `docs/platform-facts.md`. Nullable here, and the details panel drops
  // ! the row, so the field starts working the day the platform does.
  modifiedTime: {
    type: GraphQLString,
  },
};

export const RoleType: GraphQLType = generator.createObjectType({
  name: 'Role',
  description: 'A role as the list shows it. Its members are reachable through `role(key)` only.',
  fields: roleFields,
});

/**
 * One role by key: the same scalars plus the member list, which the list field cannot reach.
 *
 * ! The split is the whole point. `members` is one `getMembers` call, and lib-graphql offers no
 * ! query-cost analysis — so as a field of `Role` it made `roles { members }` a legal query costing one
 * ! call per role on the instance, roughly 113 of them where twenty projects each contribute five, all
 * ! serial on the app's single JS thread. Making it unreachable is the only guard available, and
 * ! `applications` versus `applicationInfo(key)` is the same shape for the same reason.
 *
 * ? Repeating the scalars costs nothing and buys the panel its independence: `getRole` reads the
 * ? principal to answer at all, so they are already in hand. A panel that took them from the loaded list
 * ? instead would have to wait for it, could not tell a deleted role from one the list has not reached,
 * ? and would break the moment this section pages.
 */
export const RoleDetailType: GraphQLType = generator.createObjectType({
  name: 'RoleDetail',
  description: 'One role by key, with what a details panel needs and a list must not ask for.',
  fields: {
    ...roleFields,
    members: {
      type: nonNull(list(nonNull(PrincipalType))),
      description: 'Users and groups holding this role. Empty when nobody holds it.',
      resolve: (env: { source: RoleSource }) => listRoleMembers(env.source.key),
    },
  },
});
