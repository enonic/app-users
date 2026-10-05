module.exports = Object.freeze({
  SUITE_TIMEOUT: 180000,
  generateRandomName(part) {
    return part + Math.round(Math.random() * 1000000);
  },

  itemSavedNotificationMessage(name) {
    return `Item "${name}" has been saved.`;
  },

  BROWSER_XP_TITLES: {
    XP_HOME: 'Enonic XP Home',
  },
  NOTIFICATION_MESSAGES: {},
  TIMEOUT: {
    MEDIUM: 3000,
    LONG: 5000,
    SHORT: 2000,
  },

  PASSWORD: {
    MEDIUM: 'AUserA567$',
    STRONG: '1User%#567$=',
    WEAK: 'test12345',
  },

  BROWSER_WIDTH: 1950,
  BROWSER_HEIGHT: 1050,

  roleName: {
    ADMINISTRATOR: 'system.admin',
  },
  roleDisplayName: {
    CONTENT_MANAGER_APP: 'Content Manager App',
  },
  systemUsersDisplayName: {
    ANONYMOUS_USER: 'Anonymous User',
    EVERYONE: 'Everyone',
    SUPER_USER: 'Super User',
    ME: 'Me',
  },

  GRID_CONTEXT_MENU: {
    NEW: 'New',
    EDIT: 'Edit',
    DELETE: 'Delete',
    DUPLICATE: 'Duplicate',
    MOVE: 'Move',
    SORT: 'Sort',
  },
  SYSTEM_ROLES_NAME: {
    ADMINISTRATOR: 'roles/system.admin',
    AUDIT_LOG: 'roles/system.auditlog',
  },
  SYSTEM_ROLES: {
    CM_ADMIN: 'Content Manager Administrator',
    ADMIN_CONSOLE: 'Administration Console Login',
    CM_APP: 'Content Manager App',
    CM_APP_EXPERT: 'Content Manager Expert',
    ADMINISTRATOR: 'Administrator',
    USERS_APP: 'Users App',
    AUTHENTICATED: 'Authenticated',
    USERS_ADMINISTRATOR: 'Users Administrator',
    EVERYONE: 'Everyone',
    AUDIT_LOG: 'Audit Log',
  },
  EXTENSIONS: {
    APPLICATIONS: 'Applications',
    SERVICE_ACCOUNTS: 'Service Accounts',
    USERS: 'Users',
    GROUPS: 'Groups',
    ROLES: 'Roles',
    ID_PROVIDERS: 'ID Providers',
  },
  // Toasts of the editors (phrases: <section>.notify.*).
  userCreatedMessage: (displayName) => `User "${displayName}" created`,
  userUpdatedMessage: (displayName) => `User "${displayName}" updated`,
  groupCreatedMessage: (displayName) => `Group "${displayName}" created`,
  roleCreatedMessage: (displayName) => `Role "${displayName}" created`,
  idProviderCreatedMessage: (displayName) => `ID provider "${displayName}" created`,
  serviceAccountCreatedMessage: (displayName) => `Service account "${displayName}" created`,
  // One deleted principal (user, service account, group, role) and several (phrases: principal.notify.*).
  principalDeletedMessage: (displayName) => `"${displayName}" deleted`,
  principalsDeletedMessage: (count) => `${count} items deleted`,
  idProviderDeletedMessage: (displayName) => `"${displayName}" deleted`,
  // Access levels of the ID provider editor's Permissions step, widening (phrases:
  // idProviders.dialog.access.*).
  ID_PROVIDER_ACCESS: {
    READ: 'Read',
    CREATE_USERS: 'Create users',
    WRITE_USERS: 'Write users',
    ID_PROVIDER_MANAGER: 'ID provider manager',
    ADMINISTRATOR: 'Administrator',
  },
  // Items of the 'Sort by' menu in the browse list header (phrases: <section>.sort.*). Users and
  // Groups offer all four; Roles and ID Providers only the two by display name. Note the en dash.
  SORT_MENU_ITEM: {
    DISPLAY_NAME_ASC: 'Display name (A–Z)',
    DISPLAY_NAME_DESC: 'Display name (Z–A)',
    ID_PROVIDER_ASC: 'ID provider (A–Z)',
    ID_PROVIDER_DESC: 'ID provider (Z–A)',
  },
  // 'data-section' of the SectionMount that hosts the extension's shadow root
  SECTION_ID: {
    APPLICATIONS: 'com.enonic.xp.app.applications:applications',
    SERVICE_ACCOUNTS: 'com.enonic.xp.app.users:service-accounts',
    USERS: 'com.enonic.xp.app.users:users',
    GROUPS: 'com.enonic.xp.app.users:groups',
    ROLES: 'com.enonic.xp.app.users:roles',
    ID_PROVIDERS: 'com.enonic.xp.app.users:id-providers',
  },
});
