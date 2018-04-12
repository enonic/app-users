var graphQl = require('/lib/graphql');

var graphQlEnums = require('../enums');

var graphQlUserItem = require('./userItem');

var userstoresLib = require('/lib/userstores');

var UserStoreAccessControlEntryType = graphQl.createObjectType({
    name: 'UserStoreAccessControlEntry',
    description: 'Domain representation of user store access control entry',
    fields: {
        principal: {
            type: graphQl.reference('Principal')
        },
        access: {
            type: graphQlEnums.UserStoreAccessEnum
        }
    }
});

exports.AuthConfig = graphQl.createObjectType({
    name: 'AuthConfig',
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

exports.UserStoreType = graphQl.createObjectType({
    name: 'UserStore',
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
        authConfig: {
            type: exports.AuthConfig
        },
        idProviderMode: {
            type: graphQlEnums.IdProviderModeEnum,
            resolve: function(env) {
                var idProviderKey =
                    env.source.authConfig &&
                    env.source.authConfig.applicationKey;
                return idProviderKey
                    ? userstoresLib.getIdProviderMode(idProviderKey)
                    : null;
            }
        },
        permissions: {
            type: graphQl.list(UserStoreAccessControlEntryType),
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
graphQlUserItem.typeResolverMap.userStoreType = exports.UserStoreType;

exports.UserStoreDeleteType = graphQl.createObjectType({
    name: 'UserStoreDelete',
    description: 'Result of a userStore delete operation',
    fields: {
        userStoreKey: {
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
