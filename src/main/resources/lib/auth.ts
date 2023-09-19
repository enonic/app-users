import {hasRole} from '/lib/xp/auth';

const Roles = {
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
    const value = params[name];
    if (value === undefined) {
        throw "Parameter '" + name + "' is required";
    }
    return value;
}

function nullOrValue(value) {
    return value == null ? null : value;
}

/**
 * Returns the id provider for the specified key.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.key IdProvider key.
 * @returns {object} the id provider specified, or null if it doesn't exist.
 */
export function getIdProvider(params) {
    const bean = __.newBean('com.enonic.xp.app.users.lib.auth.GetIdProviderHandler');
    bean.setIdProviderKey(required(params, 'key'));
    return __.toNativeObject(bean.getIdProvider());
}

/**
 * Returns the list of all the id providers.
 *
 * @returns {object[]} Array of id providers.
 */
export function getIdProviders() {
    let bean = __.newBean('com.enonic.xp.app.users.lib.auth.GetIdProvidersHandler');
    return __.toNativeObject(bean.getIdProviders());
}

/**
 * Returns a string representation of the ID provider mode.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.key Application key of the ID Provider application.
 * @returns {string} The ID provider mode.
 */
export function getIdProviderMode(params) {
    let bean = __.newBean('com.enonic.xp.app.users.lib.auth.GetIdProviderModeHandler');
    bean.setApplicationKey(required(params, 'key'));
    return bean.getIdProviderMode();
}

/**
 * Returns the id provider permissions.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.key Key of the id provider to fetch permissions for.
 * @returns {object[]} Returns the list of principals with access level.
 */
export function getPermissions(params) {
    let bean = __.newBean('com.enonic.xp.app.users.lib.auth.GetPermissionsHandler');
    bean.setIdProviderKey(required(params, 'key'));
    return __.toNativeObject(bean.getPermissions());
}

/**
 * Returns default id provider permissions.
 *
 * @returns {object[]} Returns the list of principals with access level.
 */
export function defaultPermissions() {
    let bean = __.newBean('com.enonic.xp.app.users.lib.auth.DefaultPermissionsHandler');
    return __.toNativeObject(bean.defaultPermissions());
}

/**
 * Creates an id provider.
 *
 * @param {string} name Id provider name.
 * @param {string} [params.displayName] Id provider display name.
 * @param {string} [params.description] Id provider  description.
 * @param {object} [params.idProviderConfig] ID Provider configuration.
 * @param {object} [params.permissions] Id provider permissions.
 */
export function createIdProvider(params) {
    let bean = __.newBean('com.enonic.xp.app.users.lib.auth.CreateIdProviderHandler');

    bean.setName(required(params, 'name'));
    bean.setDisplayName(nullOrValue(params.displayName));
    bean.setDescription(nullOrValue(params.description));
    bean.setIdProviderConfig(__.toScriptValue(params.idProviderConfig));
    bean.setPermissions(__.toScriptValue(params.permissions));

    return __.toNativeObject(bean.createIdProvider());
}

/**
 * Update an id provider.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.key Key of the id provider to modify.
 * @param {function} params.editor Id provider editor function to apply.
 * @param {object} [params.permissions] Id provider permissions.
 * @returns {object} The updated id provider.
 */
export function modifyIdProvider(params) {
    let bean = __.newBean('com.enonic.xp.app.users.lib.auth.ModifyIdProviderHandler');

    bean.setIdProviderKey(required(params, 'key'));
    bean.setEditor(__.toScriptValue(required(params, 'editor')));
    bean.setPermissions(__.toScriptValue(params.permissions));

    return __.toNativeObject(bean.modifyIdProvider());
}

/**
 * Delete the id provider by the key.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.keys Array of id provider keys to delete.
 * @returns {object} the id providers specified, or null if it doesn't exist.
 */
export function deleteIdProviders(params) {
    let bean = __.newBean('com.enonic.xp.app.users.lib.auth.DeleteIdProvidersHandler');
    bean.setIdProviderKeys(__.toScriptValue(required(params, 'keys')));
    return __.toNativeObject(bean.deleteIdProviders());
}

export function isAdmin() {
    return hasRole(Roles.ADMIN);
}
