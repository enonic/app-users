import type { GraphQLFields } from '/lib/graphql';
import { hasRole } from '/lib/xp/auth';
import { apiUrl } from '/lib/xp/portal';

import { ConfigType } from './config.types';

const SYSTEM_ADMIN = 'role:system.admin';

export const configQueryFields: GraphQLFields = {
  config: {
    type: ConfigType,
    description: "The section's own configuration, read in this application's context.",
    resolve: () => ({
      appId: app.name,
      appVersion: app.version,
      // Resolved per request, so it carries the hosting tool's own prefix.
      eventsUrl: apiUrl({ api: 'admin:events' }),
      admin: hasRole(SYSTEM_ADMIN),
    }),
  },
};
