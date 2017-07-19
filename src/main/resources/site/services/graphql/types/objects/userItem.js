var graphQl = require('/lib/graphql');

module.exports = graphQl.createInterfaceType({
    name: 'UserItem',
    description: 'User item is a base entity for every principal or user store',
    fields: {
        id: {
            type: graphQl.GraphQLID,
            resolve: function (env) {
                return env.source._id;
            }
        },
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
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.displayName;
            }
        },
        description: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.description;
            }
        },
        modifiedTime: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._timestamp;
            }
        }
    }
});
