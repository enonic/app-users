// @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
import {GraphQLString} from '/lib/graphql';
import {schemaGenerator} from '../../schemaUtil';
import {InterfaceTypeNames} from '/services/graphql/constants';


// When creating an ObjectType, it references which interfaces it's in.
// Either
// 1. The interface type must already be created
//    (which means it's already in the schema)
//    and it's javascript pointer can be used directly.
// Or
// 2. A graphql reference to a "future" type can be used,
//    but then one must remember to actually add the interfacetype later on.
//
// TypeResolvers must return actual ObjectTypes, not references.
// This object is populated after the ObjectTypes are created,
// so it's ready when the typeResolver is called.
export const typeResolverMap = {
    principalType: null,
    idProviderType: null
};

export const UserItemType = schemaGenerator.createInterfaceType({
    name: InterfaceTypeNames.UserItem,
    description: 'User item is a base entity for every principal or id provider',
    typeResolver: function (source) {
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
