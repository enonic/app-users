import { GraphQLBoolean, GraphQLString, nonNull, type GraphQLType } from '/lib/graphql';

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
    admin: {
      type: nonNull(GraphQLBoolean),
      description:
        'Whether the visitor holds `role:system.admin`. A section is open to user administrators too, and the permission report is not theirs — this is what lets the UI leave it out rather than offer a button that answers 403.',
    },
  },
});
