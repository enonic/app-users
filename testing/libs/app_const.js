/**
 * Created  on 15.09.2017.
 */
module.exports = Object.freeze({
    generateRandomName: function (part) {
        return part + Math.round(Math.random() * 1000000);
    },
    BROWSER_WIDTH: 1950,
    BROWSER_HEIGHT: 1050,
    //waitForTimeout
    loginPageTimeout: 1500,
    mediumTimeout: 4000,
    TIMEOUT_4: 4000,
    TIMEOUT_7: 7000,
    shortTimeout: 2000,
    TIMEOUT_1: 1000,
    TIMEOUT_SUITE: 180000,
    ID_PROVIDER: 'Id Provider',
    SYSTEM_ID_PROVIDER: 'System Id Provider',
    ROLE: 'Role',
    ROLES: 'Roles',
    GROUP: 'Group',
    USER: 'User',
    USER_GROUP: 'User Group',
    CREATE_NEW_HEADER: 'Create New',
    SUPER_USER_DISPLAY_NAME: 'Super User',
    SUPER_USER_NAME: 'su',
    ANONYMOUS_USER_DISPLAY_NAME: `Anonymous User`,
    ANONYMOUS_USER_NAME: `anonymous`,
    USER_WIZARD_PASS_MESSAGE: 'Password can not be empty.',
    USER_WIZARD_EMAIL_MESSAGE: 'Email can not be empty.',
    USER_WIZARD_EMAIL_IS_INVALID: 'Email is invalid.',

    STANDARD_ID_PROVIDER: 'Standard ID Provider',
    NOTIFICATION_MESSAGE: {
        PASSWORD_IS_SET: 'Password is set.',
        GROUP_WAS_CREATED: 'Group was created',
        PROVIDER_CREATED: 'Id provider was created',
        USER_WAS_CREATED: 'User was created',
        ROLE_WAS_CREATED: 'Role was created',
    },
    ID_PROVIDERS: {
        STANDARD_ID_PROVIDER: 'Standard ID Provider',
        APP_ADFS_PROVIDER: 'Test ADFS ID Provider',
        APP_OAUTH0_PROVIDER: 'Test Auth0 ID Provider',
        SYSTEM_ID_PROVIDER: 'System Id Provider',
    },

    PASSWORD: {
        MEDIUM: 'AUserA567$',
        STRONG: '1User%#567$=',
        WEAK: 'test12345',
        WITH_SPACES: ' userA567$ '
    },
    PASSWORD_STATE: {
        MEDIUM: 'Medium',
        STRONG: 'Strong',
        WEAK: 'Weak',
        EXCELLENT: 'Excellent',
        BAD: 'Bad'
    },
    ROLES_DISPLAY_NAME: {
        CM_ADMIN: 'Content Manager Administrator',
        ADMIN_CONSOLE: 'Administration Console Login',
        CM_APP: 'Content Manager App',
        ADMINISTRATOR: 'Administrator',
        USERS_APP: 'Users App',
        AUTHENTICATED: 'Authenticated',
        USERS_ADMINISTRATOR: 'Users Administrator',
        EVERYONE: 'Everyone'
    },
    ROLES_NAME: {
        CM_ADMIN: 'cms.admin',
        ADMINISTRATOR: 'system.admin',
        USERS_APP: 'system.user.admin',
    },
    BROWSER_TITLES: {
        CONTENT_STUDIO: 'Content Studio - Enonic XP Admin',
        XP_HOME: 'Enonic XP Home',
        USERS_APP: "Users - Enonic XP Admin",
    },
    principalExistsMessage(displayName) {
        return `Principal [${displayName}] could not be created. A principal with that name already exists`
    },
    groupDeletedMessage(displayName) {
        return `Principal "group:system:${displayName}" is deleted`
    },
    roleDeletedMessage(displayName) {
        return `Principal "role:${displayName}" is deleted`
    },
    userDeletedMessage(displayName) {
        return `Principal "user:system:${displayName}" is deleted`
    },
    providerDeletedMessage(displayName) {
        return `Id Provider "${displayName}" is deleted`
    },

});
