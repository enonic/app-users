var graphQl = require('/lib/graphql');

var graphQlEnums = require('../enums');

var graphQlUserItem = require('./userItem');

var idprovidersLib = require('/lib/idproviders');

var schemaGenerator = require('../../schemaUtil').schemaGenerator;

var IdProviderAccessControlEntryType = schemaGenerator.createObjectType({
    name: 'IdProviderAccessControlEntry',
    description: 'Domain representation of id provider access control entry',
    fields: {
        principal: {
            type: graphQl.reference('Principal')
        },
        access: {
            type: graphQlEnums.IdProviderAccessEnum
        }
    }
});

exports.IdProviderConfig = schemaGenerator.createObjectType({
    name: 'IdProviderConfig',
    description: 'Domain representation of auth config for id provider',
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

exports.IdProviderType = schemaGenerator.createObjectType({
    name: 'IdProvider',
    description: 'Domain representation of an id provider',
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
                       ? idprovidersLib.getIdProviderMode(idProviderKey)
                       : null;
            }
        },
        permissions: {
            type: graphQl.list(IdProviderAccessControlEntryType),
            resolve: function(env) {
                return idprovidersLib.getPermissions(env.source.key);
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
graphQlUserItem.typeResolverMap.idProviderType = exports.IdProviderType;

exports.IdProviderDeleteType = schemaGenerator.createObjectType({
    name: 'IdProviderDelete',
    description: 'Result of an idProvider delete operation',
    fields: {
        key: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.idProviderKey;
            }
        },
        deleted: {
            type: graphQl.GraphQLBoolean
        },
        reason: {
            type: graphQl.GraphQLString
        }
    }
});
