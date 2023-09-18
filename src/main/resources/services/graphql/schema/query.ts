import {
    GraphQLInt,
    GraphQLString,
    list,
    nonNull
    // @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
} from '/lib/graphql';
import { isAdmin } from '/lib/auth';

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
import { schemaGenerator } from '../schemaUtil';
import * as TypesType from '../types';
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
} from '../types/objects'


function getUserItems(args, types) {
    var query = args.query;
    var itemIds = args.itemIds;
    var count = args.count || 0;
    var start = args.start || 0;
    return listUserItems(types, query, itemIds, start, count);
}

const query = schemaGenerator.createObjectType({
    name: 'Query',
    fields: {
        idProviders: {
            type: list(IdProviderType),
            resolve: function () {
                return listIdProviders();
            }
        },
        idProvider: {
            type: IdProviderType,
            args: {
                key: nonNull(GraphQLString)
            },
            resolve: function (env) {
                var key = env.args.key;
                return getByKey(key);
            }
        },
        defaultIdProvider: {
            type: IdProviderType,
            resolve: function () {
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
            resolve: function (env) {
                var idprovider = env.args.idprovider || 'system';
                var types = env.args.types || Type.all();
                var query = env.args.query;
                var start = env.args.start;
                var count = env.args.count;
                var sort = env.args.sort;
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
            resolve: function (env) {
                var key = env.args.key;
                return getPrincipalsByKeys(key);
            }
        },
        principals: {
            type: list(PrincipalType),
            args: {
                keys: nonNull(list(GraphQLString))
            },
            resolve: function (env) {
                var keys = env.args.keys;
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
            resolve: function (env) {
                return getUserItems(env.args, env.args.types);
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
            resolve: function (env) {
                return getUserItems(env.args, null);
            }
        },
        repository: {
            type: RepositoryType,
            args: {
                id: nonNull(GraphQLString)
            },
            resolve: function (env) {
                if (!isAdmin()) {
                    throw new Error('You don\'t have permission to access this resource');
                }
                var id = env.args.id;
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
            resolve: function (env) {
                if (!isAdmin()) {
                    throw new Error('You don\'t have permission to access this resource');
                }
                var query = env.args.query;
                var start = env.args.start;
                var count = env.args.count;
                var sort = env.args.sort;
                return listRepositories(query, start, count, sort);
            }
        }
    }
});
export default query;
