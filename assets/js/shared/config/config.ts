/**
 * What a standalone tool would have read from a JSON island in its own page. This section has no page
 * of its own, so the values arrive from the `config` root field on its own schema — see
 * `../app-settings/docs/extensions/docs.md` § Data.
 */
export type Config = {
  /** This application, not the shell hosting it. */
  appId: string;
  appVersion: string;
  /**
   * Holds `system.admin`. Only such a caller manages ID providers, creates a role in the `system.` or
   * `cms.` namespace, or changes a principal that holds `system.admin` (enonic/xp#12615).
   */
  administrator: boolean;
  /** The admin events hub api; `client.js` under it is the client to import. */
  eventsUrl: string;
  /** Neither `system.admin` nor `system.user.admin`: XP refuses every write, so none is offered. */
  readOnlyMode: boolean;
  /** The user this section runs as; what keeps an administrator from locking themselves out. */
  userKey: string | null;
};
