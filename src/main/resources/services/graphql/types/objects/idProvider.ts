import {
    GraphQLBoolean,
    GraphQLString,
    list,
    reference
    // @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
} from '/lib/graphql';
import {
    IdProviderAccessEnum,
    IdProviderModeEnum
} from '../enums';
import {
    UserItemType,
    typeResolverMap
} from './userItem';
import {
    getIdProviderMode,
    getPermissions
} from '/lib/users/idproviders';
import {ObjectTypeNames} from '/services/graphql/constants';
import {schemaGenerator} from '../../schemaUtil';


const IdProviderAccessControlEntryType = schemaGenerator.createObjectType({
    name: ObjectTypeNames.IdProviderAccessControlEntry,
    description: 'Domain representation of id provider access control entry',
    fields: {
        principal: {
            type: reference(ObjectTypeNames.Principal)
        },
        access: {
            type: IdProviderAccessEnum
        }
    }
});

export const IdProviderConfig = schemaGenerator.createObjectType({
    name: ObjectTypeNames.IdProviderConfig,
    description: 'Domain representation of auth config for id provider',
    fields: {
        applicationKey: {
            type: GraphQLString
        },
        config: {
            type: GraphQLString,
            resolve: function (env) {
                return JSON.stringify(env.source.config);
                // TODO Create object type for property array
            }
        }
    }
});

export const IdProviderType = schemaGenerator.createObjectType({
    name: ObjectTypeNames.IdProvider,
    description: 'Domain representation of an id provider',
    interfaces: [UserItemType],
    // interfaces: [reference('UserItem')],
    fields: {
        key: {
            type: GraphQLString,
            resolve({source}) {
                return source.key || source._name;
            }
        },
        name: {
            type: GraphQLString,
            resolve({source}) {
                return source.key || source._name;
            }
        },
        path: {
            type: GraphQLString,
            resolve({source}) {
                return '/identity/' + (source.key || source._name);
            }
        },
        displayName: {
            type: GraphQLString
        },
        description: {
            type: GraphQLString
        },
        idProviderConfig: {
            type: IdProviderConfig
        },
        idProviderMode: {
            type: IdProviderModeEnum,
            resolve({source}) {
                let idProviderKey =
                    source.idProviderConfig &&
                    source.idProviderConfig.applicationKey;
                return idProviderKey
                       ? getIdProviderMode(idProviderKey)
                       : null;
            }
        },
        permissions: {
            type: list(IdProviderAccessControlEntryType),
            resolve({source}) {
                return getPermissions(source.key);
            }
        },
        modifiedTime: {
            type: GraphQLString,
            resolve({source}) {
                return source._timestamp;
            }
        }
    }
});

// NOTE: This populates the typeResolverMap which is used inside the UserItem typeResolver
typeResolverMap.idProviderType = IdProviderType;

export const IdProviderDeleteType = schemaGenerator.createObjectType({
    name: ObjectTypeNames.IdProviderDelete,
    description: 'Result of an idProvider delete operation',
    fields: {
        key: {
            type: GraphQLString,
            resolve({source}) {
                return source.idProviderKey;
            }
        },
        deleted: {
            type: GraphQLBoolean
        },
        reason: {
            type: GraphQLString
        }
    }
});
