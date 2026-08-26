import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLString,
  list,
  nonNull,
  type GraphQLFields,
} from '/lib/graphql';

import {
  addPublicKey,
  createUser,
  getUser,
  listUsers,
  removePublicKey,
  updateUser,
  type UserChanges,
  type UserInput,
  type UserSort,
} from './user.source';
import { PublicKeyType, UserPageType, UserSortEnum, UserType } from './user.types';

type CreateArgs = {
  idProvider: string;
  name: string;
  displayName: string;
  email?: string;
  password?: string;
  roles?: string[];
  groups?: string[];
};

type UpdateArgs = {
  key: string;
  displayName: string;
  email?: string;
  password?: string;
  addRoles?: string[];
  removeRoles?: string[];
  addGroups?: string[];
  removeGroups?: string[];
};

const keys = list(nonNull(GraphQLString));

export const userQueryFields: GraphQLFields = {
  users: {
    type: UserPageType,
    description:
      'One page of users, searched, filtered and ordered by the server — the only section that cannot load whole.',
    args: {
      start: GraphQLInt,
      count: GraphQLInt,
      search: GraphQLString,
      idProviders: list(GraphQLString),
      sort: UserSortEnum,
    },
    resolve: (env: {
      args: {
        start?: number;
        count?: number;
        search?: string;
        idProviders?: string[];
        sort?: UserSort;
      };
    }) => listUsers(env.args),
  },
  user: {
    type: UserType,
    description: 'One user by key, or null when no user answers to it.',
    args: {
      key: nonNull(GraphQLString),
    },
    resolve: (env: { args: { key: string } }) => getUser(env.args.key),
  },
};

export const userMutationFields: GraphQLFields = {
  createUser: {
    type: UserType,
    description:
      'Creates a user in an ID provider, with the roles and groups listed and optionally a password. The provider is fixed for the lifetime of the user, since its key carries it.',
    args: {
      idProvider: nonNull(GraphQLString),
      name: nonNull(GraphQLString),
      displayName: nonNull(GraphQLString),
      email: GraphQLString,
      password: GraphQLString,
      roles: keys,
      groups: keys,
    },
    resolve: (env: { args: CreateArgs }) =>
      createUser(env.args.idProvider, env.args.name, {
        displayName: env.args.displayName,
        email: env.args.email,
        password: env.args.password,
        roles: env.args.roles ?? [],
        groups: env.args.groups ?? [],
      } satisfies UserInput),
  },
  addPublicKey: {
    type: PublicKeyType,
    description:
      'Stores a public key on a user and answers the entry written, whose `kid` identifies it from then on.',
    args: {
      key: nonNull(GraphQLString),
      publicKey: nonNull(GraphQLString),
      label: GraphQLString,
    },
    resolve: (env: { args: { key: string; publicKey: string; label?: string } }) =>
      addPublicKey(env.args.key, env.args.publicKey, env.args.label),
  },
  removePublicKey: {
    type: GraphQLBoolean,
    description: 'Whether the key is gone, which a `kid` nothing answers to also satisfies.',
    args: {
      key: nonNull(GraphQLString),
      kid: nonNull(GraphQLString),
    },
    resolve: (env: { args: { key: string; kid: string } }) =>
      removePublicKey(env.args.key, env.args.kid),
  },
  updateUser: {
    type: UserType,
    description:
      'Renames and re-addresses a user, applies the membership the edit changed, and optionally sets or clears the password. The four lists are what moved, not what the user is to hold.',
    args: {
      key: nonNull(GraphQLString),
      displayName: nonNull(GraphQLString),
      email: GraphQLString,
      password: GraphQLString,
      addRoles: keys,
      removeRoles: keys,
      addGroups: keys,
      removeGroups: keys,
    },
    resolve: (env: { args: UpdateArgs }) => updateUser(env.args.key, toUserChanges(env.args)),
  },
};

function toUserChanges(args: UpdateArgs): UserChanges {
  return {
    displayName: args.displayName,
    email: args.email,
    password: args.password,
    addRoles: args.addRoles ?? [],
    removeRoles: args.removeRoles ?? [],
    addGroups: args.addGroups ?? [],
    removeGroups: args.removeGroups ?? [],
  };
}
