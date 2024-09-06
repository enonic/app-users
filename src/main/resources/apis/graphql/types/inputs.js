var graphQl = require('/lib/graphql');

var schemaGenerator = require('../schemaUtil').schemaGenerator;

var graphQlEnums = require('./enums');

// eslint-disable-next-line no-unused-vars
var PrincipalInput = schemaGenerator.createInputObjectType({
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

exports.IdProviderAccessControlInput = schemaGenerator.createInputObjectType({
    name: 'IdProviderAccessControlInput',
    description: 'Input definition for id provider access control entry',
    fields: {
        principal: {
            type: graphQl.nonNull(graphQl.GraphQLString)
        },
        access: {
            type: graphQl.nonNull(graphQlEnums.IdProviderAccessEnum)
        }
    }
});

exports.IdProviderConfigInput = schemaGenerator.createInputObjectType({
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
