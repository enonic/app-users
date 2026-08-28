import { GraphQLString, nonNull, type GraphQLType } from '/lib/graphql';

import { generator } from '../schema/generator';

/**
 * ? A root field rather than a JSON island: a section has no page of its own, so the only moment
 * ? this app's server code runs is a request to one of its own prefixes.
 */
export const ConfigType: GraphQLType = generator.createObjectType({
  name: 'Config',
  description: "Values a section needs from its own application's context.",
  fields: {
    appId: {
      type: nonNull(GraphQLString),
      description: 'This application, not the shell hosting it.',
    },
    appVersion: {
      type: nonNull(GraphQLString),
    },
    eventsUrl: {
      type: nonNull(GraphQLString),
      description: 'The admin events hub api; `client.js` under it is the client to import.',
    },
  },
});
