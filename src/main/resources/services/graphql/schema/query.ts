import type {QueryNodeParams} from '/lib/xp/node';


import {
    GraphQLInt,
    // Json as GraphQLJson,
    GraphQLString,
    list,
    nonNull
    // @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
} from '/lib/graphql';
import {isAdmin} from '/lib/auth';
import {UserItemType} from '/lib/common';
import {
    getByKey,
    getDefault,
    list as listIdProviders
} from '/lib/idproviders';
import {
    getByKeys as getPrincipalsByKeys,
    list as listPrincipals,
    Type
} from '/lib/principals';
import {list as listUserItems} from '/lib/useritems';
import {
    getById as getRepositoryById,
    list as listRepositories
} from '/lib/repositories';
import {ObjectTypeNames} from '../constants';
import {schemaGenerator} from '../schemaUtil';
import {TypesType} from '../types/objects/types';
import {
    PrincipalTypeEnum,
    SortModeEnum,
    UserItemTypeEnum
} from '../types/enums';
import {
    IdProviderType,
    PrincipalConnectionType,
    PrincipalType,
    RepositoryType,
    UserItemConnectionType
} from '../types/objects';


function getUserItems({
    count = 0,
    start = 0,
    query,
    itemIds
}: {
    // Required
    itemIds: string[]
    // Optional
    count?: QueryNodeParams['count']
    query?: string
    start?: QueryNodeParams['start']
}, types?: UserItemType[]) {
    return listUserItems(types, query, itemIds, start, count);
}

const query = schemaGenerator.createObjectType({
    name: ObjectTypeNames.Query,
    fields: {
        idProviders: {
            type: list(IdProviderType),
            resolve() {
                return listIdProviders();
            }
        },
        idProvider: {
            type: IdProviderType,
            args: {
                key: nonNull(GraphQLString)
            },
            resolve(env) {
                let key = env.args.key;
                return getByKey(key);
            }
        },
        defaultIdProvider: {
            type: IdProviderType,
            resolve() {
                return getDefault();
            }
        },
        principalsConnection: {
            type: PrincipalConnectionType,
            args: {
                idprovider: GraphQLString,
                types: list(PrincipalTypeEnum),
                query: GraphQLString,
                start: GraphQLInt,
                count: GraphQLInt,
                sort: GraphQLString
            },
            resolve(env) {
                let idprovider = env.args.idprovider || 'system';
                let types = env.args.types || Type.all();
                let query = env.args.query;
                let start = env.args.start;
                let count = env.args.count;
                let sort = env.args.sort;
                return listPrincipals(
                    idprovider,
                    types,
                    query,
                    start,
                    count,
                    sort
                );
            }
        },
        principal: {
            type: PrincipalType,
            args: {
                key: nonNull(GraphQLString),
            },
            resolve(env) {
                let key = env.args.key;
                return getPrincipalsByKeys(key);
            }
        },
        principals: {
            type: list(PrincipalType),
            args: {
                keys: nonNull(list(GraphQLString))
            },
            resolve(env) {
                let keys = env.args.keys;
                return getPrincipalsByKeys(keys);
            }
        },
        userItemsConnection: {
            type: UserItemConnectionType,
            args: {
                types: list(UserItemTypeEnum),
                query: GraphQLString,
                itemIds: list(GraphQLString),
                start: GraphQLInt,
                count: GraphQLInt
            },
            resolve(env) {
                return getUserItems(env.args, env.args.types);
            }
        },
        repository: {
            type: RepositoryType,
            args: {
                id: nonNull(GraphQLString)
            },
            resolve(env) {
                if (!isAdmin()) {
                    throw new Error('You don\'t have permission to access this resource');
                }
                let id = env.args.id;
                return getRepositoryById(id);
            }
        },
        repositories: {
            type: list(RepositoryType),
            args: {
                query: GraphQLString,
                start: GraphQLInt,
                count: GraphQLInt,
                sort: SortModeEnum
            },
            resolve(env) {
                if (!isAdmin()) {
                    throw new Error('You don\'t have permission to access this resource');
                }
                let query = env.args.query;
                let start = env.args.start;
                let count = env.args.count;
                let sort = env.args.sort;
                return listRepositories(query, start, count, sort);
            }
        },
        types: {
            type: TypesType,
            args: {
                query: GraphQLString,
                itemIds: list(GraphQLString),
                start: GraphQLInt,
                count: GraphQLInt
            },
            resolve({args}) {
                return getUserItems(args, null);
            }
        },
    }
});
export default query;
