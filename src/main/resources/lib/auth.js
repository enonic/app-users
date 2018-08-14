var authLib = require('/lib/xp/auth');

var Roles = {
    ADMIN: 'system.admin',
    EVERYONE: 'system.everyone',
    AUTHENTICATED: 'system.authenticated',
    ADMIN_LOGIN: 'system.admin.login',
    USER_MANAGER_APP: 'system.user.app',
    USER_MANAGER_ADMIN: 'system.user.admin',
    CONTENT_MANAGER_APP: 'cms.cm.app',
    CONTENT_MANAGER_EXPERT: 'cms.expert',
    CONTENT_MANAGER_ADMIN: 'cms.admin'
};

function required(params, name) {
    var value = params[name];
    if (value === undefined) {
        throw "Parameter '" + name + "' is required";
    }
    return value;
}

function nullOrValue(value) {
    return value == null ? null : value;
}

/**
 * Returns the user store for the specified key.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.key UserStore key.
 * @returns {object} the user store specified, or null if it doesn't exist.
 */
exports.getUserStore = function (params) {
    var bean = __.newBean('com.enonic.xp.app.users.lib.auth.GetUserStoreHandler');
    bean.userStoreKey = required(params, 'key');
    return __.toNativeObject(bean.getUserStore());
};

/**
 * Returns the list of all the user stores.
 *
 * @returns {object[]} Array of user stores.
 */
exports.getUserStores = function () {
    var bean = __.newBean('com.enonic.xp.app.users.lib.auth.GetUserStoresHandler');
    return __.toNativeObject(bean.getUserStores());
};

/**
 * Returns a string representation of the ID provider mode.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.key Application key of the ID Provider.
 * @returns {string} The ID provider mode.
 */
exports.getIdProviderMode = function (params) {
    var bean = __.newBean('com.enonic.xp.app.users.lib.auth.GetIdProviderModeHandler');
    bean.applicationKey = required(params, 'key');
    return bean.getIdProviderMode();
};

/**
 * Returns the user store permissions.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.key Key of the user store to fetch permissions for.
 * @returns {object[]} Returns the list of principals with access level.
 */
exports.getPermissions = function (params) {
    var bean = __.newBean('com.enonic.xp.app.users.lib.auth.GetPermissionsHandler');
    bean.userStoreKey = required(params, 'key');
    return __.toNativeObject(bean.getPermissions());
};

/**
 * Returns default user store permissions.
 *
 * @returns {object[]} Returns the list of principals with access level.
 */
exports.defaultPermissions = function () {
    var bean = __.newBean('com.enonic.xp.app.users.lib.auth.DefaultPermissionsHandler');
    return __.toNativeObject(bean.defaultPermissions());
};

/**
 * Creates a user store.
 *
 * @param {string} name User store name.
 * @param {string} [params.displayName] User store display name.
 * @param {string} [params.description] User store  description.
 * @param {object} [params.authConfig] ID Provider configuration.
 * @param {object} [params.permissions] User store permissions.
 */
exports.createUserStore = function (params) {
    var bean = __.newBean('com.enonic.xp.app.users.lib.auth.CreateUserStoreHandler');

    bean.name = required(params, 'name');
    bean.displayName = nullOrValue(params.displayName);
    bean.description = nullOrValue(params.description);
    bean.authConfig = __.toScriptValue(params.authConfig);
    bean.permissions = __.toScriptValue(params.permissions);

    return __.toNativeObject(bean.createUserStore());
};

/**
 * Update a user store.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.key Key of the user store to modify.
 * @param {function} params.editor User store editor function to apply.
 * @param {object} [params.permissions] User store permissions.
 * @returns {object} The updated user store.
 */
exports.modifyUserStore = function (params) {
    var bean = __.newBean('com.enonic.xp.app.users.lib.auth.ModifyUserStoreHandler');

    bean.userStoreKey = required(params, 'key');
    bean.editor = __.toScriptValue(required(params, 'editor'));
    bean.permissions = __.toScriptValue(params.permissions);

    return __.toNativeObject(bean.modifyUserStore());
};

/**
 * Delete the user store by the key.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.keys Array of user store keys to delete.
 * @returns {object} the user stores specified, or null if it doesn't exist.
 */
exports.deleteUserStores = function (params) {
    var bean = __.newBean('com.enonic.xp.app.users.lib.auth.DeleteUserStoresHandler');
    bean.userStoreKeys = __.toScriptValue(required(params, 'keys'));
    return __.toNativeObject(bean.deleteUserStores());
};

exports.isAdmin = function() {
    return authLib.hasRole(Roles.ADMIN);
};
