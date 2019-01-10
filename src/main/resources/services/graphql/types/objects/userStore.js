var graphQl = require('/lib/graphql');

var graphQlEnums = require('../enums');

var graphQlUserItem = require('./userItem');

var userstoresLib = require('/lib/userstores');

var IdProviderAccessControlEntryType = graphQl.createObjectType({
    name: 'IdProviderAccessControlEntry',
    description: 'Domain representation of user store access control entry',
    fields: {
        principal: {
            type: graphQl.reference('Principal')
        },
        access: {
            type: graphQlEnums.IdProviderAccessEnum
        }
    }
});

exports.IdProviderConfig = graphQl.createObjectType({
    name: 'IdProviderConfig',
    description: 'Domain representation of auth config for user store',
    fields: {
        applicationKey: {
            type: graphQl.GraphQLString
        },
        config: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return JSON.stringify(env.source.config);
                // TODO Create object type for property array
            }
        }
    }
});

exports.idProviderType = graphQl.createObjectType({
    name: 'IdProvider',
    description: 'Domain representation of a user store',
    interfaces: [graphQlUserItem.UserItemType],
    fields: {
        key: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source.key || env.source._name;
            }
        },
        name: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source.key || env.source._name;
            }
        },
        path: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return '/identity/' + (env.source.key || env.source._name);
            }
        },
        displayName: {
            type: graphQl.GraphQLString
        },
        description: {
            type: graphQl.GraphQLString
        },
        idProviderConfig: {
            type: exports.IdProviderConfig
        },
        idProviderMode: {
            type: graphQlEnums.IdProviderModeEnum,
            resolve: function(env) {
                var idProviderKey =
                    env.source.idProviderConfig &&
                    env.source.idProviderConfig.applicationKey;
                return idProviderKey
                    ? userstoresLib.getIdProviderMode(idProviderKey)
                    : null;
            }
        },
        permissions: {
            type: graphQl.list(IdProviderAccessControlEntryType),
            resolve: function(env) {
                return userstoresLib.getPermissions(env.source.key);
            }
        },
        modifiedTime: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source._timestamp;
            }
        }
    }
});
graphQlUserItem.typeResolverMap.idProviderType = exports.idProviderType;

exports.idProviderDeleteType = graphQl.createObjectType({
    name: 'idProviderDelete',
    description: 'Result of a idProvider delete operation',
    fields: {
        idProviderKey: {
            type: graphQl.GraphQLString
        },
        deleted: {
            type: graphQl.GraphQLBoolean
        },
        reason: {
            type: graphQl.GraphQLString
        }
    }
});
