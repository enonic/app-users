/**
 * What a standalone tool would have read from a JSON island in its own page. This section has no page
 * of its own, so the values arrive from the `config` root field on its own schema — see
 * `../app-settings/docs/extensions/docs.md` § Data.
 */
export type Config = {
  /** This application, not the shell hosting it. */
  appId: string;
  appVersion: string;
  /** The admin events hub api; `client.js` under it is the client to import. */
  eventsUrl: string;
  /**
   * Whether the visitor holds `role:system.admin`. A section is open to user administrators too, and
   * the permission report is not theirs — this is what lets the panel leave the section out rather
   * than offer a button that answers 403.
   */
  admin: boolean;
};
