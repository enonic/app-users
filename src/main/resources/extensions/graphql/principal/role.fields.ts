import { GraphQLString, list, nonNull, type GraphQLFields } from '/lib/graphql';

import { createRole, getRole, listRoles, updateRole, type RoleChanges } from './role.source';
import { RoleDetailType, RoleType } from './role.types';

type CreateArgs = {
  name: string;
  displayName: string;
  description?: string;
  members?: string[];
};

type UpdateArgs = {
  key: string;
  displayName: string;
  description?: string;
  addMembers?: string[];
  removeMembers?: string[];
};

const keys = list(nonNull(GraphQLString));

export const roleQueryFields: GraphQLFields = {
  roles: {
    type: list(nonNull(RoleType)),
    description: 'Every role on this instance, sorted by display name.',
    resolve: () => listRoles(),
  },
  role: {
    type: RoleDetailType,
    description: 'One role by key, or null when no role answers to it.',
    args: {
      key: nonNull(GraphQLString),
    },
    resolve: (env: { args: { key: string } }) => getRole(env.args.key),
  },
};

export const roleMutationFields: GraphQLFields = {
  createRole: {
    type: RoleType,
    description: 'Creates a role and gives it the members listed.',
    args: {
      name: nonNull(GraphQLString),
      displayName: nonNull(GraphQLString),
      description: GraphQLString,
      members: keys,
    },
    resolve: (env: { args: CreateArgs }) =>
      createRole(env.args.name, {
        displayName: env.args.displayName,
        description: env.args.description,
        members: env.args.members ?? [],
      }),
  },
  updateRole: {
    type: RoleType,
    description:
      'Renames and re-describes a role, and applies the membership the edit changed. The two lists are what moved, not what the role is to hold — omit both and the membership is left alone.',
    args: {
      key: nonNull(GraphQLString),
      displayName: nonNull(GraphQLString),
      description: GraphQLString,
      addMembers: keys,
      removeMembers: keys,
    },
    resolve: (env: { args: UpdateArgs }) => updateRole(env.args.key, toRoleChanges(env.args)),
  },
};

// ! Defaulted, because an empty list can arrive as no argument at all: `DataFetchingEnvironmentMapper`
// ! hands arguments to JS through the same `MapGenerator` that drops an empty `interfaces` list.
function toRoleChanges(args: UpdateArgs): RoleChanges {
  return {
    displayName: args.displayName,
    description: args.description,
    addMembers: args.addMembers ?? [],
    removeMembers: args.removeMembers ?? [],
  };
}
