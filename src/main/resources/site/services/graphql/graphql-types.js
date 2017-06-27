var graphQl = require('/lib/graphql');
var graphQlEnums = require('./graphql-enums');
var graphQlConnection = require('./graphql-connection');
var util = require('./graphql-util');
var principals = require('principals');

var UserItemType = graphQl.createInterfaceType({
    name: 'UserItem',
    description: 'User item is a base entity for every principal or user store',
    fields: {
        id: {
            type: graphQl.GraphQLID,
            resolve: function (env) {
                return env.source._id;
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
        modifiedTime: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._timestamp;
            }
        }
    }
});

var AccessControlEntry = graphQl.createObjectType({
    name: 'AccessControlEntry',
    description: 'Domain representation of access control entry',
    fields: {
        principal: {
            type: graphQl.reference('Principal'),
            resolve: function (env) {
                return principals.getByKeys(env.source.principal);
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

exports.UserStoreAccessControlEntry = graphQl.createObjectType({
    name: 'UserStoreAccessControlEntry',
    description: 'Domain representation of user store access control entry',
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
        }
    }
});

var AuthConfig = graphQl.createObjectType({
    name: 'AuthConfig',
    description: 'Domain representation of auth config for user store',
    fields: {
        applicationKey: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.applicationKey;
            }
        },
        config: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                //TODO: config is not read from db yet, and there's no suitable graphql type for unstructured data
                return JSON.stringify([]);
            }
        }
    }
});

exports.UserStoreType = graphQl.createObjectType({
    name: 'UserStore',
    description: 'Domain representation of a user store',
    interfaces: [UserItemType],
    fields: {
        id: {
            type: graphQl.GraphQLID,
            resolve: function (env) {
                return env.source._id;
            }
        },
        key: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._name;
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
        authConfig: {
            type: AuthConfig,
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
        permissions: {
            type: graphQl.list(exports.UserStoreAccessControlEntry),
            resolve: function (env) {
                return env.source.access;
            }
        },
        modifiedTime: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._timestamp;
            }
        }
    }
});

exports.PrincipalType = graphQl.createObjectType({
    name: 'Principal',
    description: 'Domain representation of a principal',
    interfaces: [UserItemType],
    fields: {
        id: {
            type: graphQl.GraphQLID,
            resolve: function (env) {
                return env.source._id;
            }
        },
        key: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.key || env.source._id;
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
        principalType: {
            type: graphQlEnums.PrincipalTypeEnum,
            resolve: function (env) {
                return env.source.principalType;
            }
        },
        userStoreKey: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.userStoreKey;
            }
        },
        permissions: {
            type: graphQl.list(AccessControlEntry),
            resolve: function (env) {
                return env.source._permissions || [];
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
                return util.toArray(env.source.memberships);
            }
        },
        members: {
            type: graphQl.list(graphQl.GraphQLString),
            resolve: function (env) {
                return util.toArray(env.source.member);
            }
        },
        modifiedTime: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._timestamp;
            }
        }
    }
});

exports.PrincipalConnectionType = graphQlConnection.createConnectionType('PrincipalConnection', exports.PrincipalType);