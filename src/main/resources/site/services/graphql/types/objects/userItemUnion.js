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
            resolve: function (env) {
                return principals.getByKeys(env.source.principal);
            }
        },
        access: {
            type: graphQlEnums.UserStoreAccessEnum,
            resolve: function (env) {
                return env.source.access;
            }
        },
        allow: {
            type: graphQl.list(graphQlEnums.PermissionEnum),
            resolve: function (env) {
                return env.source.allow;
            }
        },
        deny: {
            type: graphQl.list(graphQlEnums.PermissionEnum),
            resolve: function (env) {
                return env.source.deny;
            }
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
            resolve: function (env) {
                return env.source._id;
            }
        },
        key: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.principalType ? (env.source.key || env.source._id) : env.source._name;
            }
        },
        name: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._name;
            }
        },
        path: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._path;
            }
        },
        displayName: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.displayName;
            }
        },
        description: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.description;
            }
        },
        permissions: {
            type: graphQl.list(UserItemUnionAccessControlEntryType),
            resolve: function (env) {
                return env.source.principalType ? (env.source._permissions || []) : env.source.access;
            }
        },
        modifiedTime: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._timestamp;
            }
        },
        // user store
        authConfig: {
            type: graphQlUserStore.AuthConfig,
            resolve: function (env) {
                return env.source.idProvider;
            }
        },
        idProviderMode: {
            type: graphQlEnums.IdProviderModeEnum,
            resolve: function (env) {
                return env.source.idProviderMode;
            }
        },
        // principal
        userStoreKey: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.userStoreKey;
            }
        },
        login: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.login;
            }
        },
        email: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.email;
            }
        },
        memberships: {
            type: graphQl.list(graphQl.reference('Principal')),
            resolve: function (env) {
                return graphQlUtils.toArray(env.source.memberships);
            }
        },
        members: {
            type: graphQl.list(graphQl.GraphQLString),
            resolve: function (env) {
                return graphQlUtils.toArray(env.source.member);
            }
        }
    }
});
