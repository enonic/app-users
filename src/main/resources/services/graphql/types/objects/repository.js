var graphQl = require('/lib/graphql');
var graphQlUtils = require('../../utils');

exports.RepositoryType = graphQl.createObjectType({
    name: 'Repository',
    description: 'Domain representation of a repository',
    fields: {
        id: {
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
        branches: {
            type: graphQl.list(graphQl.GraphQLString),
            resolve: function (env) {
                return graphQlUtils.toArray(env.source.branches);
            }
        }
    }
});
