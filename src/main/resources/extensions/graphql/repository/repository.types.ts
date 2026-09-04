import { GraphQLString, list, nonNull, type GraphQLType } from '/lib/graphql';

import { generator } from '../schema/generator';

export const RepositoryType: GraphQLType = generator.createObjectType({
  name: 'Repository',
  description: 'A content repository, as a permission report picks one.',
  fields: {
    id: {
      type: nonNull(GraphQLString),
      description: 'Also the name shown: a repository has no display name of its own.',
    },
    branches: {
      type: nonNull(list(nonNull(GraphQLString))),
      description: 'The branches to report on, `master` first where the repository has one.',
    },
  },
});
