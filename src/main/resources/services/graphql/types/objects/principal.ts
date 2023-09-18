import {
    GraphQLBoolean,
    GraphQLString,
    list,
    reference
    // @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
} from '/lib/graphql';

import {
    getByKeys,
    getMemberships
} from '/lib/principals';

import { schemaGenerator } from '../../schemaUtil';

import {
    PermissionEnum,
    PrincipalTypeEnum
} from '../enums';
import {toArray} from  '../../utils';

// import { UserItemType } from './userItem';
// @ts-expect-error Cannot find module '/lib/util' or its corresponding type declarations.ts(2307)
import { forceArray } from '/lib/util';


export const PublicKeyType = schemaGenerator.createObjectType({
    name: 'PublicKey',
    description: 'Public key for a user',
    fields: {
        kid: {
            type: GraphQLString,
        },
        publicKey: {
            type: GraphQLString,
        },
        label: {
            type: GraphQLString,
        },
        creationTime: {
            type: GraphQLString,
        }
    }
});

var PrincipalAccessControlEntryType = schemaGenerator.createObjectType({
    name: 'PrincipalAccessControlEntry',
    description: 'Domain representation of access control entry',
    fields: {
        principal: {
            type: reference('Principal'),
            resolve: function (env) {
                return getByKeys(env.source.principal);
            }
        },
        allow: {
            type: list(PermissionEnum)
        },
        deny: {
            type: list(PermissionEnum)
        }
    }
});

export const PrincipalType = schemaGenerator.createObjectType({
    name: 'Principal',
    description: 'Domain representation of a principal',
    // interfaces: [UserItemType],
    // interfaces: [reference('UserItem')], // TODO constant
    fields: {
        key: {
            type: GraphQLString,
            resolve: function (env) {
                return env.source.key || env.source._id;
            }
        },
        name: {
            type: GraphQLString,
            resolve: function (env) {
                return env.source._name;
            }
        },
        path: {
            type: GraphQLString,
            resolve: function (env) {
                return env.source._path;
            }
        },
        displayName: {
            type: GraphQLString
        },
        description: {
            type: GraphQLString
        },
        principalType: {
            type: PrincipalTypeEnum
        },
        idProviderKey: {
            type: GraphQLString
        },
        permissions: {
            type: list(PrincipalAccessControlEntryType),
            resolve: function (env) {
                return env.source._permissions || [];
            }
        },
        login: {
            type: GraphQLString
        },
        email: {
            type: GraphQLString
        },
        memberships: {
            type: list(reference('Principal')),
            args: {
                transitive: GraphQLBoolean
            },
            resolve: function (env) {
                var key = env.source.key || env.source._id;
                var transitive = env.args.transitive;
                return toArray(getMemberships(key, transitive));
            }
        },
        members: {
            type: list(GraphQLString),
            resolve: function (env) {
                return toArray(env.source.member);
            }
        },
        modifiedTime: {
            type: GraphQLString,
            resolve: function (env) {
                return env.source._timestamp;
            }
        },
        publicKeys: {
            type: list(PublicKeyType),
            resolve: function (env) {
                return env.source.profile ? forceArray(env.source.profile.publicKeys) : [];
            }
        }
    }
});

// NOTE: This populates the typeResolverMap which is used inside the UserItem typeResolver
// graphQlUserItem.typeResolverMap.principalType = exports.PrincipalType;

export const PrincipalDeleteType = schemaGenerator.createObjectType({
    name: 'PrincipalDelete',
    description: 'Result of a principal delete operation',
    fields: {
        key: {
            type: GraphQLString,
            resolve: function (env) {
                return env.source.key;
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
