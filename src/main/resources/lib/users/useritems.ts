import type {QueryNodeParams} from '/lib/xp/node';


import {
    ALL_USER_ITEM_TYPES,
    queryAll,
    UserItemType,
} from './common';


export function list(
    types: UserItemType[],
    query: string,
    itemIds?: string[],
    start?: QueryNodeParams['start'],
    count?: QueryNodeParams['count']
) {
    const result = queryAll({
        query: createUserItemsQuery(query, types, itemIds),
        start,
        count,
        aggregations: {
            principalType: {
                terms: {
                    field: 'principalType'
                }
            }
        }
    });

    processIdProviderAggregation(result);

    return result;
}

// export const Type = UserItemType;


function processIdProviderAggregation(result) {
    if (!result || !result.aggregations || !result.aggregations.principalType || !result.aggregations.principalType.buckets) {
        return;
    }

    let aggregationBuckets = result.aggregations.principalType.buckets;

    let principalsCount = 0;
    aggregationBuckets.forEach(function (bucket) {
        principalsCount += bucket.docCount;
    });

    let idProvidersCount = result.total - principalsCount;

    if (idProvidersCount > 0) {
        aggregationBuckets.push({key: 'id_provider', docCount: '' + idProvidersCount});
    }
}

function createUserItemsQuery(
    query: string,
    types?: UserItemType[],
    itemIds?: string[]
) {
    let q = createTypesQuery(types);
    if (query) {
        q = createTextQuery(query) + ' AND ' + q;
    }

    if (itemIds && itemIds.length > 0) {
        let itemsIdsQuery = '';

        itemIds.forEach(function (id, index) {
            itemsIdsQuery += (index > 0 ? ' OR ' : '') + '_id="' + id + '" OR _name="' + id + '"';
        });

        q += q ? ' AND (' + itemsIdsQuery + ')' : itemsIdsQuery;
    }

    return q;
}

function createTextQuery(query: string) {
    const q = '"_allText,displayName","' + query + '","AND"';
    return '(fulltext(' + q + ') OR ngram(' + q + '))';
}

function createTypesQuery(types?: UserItemType[]) {
    const newTypes = types || ALL_USER_ITEM_TYPES;
    let query = newTypes
        .map(function (type) {
            switch (type) {
                case UserItemType.ROLE:
                case UserItemType.GROUP:
                case UserItemType.USER:
                    return 'principalType = "' + type + '"';
                case UserItemType.ID_PROVIDER:
                    return '(_parentPath = "/identity" AND _path != "/identity/roles")';
                default:
                    return null;
            }
        })
        .filter(function (typeQuery) {
            return typeQuery != null;
        });
    return '(' + query.join(' OR ') + ')';
}
