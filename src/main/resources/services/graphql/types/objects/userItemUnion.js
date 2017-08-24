var graphQl = require('/lib/graphql');

var principals = require('principals');

var graphQlEnums = require('../enums');
var graphQlUtils = require('../../utils');

var UserItemType = require('./userItem');
var graphQlUserStore = require('./userStore');

var UserItemUnionAccessControlEntryType = graphQl.createObjectType({
    name: 'UserItemUnionAccessControlEntry',
    description: 'Domain representation of user item access control entry',
    fields: {
        principal: {
            type: graphQl.reference('Principal'),
            resolve: function(env) {
                return principals.getByKeys(env.source.principal);
            }
        },
        access: {
            type: graphQlEnums.UserStoreAccessEnum
        },
        allow: {
            type: graphQl.list(graphQlEnums.PermissionEnum)
        },
        deny: {
            type: graphQl.list(graphQlEnums.PermissionEnum)
        }
    }
});

exports.UserItemUnionType = graphQl.createObjectType({
    name: 'UserItemUnion',
    description: 'Combines all fields from Principal and UserStore',
    interfaces: [UserItemType],
    fields: {
        // common fields
        id: {
            type: graphQl.GraphQLID,
            resolve: function(env) {
                return env.source._id;
            }
        },
        key: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source.principalType
                    ? env.source.key || env.source._id
                    : env.source._name;
            }
        },
        name: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source._name;
            }
        },
        path: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source._path;
            }
        },
        displayName: {
            type: graphQl.GraphQLString
        },
        description: {
            type: graphQl.GraphQLString
        },
        permissions: {
            type: graphQl.list(UserItemUnionAccessControlEntryType),
            resolve: function(env) {
                return env.source.principalType
                    ? env.source._permissions || []
                    : env.source.access;
            }
        },
        modifiedTime: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source._timestamp;
            }
        },
        // user store
        authConfig: {
            type: graphQlUserStore.AuthConfig,
            resolve: function(env) {
                return env.source.idProvider;
            }
        },
        idProviderMode: {
            type: graphQlEnums.IdProviderModeEnum
        },
        // principal
        userStoreKey: {
            type: graphQl.GraphQLString
        },
        login: {
            type: graphQl.GraphQLString
        },
        email: {
            type: graphQl.GraphQLString
        },
        memberships: {
            type: graphQl.list(graphQl.reference('Principal')),
            resolve: function(env) {
                return graphQlUtils.toArray(env.source.memberships);
            }
        },
        members: {
            type: graphQl.list(graphQl.GraphQLString),
            resolve: function(env) {
                return graphQlUtils.toArray(env.source.member);
            }
        }
    }
});
