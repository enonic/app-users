import { GraphQLBoolean, GraphQLString, nonNull, type GraphQLType } from '/lib/graphql';

import { generator } from '../schema/generator';

export const IdProviderApplicationType: GraphQLType = generator.createObjectType({
  name: 'IdProviderApplication',
  description: 'An installed application an id provider can be bound to.',
  fields: {
    key: {
      type: nonNull(GraphQLString),
    },
    displayName: {
      type: nonNull(GraphQLString),
    },
    hasConfig: {
      type: nonNull(GraphQLBoolean),
      description: 'Whether the descriptor declares a config form. Rendering it is #64.',
    },
  },
});
