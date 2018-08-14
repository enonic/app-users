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
        principalDisplayName: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.principalDisplayName;
            }
        },
        repositoryId: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.repositoryId;
            }
        },
        taskId: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.taskId;
            }
        },
        finished: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.finished;
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
