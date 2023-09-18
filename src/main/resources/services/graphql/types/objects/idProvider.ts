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
// import { UserItemType } from './userItem';
import {
    getIdProviderMode,
    getPermissions
} from '/lib/idproviders';
import { schemaGenerator } from '../../schemaUtil';


var IdProviderAccessControlEntryType = schemaGenerator.createObjectType({
    name: 'IdProviderAccessControlEntry',
    description: 'Domain representation of id provider access control entry',
    fields: {
        principal: {
            type: reference('Principal')
        },
        access: {
            type: IdProviderAccessEnum
        }
    }
});

export const IdProviderConfig = schemaGenerator.createObjectType({
    name: 'IdProviderConfig',
    description: 'Domain representation of auth config for id provider',
    fields: {
        applicationKey: {
            type: GraphQLString
        },
        config: {
            type: GraphQLString,
            resolve: function(env) {
                return JSON.stringify(env.source.config);
                // TODO Create object type for property array
            }
        }
    }
});

export const IdProviderType = schemaGenerator.createObjectType({
    name: 'IdProvider',
    description: 'Domain representation of an id provider',
    // interfaces: [UserItemType],
    // interfaces: [reference('UserItem')],
    fields: {
        key: {
            type: GraphQLString,
            resolve: function(env) {
                return env.source.key || env.source._name;
            }
        },
        name: {
            type: GraphQLString,
            resolve: function(env) {
                return env.source.key || env.source._name;
            }
        },
        path: {
            type: GraphQLString,
            resolve: function(env) {
                return '/identity/' + (env.source.key || env.source._name);
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
            resolve: function(env) {
                var idProviderKey =
                    env.source.idProviderConfig &&
                    env.source.idProviderConfig.applicationKey;
                return idProviderKey
                       ? getIdProviderMode(idProviderKey)
                       : null;
            }
        },
        permissions: {
            type: list(IdProviderAccessControlEntryType),
            resolve: function(env) {
                return getPermissions(env.source.key);
            }
        },
        modifiedTime: {
            type: GraphQLString,
            resolve: function(env) {
                return env.source._timestamp;
            }
        }
    }
});

// NOTE: This populates the typeResolverMap which is used inside the UserItem typeResolver
// graphQlUserItem.typeResolverMap.idProviderType = IdProviderType;

export const IdProviderDeleteType = schemaGenerator.createObjectType({
    name: 'IdProviderDelete',
    description: 'Result of an idProvider delete operation',
    fields: {
        key: {
            type: GraphQLString,
            resolve: function (env) {
                return env.source.idProviderKey;
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
