import { list, nonNull, type GraphQLFields } from '/lib/graphql';

import { listContentRepositories } from './repository.source';
import { RepositoryType } from './repository.types';

export const repositoryQueryFields: GraphQLFields = {
  repositories: {
    type: list(nonNull(RepositoryType)),
    description:
      'Content repositories a permission report can be generated from, sorted by id. Null where the caller is not a system administrator.',
    resolve: () => listContentRepositories(),
  },
};
