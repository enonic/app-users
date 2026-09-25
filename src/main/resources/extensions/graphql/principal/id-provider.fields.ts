import { GraphQLString, Json, list, nonNull, type GraphQLFields } from '/lib/graphql';

import { parseIdProviderConfig } from './id-provider-config';
import {
  createIdProvider,
  deleteIdProviders,
  getIdProvider,
  listDefaultIdProviderPermissions,
  listIdProviders,
  updateIdProvider,
  type IdProviderInput,
  type IdProviderPermissionInput,
} from './id-provider.source';
import {
  IdProviderDeletionType,
  IdProviderPermissionInputType,
  IdProviderPermissionType,
  IdProviderType,
} from './id-provider.types';

type WriteArgs = {
  displayName: string;
  description?: string;
  application?: string;
  config?: unknown;
  permissions?: IdProviderPermissionInput[];
};

type CreateArgs = WriteArgs & { name: string };

type UpdateArgs = WriteArgs & { key: string };

export const idProviderQueryFields: GraphQLFields = {
  idProviders: {
    type: list(nonNull(IdProviderType)),
    description: 'Every id provider on this instance, sorted by display name.',
    resolve: () => listIdProviders(),
  },
  idProvider: {
    type: IdProviderType,
    description: 'One id provider by key, or null when no provider answers to it.',
    args: {
      key: nonNull(GraphQLString),
    },
    resolve: (env: { args: { key: string } }) => getIdProvider(env.args.key),
  },
  defaultIdProviderPermissions: {
    type: list(nonNull(IdProviderPermissionType)),
    description:
      'The permissions a new provider starts from. Fixed rather than read from anywhere: XP declares no default, so these are the three entries app-users seeds a new provider with.',
    resolve: () => listDefaultIdProviderPermissions(),
  },
};

const permissions = list(nonNull(IdProviderPermissionInputType));

export const idProviderMutationFields: GraphQLFields = {
  createIdProvider: {
    type: IdProviderType,
    description:
      "Creates an id provider. `name` becomes its key and is fixed for its lifetime; `application` binds it to the login it serves, and a provider without one serves none. `config` is that application's configuration of it, a typed property tree as `BoundApplication.config` reads it; empty when omitted.",
    args: {
      name: nonNull(GraphQLString),
      displayName: nonNull(GraphQLString),
      description: GraphQLString,
      application: GraphQLString,
      config: Json,
      permissions,
    },
    resolve: (env: { args: CreateArgs }) => createIdProvider(env.args.name, toInput(env.args)),
  },
  updateIdProvider: {
    type: IdProviderType,
    description:
      'Rewrites a provider to what the arguments name. Unlike the group and role mutations this is not a change list — a provider holds one of each — so an omitted `application` unbinds it and an omitted `description` clears it. An omitted `config` is the exception: the binding keeps the configuration it carries, unless `application` names another one.',
    args: {
      key: nonNull(GraphQLString),
      displayName: nonNull(GraphQLString),
      description: GraphQLString,
      application: GraphQLString,
      config: Json,
      permissions,
    },
    resolve: (env: { args: UpdateArgs }) => updateIdProvider(env.args.key, toInput(env.args)),
  },
  deleteIdProviders: {
    type: list(nonNull(IdProviderDeletionType)),
    description:
      'Deletes every key given and answers one outcome per key. Deleting a provider takes its users and groups with it, which is why the platform refuses one that still holds any.',
    args: {
      keys: nonNull(list(nonNull(GraphQLString))),
    },
    resolve: (env: { args: { keys: string[] } }) => deleteIdProviders(env.args.keys),
  },
};

//
// * Helpers
//

// ! Defaulted, because an empty list can arrive as no argument at all: `DataFetchingEnvironmentMapper`
// ! hands arguments to JS through the same `MapGenerator` that drops an empty `interfaces` list.
function toInput({
  displayName,
  description,
  application,
  config: tree,
  permissions: entries,
}: WriteArgs): IdProviderInput {
  return {
    displayName,
    description,
    application,
    config: tree == null ? undefined : parseIdProviderConfig(tree),
    permissions: entries ?? [],
  };
}
