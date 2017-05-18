var graphQl = require('/lib/graphql');
var graphQlEnums = require('./graphql-enums');

var UserItemType = graphQl.createInterfaceType({
    name: 'UserItem',
    description: 'User item is a base entity for every principal or user store. Contains key, displayName and description',
    fields: {
        key: {
            type: graphQl.GraphQLString,
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
        }
    }
});

exports.UserStoreType = graphQl.createObjectType({
    name: 'UserStore',
    description: 'Domain representation of a user store',
    interfaces: [UserItemType],
    fields: {
        key: {
            type: graphQl.GraphQLString,
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
                return env.source.description || '';
            }
        },
        authConfig: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._authConfig;
            }
        },
        idProviderMode: {
            type: graphQlEnums.IdProviderModeEnum,
            resolve: function (env) {
                return env.source.idProviderMode
            }
        },
        permissions: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._permissions;
            }
        }
    }
});

exports.PrincipalType = graphQl.createObjectType({
    name: 'Principal',
    description: 'Domain representation of a principal',
    interfaces: [UserItemType],
    fields: {
        key: {
            type: graphQl.GraphQLString,
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
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._permissions;
            }
        }
    }
});