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
 * @param {string} params.key IdProvider key.
 * @returns {object} the user store specified, or null if it doesn't exist.
 */
exports.getIdProvider = function (params) {
    var bean = __.newBean('com.enonic.xp.app.users.lib.auth.GetIdProviderHandler');
    bean.idProviderKey = required(params, 'key');
    return __.toNativeObject(bean.getIdProvider());
};

/**
 * Returns the list of all the user stores.
 *
 * @returns {object[]} Array of user stores.
 */
exports.getIdProviders = function () {
    var bean = __.newBean('com.enonic.xp.app.users.lib.auth.GetIdProvidersHandler');
    return __.toNativeObject(bean.getIdProviders());
};

/**
 * Returns a string representation of the ID provider mode.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.key Application key of the ID Provider application.
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
    bean.idProviderKey = required(params, 'key');
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
 * @param {object} [params.idProviderConfig] ID Provider configuration.
 * @param {object} [params.permissions] User store permissions.
 */
exports.createIdProvider = function (params) {
    var bean = __.newBean('com.enonic.xp.app.users.lib.auth.CreateIdProviderHandler');

    bean.name = required(params, 'name');
    bean.displayName = nullOrValue(params.displayName);
    bean.description = nullOrValue(params.description);
    bean.idProviderConfig = __.toScriptValue(params.idProviderConfig);
    bean.permissions = __.toScriptValue(params.permissions);

    return __.toNativeObject(bean.createIdProvider());
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
exports.modifyIdProvider = function (params) {
    var bean = __.newBean('com.enonic.xp.app.users.lib.auth.ModifyIdProviderHandler');

    bean.idProviderKey = required(params, 'key');
    bean.editor = __.toScriptValue(required(params, 'editor'));
    bean.permissions = __.toScriptValue(params.permissions);

    return __.toNativeObject(bean.modifyIdProvider());
};

/**
 * Delete the user store by the key.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.keys Array of user store keys to delete.
 * @returns {object} the user stores specified, or null if it doesn't exist.
 */
exports.deleteIdProviders = function (params) {
    var bean = __.newBean('com.enonic.xp.app.users.lib.auth.DeleteIdProvidersHandler');
    bean.idProviderKeys = __.toScriptValue(required(params, 'keys'));
    return __.toNativeObject(bean.deleteIdProviders());
};

exports.isAdmin = function() {
    return authLib.hasRole(Roles.ADMIN);
};
