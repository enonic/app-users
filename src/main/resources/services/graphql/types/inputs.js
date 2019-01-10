var graphQl = require('/lib/graphql');

var graphQlEnums = require('./enums');

// eslint-disable-next-line no-unused-vars
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

exports.idProviderAccessControlInput = graphQl.createInputObjectType({
    name: 'idProviderAccessControlInput',
    description: 'Input definition for id provider access control entry',
    fields: {
        principal: {
            type: graphQl.nonNull(graphQl.GraphQLString)
        },
        access: {
            type: graphQl.nonNull(graphQlEnums.idProviderAccessEnum)
        }
    }
});

exports.IdProviderConfigInput = graphQl.createInputObjectType({
    name: 'IdProviderConfigInput',
    description: 'Input definition for id provider auth config',
    fields: {
        applicationKey: {
            type: graphQl.nonNull(graphQl.GraphQLString)
        },
        config: {
            type: graphQl.GraphQLString
        }
    }
});
