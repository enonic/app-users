var graphQl = require('/lib/graphql');
var authLib = require('/lib/auth');

var idproviders = require('/lib/idproviders');
var principals = require('/lib/principals');
var useritems = require('/lib/useritems');
var repositories = require('/lib/repositories');

var graphQlObjectTypes = require('../types').objects;
var graphQlEnums = require('../types').enums;


module.exports = graphQl.createObjectType({
    name: 'Query',
    fields: {
        idProviders: {
            type: graphQl.list(graphQlObjectTypes.IdProviderType),
            resolve: function () {
                return idproviders.list();
            }
        },
        idProvider: {
            type: graphQlObjectTypes.IdProviderType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString)
            },
            resolve: function (env) {
                var key = env.args.key;
                return idproviders.getByKey(key);
            }
        },
        defaultIdProvider: {
            type: graphQlObjectTypes.IdProviderType,
            resolve: function () {
                return idproviders.getDefault();
            }
        },
        principalsConnection: {
            type: graphQlObjectTypes.PrincipalConnectionType,
            args: {
                idprovider: graphQl.GraphQLString,
                types: graphQl.list(graphQlEnums.PrincipalTypeEnum),
                query: graphQl.GraphQLString,
                start: graphQl.GraphQLInt,
                count: graphQl.GraphQLInt,
                sort: graphQlEnums.SortModeEnum
            },
            resolve: function (env) {
                var idprovider = env.args.idprovider || 'system';
                var types = env.args.types || principals.Type.all();
                var query = env.args.query;
                var start = env.args.start;
                var count = env.args.count;
                var sort = env.args.sort;
                return principals.list(
                    idprovider,
                    types,
                    query,
                    start,
                    count,
                    sort
                );
            }
        },
        principal: {
            type: graphQlObjectTypes.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
            },
            resolve: function (env) {
                var key = env.args.key;
                return principals.getByKeys(key);
            }
        },
        principals: {
            type: graphQl.list(graphQlObjectTypes.PrincipalType),
            args: {
                keys: graphQl.nonNull(graphQl.list(graphQl.GraphQLString))
            },
            resolve: function (env) {
                var keys = env.args.keys;
                if (keys.length >= 100) {
                    throw new Error(
                        'Invalid field argument keys: The number of keys must be inferior to 100'
                    );
                }
                return principals.getByKeys(keys);
            }
        },
        userItemsConnection: {
            type: graphQlObjectTypes.UserItemConnectionType,
            args: {
                types: graphQl.list(graphQlEnums.UserItemTypeEnum),
                query: graphQl.GraphQLString,
                start: graphQl.GraphQLInt,
                count: graphQl.GraphQLInt
            },
            resolve: function (env) {
                var types = env.args.types;
                var query = env.args.query;
                var count = env.args.count || Number.MAX_SAFE_INTEGER;
                var start = env.args.start || 0;
                return useritems.list(types, query, start, count);
            }
        },
        types: {
            type: graphQlObjectTypes.TypesType,
            args: {
                query: graphQl.GraphQLString,
                start: graphQl.GraphQLInt,
                count: graphQl.GraphQLInt
            },
            resolve: function (env) {
                var query = env.args.query;
                var count = env.args.count || Number.MAX_SAFE_INTEGER;
                var start = env.args.start || 0;
                return useritems.list(null, query, start, count);
            }
        },
        repository: {
            type: graphQlObjectTypes.RepositoryType,
            args: {
                id: graphQl.nonNull(graphQl.GraphQLString)
            },
            resolve: function (env) {
                if (!authLib.isAdmin()) {
                    throw new Error('You don\'t have permission to access this resource');
                }
                var id = env.args.id;
                return repositories.getById(id);
            }
        },
        repositories: {
            type: graphQl.list(graphQlObjectTypes.RepositoryType),
            args: {
                query: graphQl.GraphQLString,
                start: graphQl.GraphQLInt,
                count: graphQl.GraphQLInt,
                sort: graphQlEnums.SortModeEnum
            },
            resolve: function (env) {
                if (!authLib.isAdmin()) {
                    throw new Error('You don\'t have permission to access this resource');
                }
                var query = env.args.query;
                var start = env.args.start;
                var count = env.args.count;
                var sort = env.args.sort;
                return repositories.list(query, start, count, sort);
            }
        }
    }
});
