/**
 * Created  on 15.09.2017.
 */
module.exports = Object.freeze({
    //waitForTimeout
    mediumTimeout: 3500,
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
    USER_WAS_CREATED_MESSAGE: 'User was created',
    ROLE_WAS_CREATED_MESSAGE: 'Role was created',
    GROUP_WAS_CREATED: 'Group was created',
    PROVIDER_CREATED_NOTIFICATION: 'Id provider was created',
    STANDARD_ID_PROVIDER: 'Standard ID Provider',

    PASSWORD: {
        MEDIUM: "password123",
        STRONG: "password123=",
        WEAK: "1q2w3e",
        WITH_SPACES: " password123 "
    },
    PASSWORD_STATE: {
        MEDIUM: "Medium",
        STRONG: "Strong",
        WEAK: "Weak",
        EXCELLENT: "Excellent",
        BAD: "Bad"
    },
    roles: {
        CM_ADMIN: 'Content Manager Administrator',
        ADMIN_CONSOLE: 'Administration Console Login',
        CM_APP: 'Content Manager App',
        ADMINISTRATOR: 'Administrator',
        USERS_APP: 'Users App',
        AUTHENTICATED: 'Authenticated',
        USERS_ADMINISTRATOR: 'Users Administrator',
        EVERYONE: 'Everyone'
    },
    principalExistsMessage: function (displayName) {
        return `Principal [${displayName}] could not be created. A principal with that name already exists`
    },
    groupDeletedMessage: function (displayName) {
        return `Principal "group:system:${displayName}" is deleted`
    },
    roleDeletedMessage: function (displayName) {
        return `Principal "role:${displayName}" is deleted`
    },
    userDeletedMessage: function (displayName) {
        return `Principal "user:system:${displayName}" is deleted`
    },
    storeDeletedMessage: function (displayName) {
        return `Id Provider "${displayName}" is deleted`
    },

});
