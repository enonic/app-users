var graphQl = require('/lib/graphql');

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
        }
    }
});
