import { GraphQLString, list, nonNull, type GraphQLFields } from '/lib/graphql';

import { deletePrincipals } from './principal.source';
import { PrincipalDeletionType } from './principal.types';

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
