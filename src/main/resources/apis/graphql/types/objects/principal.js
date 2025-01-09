var graphQl = require('/lib/graphql');

var principals = require('/lib/principals');

var schemaGenerator = require('../../schemaUtil').schemaGenerator;

var graphQlEnums = require('../enums');
var graphQlUtils = require('../../utils');

var graphQlUserItem = require('./userItem');
var utilLib = require('/lib/util');

exports.PublicKeyType = schemaGenerator.createObjectType({
    name: 'PublicKey',
    description: 'Public key for a user',
    fields: {
        kid: {
            type: graphQl.GraphQLString,
        },
        publicKey: {
            type: graphQl.GraphQLString,
        },
        label: {
            type: graphQl.GraphQLString,
        },
        creationTime: {
            type: graphQl.GraphQLString,
        }
    }
});

var PrincipalAccessControlEntryType = schemaGenerator.createObjectType({
    name: 'PrincipalAccessControlEntry',
    description: 'Domain representation of access control entry',
    fields: {
        principal: {
            type: graphQl.reference('Principal'),
            resolve: function (env) {
                return principals.getByKeys(env.source.principal);
            }
        },
        allow: {
            type: graphQl.list(graphQlEnums.PermissionEnum)
        },
        deny: {
            type: graphQl.list(graphQlEnums.PermissionEnum)
        }
    }
});

exports.PrincipalType = schemaGenerator.createObjectType({
    name: 'Principal',
    description: 'Domain representation of a principal',
    interfaces: [graphQlUserItem.UserItemType],
    fields: {
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
            type: graphQl.GraphQLString
        },
        description: {
            type: graphQl.GraphQLString
        },
        principalType: {
            type: graphQlEnums.PrincipalTypeEnum
        },
        idProviderKey: {
            type: graphQl.GraphQLString
        },
        permissions: {
            type: graphQl.list(PrincipalAccessControlEntryType),
            resolve: function (env) {
                return env.source._permissions || [];
            }
        },
        login: {
            type: graphQl.GraphQLString
        },
        email: {
            type: graphQl.GraphQLString
        },
        memberships: {
            type: graphQl.list(graphQl.reference('Principal')),
            args: {
                transitive: graphQl.GraphQLBoolean
            },
            resolve: function (env) {
                var key = env.source.key || env.source._id;
                var transitive = env.args.transitive;
                return graphQlUtils.toArray(principals.getMemberships(key, transitive));
            }
        },
        members: {
            type: graphQl.list(graphQl.GraphQLString),
            resolve: function (env) {
                return graphQlUtils.toArray(env.source.member);
            }
        },
        modifiedTime: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._timestamp;
            }
        },
        publicKeys: {
            type: graphQl.list(exports.PublicKeyType),
            resolve: function (env) {
                return env.source.profile ? utilLib.forceArray(env.source.profile.publicKeys) : [];
            }
        },
        hasPassword: {
            type: graphQl.GraphQLBoolean,
            resolve: function (env) {
                return env.source.authenticationHash != null;
            }
        }
    }
});
graphQlUserItem.typeResolverMap.principalType = exports.PrincipalType;

exports.PrincipalDeleteType = schemaGenerator.createObjectType({
    name: 'PrincipalDelete',
    description: 'Result of a principal delete operation',
    fields: {
        key: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.key;
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
