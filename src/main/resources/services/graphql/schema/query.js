var graphQl = require('/lib/graphql');
var authLib = require('/lib/auth');

var userstores = require('/lib/userstores');
var principals = require('/lib/principals');
var useritems = require('/lib/useritems');
var repositories = require('/lib/repositories');
var permissionReports = require('/lib/permissionReports');

var graphQlObjectTypes = require('../types').objects;
var graphQlEnums = require('../types').enums;

module.exports = graphQl.createObjectType({
    name: 'Query',
    fields: {
        userStores: {
            type: graphQl.list(graphQlObjectTypes.UserStoreType),
            resolve: function () {
                return userstores.list();
            }
        },
        userStore: {
            type: graphQlObjectTypes.UserStoreType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString)
            },
            resolve: function (env) {
                var key = env.args.key;
                return userstores.getByKey(key);
            }
        },
        defaultUserStore: {
            type: graphQlObjectTypes.UserStoreType,
            resolve: function () {
                return userstores.getDefault();
            }
        },
        principalsConnection: {
            type: graphQlObjectTypes.PrincipalConnectionType,
            args: {
                userstore: graphQl.GraphQLString,
                types: graphQl.list(graphQlEnums.PrincipalTypeEnum),
                query: graphQl.GraphQLString,
                start: graphQl.GraphQLInt,
                count: graphQl.GraphQLInt,
                sort: graphQlEnums.SortModeEnum
            },
            resolve: function (env) {
                var userstore = env.args.userstore || 'system';
                var types = env.args.types || principals.Type.all();
                var query = env.args.query;
                var start = env.args.start;
                var count = env.args.count;
                var sort = env.args.sort;
                return principals.list(
                    userstore,
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
                start: graphQl.GraphQLInt,
                count: graphQl.GraphQLInt
            },
            resolve: function (env) {
                var count = env.args.count || Number.MAX_SAFE_INTEGER;
                var start = env.args.start || 0;
                return useritems.list(start, count);
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
        },
        permissionReports: {
            type: graphQl.list(graphQlObjectTypes.PermissionReportType),
            args: {
                principalKey: graphQl.GraphQLString,
                repositoryIds: graphQl.list(graphQl.GraphQLString),
                start: graphQl.GraphQLInt,
                count: graphQl.GraphQLInt,
                sort: graphQlEnums.SortModeEnum
            },
            resolve: function (env) {
                if (!authLib.isAdmin()) {
                    throw new Error('You don\'t have permission to access this resource');
                }
                var principalKey = env.args.principalKey;
                var repositoryIds = env.args.repositoryIds;
                var start = env.args.start;
                var count = env.args.count;
                var sort = env.args.sort;
                return permissionReports.list(principalKey, repositoryIds, start, count, sort);
            }
        },
        permissionReport: {
            type: graphQlObjectTypes.PermissionReportType,
            args: {
                id: graphQl.GraphQLString,
            },
            resolve: function (env) {
                if (!authLib.isAdmin()) {
                    throw new Error('You don\'t have permission to access this resource');
                }
                var id = env.args.id;
                return permissionReports.get(id);
            }
        }
    }
});
