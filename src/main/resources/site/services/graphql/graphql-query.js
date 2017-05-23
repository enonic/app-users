var graphQl = require('/lib/graphql');
var userstores = require('userstores');
var principals = require('principals');
var graphQlObjectTypes = require('./graphql-types');
var graphQlEnums = require('./graphql-enums');

exports.query = graphQl.createObjectType({
    name: 'Query',
    fields: {
        userStores: {
            type: graphQl.list(graphQlObjectTypes.UserStoreType),
            args: {
                start: graphQl.GraphQLInt,
                count: graphQl.GraphQLInt,
                sort: graphQlEnums.SortModeEnum
            },
            resolve: function (env) {
                var start = env.args.start;
                var count = env.args.count;
                var sort = env.args.sort;
                return userstores.list(start, count, sort).hits.filter(function (hit) {
                    return hit._name != 'roles';
                });
            }
        },
        userStore: {
            type: graphQlObjectTypes.UserStoreType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString)
            },
            resolve: function (env) {
                graphQl.required(env.args, 'key');
                var key = env.args.key;
                return userstores.getByIds(key);
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
                var types = env.args.types || [principals.Type.USER, principals.Type.GROUP, principals.Type.ROLE];
                var query = env.args.query;
                var start = env.args.start;
                var count = env.args.count;
                var sort = env.args.sort;
                return principals.list(userstore, types, query, start, count, sort);
            }
        },
        principal: {
            type: graphQlObjectTypes.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString)
            },
            resolve: function (env) {
                graphQl.required(env.args, 'key');
                var key = env.args.key;
                return principals.getByIds(key);
            }
        },
    }
});