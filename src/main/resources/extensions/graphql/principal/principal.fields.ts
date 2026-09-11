import { GraphQLInt, GraphQLString, list, nonNull, type GraphQLFields } from '/lib/graphql';
import type { PrincipalType } from '/lib/xp/auth';

import { deletePrincipals, searchPrincipals } from './principal.source';
import { PrincipalDeletionType, PrincipalPageType, PrincipalTypeEnum } from './principal.types';

type SearchArgs = {
  types?: PrincipalType[];
  idProvider?: string;
  search?: string;
  start?: number;
  count?: number;
};

export const principalQueryFields: GraphQLFields = {
  principals: {
    type: PrincipalPageType,
    description:
      'One page of principals of the kinds listed, in the order the search answered. No kinds is every kind.',
    args: {
      types: list(nonNull(PrincipalTypeEnum)),
      idProvider: GraphQLString,
      search: GraphQLString,
      start: GraphQLInt,
      count: GraphQLInt,
    },
    resolve: (env: { args: SearchArgs }) =>
      searchPrincipals({ ...env.args, types: env.args.types ?? [] }),
  },
};

export const principalMutationFields: GraphQLFields = {
  deletePrincipals: {
    type: list(nonNull(PrincipalDeletionType)),
    description:
      'Deletes every key given and answers one outcome per key, so a partial failure names which key it was.',
    args: {
      keys: nonNull(list(nonNull(GraphQLString))),
    },
    resolve: (env: { args: { keys: string[] } }) => deletePrincipals(env.args.keys),
  },
};
