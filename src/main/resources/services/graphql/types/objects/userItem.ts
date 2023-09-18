// @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
import { GraphQLString } from '/lib/graphql';
import { schemaGenerator } from '../../schemaUtil';

import {IdProviderType} from './idProvider';
import {PrincipalType} from './principal';

export const typeResolverMap = {
    principalType: PrincipalType,
    idProviderType: IdProviderType
};

export const UserItemType = schemaGenerator.createInterfaceType({
    name: 'UserItem',
    description: 'User item is a base entity for every principal or id provider',
    typeResolver: function(source) {
        return source.principalType
               ? typeResolverMap.principalType
               : typeResolverMap.idProviderType;
    },
    fields: {
        key: {
            type: GraphQLString
        },
        name: {
            type: GraphQLString
        },
        path: {
            type: GraphQLString
        },
        displayName: {
            type: GraphQLString
        },
        description: {
            type: GraphQLString
        },
        modifiedTime: {
            type: GraphQLString
        }
    }
});
