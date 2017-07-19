var graphQl = require('/lib/graphql');

var principals = require('principals');

var graphQlEnums = require('../enums');
var graphQlUtils = require('../../utils');

var UserItemType = require('./userItem');

var PrincipalAccessControlEntryType = graphQl.createObjectType({
    name: 'PrincipalAccessControlEntry',
    description: 'Domain representation of access control entry',
    fields: {
        principal: {
            type: graphQl.reference('Principal'),
            resolve: function(env) {
                return principals.getByKeys(env.source.principal);
            }
        },
        allow: {
            type: graphQl.list(graphQlEnums.PermissionEnum),
            resolve: function(env) {
                return env.source.allow;
            }
        },
        deny: {
            type: graphQl.list(graphQlEnums.PermissionEnum),
            resolve: function(env) {
                return env.source.deny;
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
            resolve: function(env) {
                return env.source._id;
            }
        },
        key: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source.key || env.source._id;
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
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source.displayName;
            }
        },
        description: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source.description;
            }
        },
        principalType: {
            type: graphQlEnums.PrincipalTypeEnum,
            resolve: function(env) {
                return env.source.principalType;
            }
        },
        userStoreKey: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source.userStoreKey;
            }
        },
        permissions: {
            type: graphQl.list(PrincipalAccessControlEntryType),
            resolve: function(env) {
                return env.source._permissions || [];
            }
        },
        login: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source.login;
            }
        },
        email: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source.email;
            }
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
        },
        modifiedTime: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source._timestamp;
            }
        }
    }
});

exports.PrincipalDeleteType = graphQl.createObjectType({
    name: 'PrincipalDelete',
    description: 'Result of a principal delete operation',
    fields: {
        principalKey: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source.key;
            }
        },
        deleted: {
            type: graphQl.GraphQLBoolean,
            resolve: function(env) {
                return env.source.deleted;
            }
        },
        reason: {
            type: graphQl.GraphQLString,
            resolve: function(env) {
                return env.source.reason;
            }
        }
    }
});
