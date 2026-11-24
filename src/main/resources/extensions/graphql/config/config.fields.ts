import type { GraphQLFields } from '/lib/graphql';
import { apiUrl } from '/lib/xp/portal';

import { isAdministratorCaller } from '../auth/administrator';
import { callerKey } from '../auth/caller';
import { isReadOnlyCaller } from '../auth/read-only';
import { ConfigType } from './config.types';

export const configQueryFields: GraphQLFields = {
  config: {
    type: ConfigType,
    description: "The section's own configuration, read in this application's context.",
    resolve: () => ({
      appId: app.name,
      appVersion: app.version,
      administrator: isAdministratorCaller(),
      // Resolved per request, so it carries the hosting tool's own prefix.
      eventsUrl: apiUrl({ api: 'admin:events' }),
      readOnlyMode: isReadOnlyCaller(),
      userKey: callerKey(),
    }),
  },
};
