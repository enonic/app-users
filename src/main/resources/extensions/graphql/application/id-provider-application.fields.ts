import { list, nonNull, type GraphQLFields } from '/lib/graphql';

import { listIdProviderApplications } from './id-provider-application.source';
import { IdProviderApplicationType } from './id-provider-application.types';

export const idProviderApplicationQueryFields: GraphQLFields = {
  idProviderApplications: {
    type: list(nonNull(IdProviderApplicationType)),
    description:
      'Applications that ship an id provider descriptor, i.e. those a provider can be bound to.',
    resolve: () => listIdProviderApplications(),
  },
};
