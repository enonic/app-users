var graphQl = require('/lib/graphql');
var portalLib = require('/lib/xp/portal');

exports.PermissionReportType = graphQl.createObjectType({
    name: 'PermissionReport',
    description: 'Domain representation of a permission report',
    fields: {
        id: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._id;
            }
        },
        principalKey: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.principalKey;
            }
        },
        repositoryId: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.repositoryId;
            }
        },
        url: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return portalLib.serviceUrl({
                    service: 'permissionReport',
                    params: {
                        id: env.source._id
                    }
                });
            }
        }
    }
});

exports.GeneratePermissionReportType = graphQl.createObjectType({
    name: 'GeneratePermissionReport',
    description: 'Result of generating permission reports',
    fields: {
        ids: {
            type: graphQl.list(graphQl.GraphQLString),
            resolve: function (env) {
                return env.source.ids;
            }
        }
    }
});
