import {
    GraphQLString,
    nonNull
    // @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
} from '/lib/graphql';
import {InputTypeNames} from '../constants';
import {schemaGenerator} from '../schemaUtil';
import {IdProviderAccessEnum} from './enums';


// TODO: ASFAIK, not used anywhere?
// schemaGenerator.createInputObjectType({
//     name: InputTypeNames.PrincipalInput,
//     description: 'Input definition for principal',
//     fields: {
//         key: {
//             type: nonNull(GraphQLString)
//         },
//         displayName: {
//             type: nonNull(GraphQLString)
//         }
//     }
// });

export const IdProviderAccessControlInput = schemaGenerator.createInputObjectType({
    name: InputTypeNames.IdProviderAccessControlInput,
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
    name: InputTypeNames.IdProviderConfigInput,
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
