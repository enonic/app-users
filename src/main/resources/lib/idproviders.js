var common = require('./common');
var authLib = require('./auth');

module.exports = {
    getByKey: function(key) {
        return authLib.getIdProvider({key: key});
    },
    list: authLib.getIdProviders,
    getDefault: function () {
        return {key: 'default'};
    },
    create: function(params) {
        var name = common.required(params, 'key');

        return authLib.createIdProvider({
            name: common.prettifyName(name),
            displayName: params.displayName,
            description: params.description,
            idProviderConfig: params.idProviderConfig,
            permissions: params.permissions || []
        });
    },
    update: function(params) {
        var key = common.required(params, 'key');

        return authLib.modifyIdProvider({
            key: key,
            editor: function (idProvider) {
                var newIdProvider = idProvider;
                newIdProvider.displayName = params.displayName;
                newIdProvider.description = params.description;
                newIdProvider.idProviderConfig = params.idProviderConfig;
                return newIdProvider;
            },
            permissions: params.permissions || []
        });
    },
    delete: function(keys) {
        return authLib.deleteIdProviders({keys: keys});
    },
    getIdProviderMode: function(applicationKey) {
        return authLib.getIdProviderMode({key:applicationKey});
    },
    getPermissions: function (key) {
        return authLib.getPermissions({key: key});
    }
};
