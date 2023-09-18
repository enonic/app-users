import {
    GraphQLString,
    nonNull
    // @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
} from '/lib/graphql';
import { schemaGenerator } from '../schemaUtil';
import { IdProviderAccessEnum } from './enums';


// eslint-disable-next-line no-unused-vars
var PrincipalInput = schemaGenerator.createInputObjectType({
    name: 'PrincipalInput',
    description: 'Input definition for principal',
    fields: {
        key: {
            type: nonNull(GraphQLString)
        },
        displayName: {
            type: nonNull(GraphQLString)
        }
    }
});

export const IdProviderAccessControlInput = schemaGenerator.createInputObjectType({
    name: 'IdProviderAccessControlInput',
    description: 'Input definition for id provider access control entry',
    fields: {
        principal: {
            type: nonNull(GraphQLString)
        },
        access: {
            type: nonNull(IdProviderAccessEnum)
        }
    }
});

export const IdProviderConfigInput = schemaGenerator.createInputObjectType({
    name: 'IdProviderConfigInput',
    description: 'Input definition for id provider auth config',
    fields: {
        applicationKey: {
            type: nonNull(GraphQLString)
        },
        config: {
            type: GraphQLString
        }
    }
});
