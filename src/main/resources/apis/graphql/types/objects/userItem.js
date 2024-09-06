var graphQl = require('/lib/graphql');

var schemaGenerator = require('../../schemaUtil').schemaGenerator;

exports.typeResolverMap = {
    principalType: null,
    idProviderType: null
};

exports.UserItemType = schemaGenerator.createInterfaceType({
    name: 'UserItem',
    description: 'User item is a base entity for every principal or id provider',
    typeResolver: function(source) {
        return source.principalType
               ? exports.typeResolverMap.principalType
               : exports.typeResolverMap.idProviderType;
    },
    fields: {
        key: {
            type: graphQl.GraphQLString
        },
        name: {
            type: graphQl.GraphQLString
        },
        path: {
            type: graphQl.GraphQLString
        },
        displayName: {
            type: graphQl.GraphQLString
        },
        description: {
            type: graphQl.GraphQLString
        },
        modifiedTime: {
            type: graphQl.GraphQLString
        }
    }
});
