import { GraphQLString, list, nonNull, type GraphQLFields } from '/lib/graphql';

import {
  createGroup,
  getGroup,
  listGroups,
  updateGroup,
  type GroupChanges,
  type GroupInput,
} from './group.source';
import { GroupDetailType, GroupType } from './group.types';

type CreateArgs = {
  idProvider: string;
  name: string;
  displayName: string;
  description?: string;
  members?: string[];
  roles?: string[];
};

type UpdateArgs = {
  key: string;
  displayName: string;
  description?: string;
  addMembers?: string[];
  removeMembers?: string[];
  addRoles?: string[];
  removeRoles?: string[];
};

const keys = list(nonNull(GraphQLString));

export const groupQueryFields: GraphQLFields = {
  groups: {
    type: list(nonNull(GroupType)),
    description: 'Every group on this instance, sorted by display name.',
    resolve: () => listGroups(),
  },
  group: {
    type: GroupDetailType,
    description: 'One group by key, or null when no group answers to it.',
    args: {
      key: nonNull(GraphQLString),
    },
    resolve: (env: { args: { key: string } }) => getGroup(env.args.key),
  },
};

export const groupMutationFields: GraphQLFields = {
  createGroup: {
    type: GroupType,
    description:
      'Creates a group in an ID provider, with the members and the roles listed. The provider is fixed for the lifetime of the group, since its key carries it.',
    args: {
      idProvider: nonNull(GraphQLString),
      name: nonNull(GraphQLString),
      displayName: nonNull(GraphQLString),
      description: GraphQLString,
      members: keys,
      roles: keys,
    },
    resolve: (env: { args: CreateArgs }) =>
      createGroup(env.args.idProvider, env.args.name, toGroupInput(env.args)),
  },
  updateGroup: {
    type: GroupType,
    description:
      'Renames and re-describes a group, and applies the membership the edit changed. The four lists are what moved, not what the group is to hold — an omitted one leaves that membership alone.',
    args: {
      key: nonNull(GraphQLString),
      displayName: nonNull(GraphQLString),
      description: GraphQLString,
      addMembers: keys,
      removeMembers: keys,
      addRoles: keys,
      removeRoles: keys,
    },
    resolve: (env: { args: UpdateArgs }) => updateGroup(env.args.key, toGroupChanges(env.args)),
  },
};

// *
// * Helpers
// *

// ! Defaulted, because an empty list can arrive as no argument at all: `DataFetchingEnvironmentMapper`
// ! hands arguments to JS through the same `MapGenerator` that drops an empty `interfaces` list.
function toGroupInput({ displayName, description, members, roles }: CreateArgs): GroupInput {
  return { displayName, description, members: members ?? [], roles: roles ?? [] };
}

function toGroupChanges(args: UpdateArgs): GroupChanges {
  return {
    displayName: args.displayName,
    description: args.description,
    addMembers: args.addMembers ?? [],
    removeMembers: args.removeMembers ?? [],
    addRoles: args.addRoles ?? [],
    removeRoles: args.removeRoles ?? [],
  };
}
