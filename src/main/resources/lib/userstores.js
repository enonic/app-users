var common = require('./common');
var authLib = require('./auth');

var DEFAULT_KEY = 'default';

module.exports = {
    getByKey: function(key) {
        return authLib.getUserStore({key : key});
    },
    list: authLib.getUserStores,
    getDefault: function () {
        return {key: 'default'};
    },
    create: function(params) {
        var name = common.required(params, 'key');

        return authLib.createUserStore({
            name: common.prettifyName(name),
            displayName: params.displayName,
            description: params.description,
            authConfig: params.authConfig,
            permissions: params.permissions
        });
    },
    update: function(params) {
        var key = common.required(params, 'key');

        return authLib.modifyUserStore({
            key: key,
            editor: function (userStore) {
                var newUserStore = userStore;
                newUserStore.displayName = params.displayName;
                newUserStore.description = params.description;
                newUserStore.authConfig = params.authConfig;
                return newUserStore;
            },
            permissions: params.permissions || []
        });
    },
    delete: function(keys) {
        return authLib.deleteUserStores({keys: keys});
    },
    getIdProviderMode: function(applicationKey) {
        return authLib.getIdProviderMode({key:applicationKey});
    },
    getPermissions: function(key) {
        if (key === DEFAULT_KEY) {
            return authLib.defaultPermissions();
        }
        return authLib.getPermissions({key: key});
    }
};
