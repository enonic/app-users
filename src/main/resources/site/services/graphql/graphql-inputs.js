var graphQl = require('/lib/graphql');
var graphQlEnums = require('./graphql-enums');

var PrincipalInput = graphQl.createInputObjectType({
    name: 'PrincipalInput',
    description: 'Input definition for principal',
    fields: {
        key: {
            type: graphQl.nonNull(graphQl.GraphQLString)
        },
        displayName: {
            type: graphQl.nonNull(graphQl.GraphQLString)
        }
    }
});

exports.UserStoreAccessControlInput = graphQl.createInputObjectType({
    name: 'UserStoreAccessControlInput',
    description: 'Input definition for user store access control entry',
    fields: {
        principal: {
            type: graphQl.nonNull(PrincipalInput)
        },
        access: {
            type: graphQl.nonNull(graphQlEnums.UserStoreAccessEnum)
        }
    }
});

exports.AuthConfigInput = graphQl.createInputObjectType({
    name: 'AuthConfigInput',
    description: 'Input definition for user store auth config',
    fields: {
        applicationKey: {
            type: graphQl.nonNull(graphQl.GraphQLString)
        },
        config: {
            type: graphQl.GraphQLString
        }
    }
});