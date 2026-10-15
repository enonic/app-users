import { GraphQLString, Json, list, nonNull, type GraphQLFields } from '/lib/graphql';

import { idProviderFormOf, listIdProviderApplications } from './id-provider-application.source';
import { IdProviderApplicationType } from './id-provider-application.types';

export const idProviderApplicationQueryFields: GraphQLFields = {
  idProviderApplications: {
    type: list(nonNull(IdProviderApplicationType)),
    description:
      'Applications that ship an id provider descriptor, i.e. those a provider can be bound to.',
    resolve: () => listIdProviderApplications(),
  },
  idProviderForm: {
    type: Json,
    description:
      "The config form an application declares for the providers bound to it, as XP's `formItemType` dialect, labels in the locale asked for. Null when the application is not an id provider.",
    args: {
      application: nonNull(GraphQLString),
      locale: GraphQLString,
    },
    resolve: (env: { args: { application: string; locale?: string } }) =>
      idProviderFormOf(env.args.application, env.args.locale ?? undefined),
  },
};
