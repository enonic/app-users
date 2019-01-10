var common = require('./common');

module.exports = {
    list: function(types, query, start, count) {
        var result = common.queryAll({
            query: createUserItemsQuery(query, types),
            start: start,
            count: count,
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
    },
    Type: common.UserItemType
};

function processIdProviderAggregation(result) {
    if (!result || !result.aggregations || !result.aggregations.principalType || !result.aggregations.principalType.buckets) {
        return;
    }

    var aggregationBuckets = result.aggregations.principalType.buckets;

    var principalsCount = 0;
    aggregationBuckets.forEach(function (bucket) {
        principalsCount += bucket.docCount;
    });

    var idProvidersCount = result.total - principalsCount;

    if (idProvidersCount > 0) {
        aggregationBuckets.push({key: 'user_store', docCount: '' + idProvidersCount});
    }
}

function createUserItemsQuery(query, types) {
    var q = createTypesQuery(types);
    if (query) {
        q = createTextQuery(query) + ' AND ' + q;
    }
    return q;
}

function createTextQuery(query) {
    var q = '"_allText,displayName","' + query + '","AND"';
    return '(fulltext(' + q + ') OR ngram(' + q + '))';
}

function createTypesQuery(types) {
    var newTypes = types || common.UserItemType.all();
    var query = newTypes
        .map(function(type) {
            switch (type) {
                case common.UserItemType.ROLE:
                case common.UserItemType.GROUP:
                case common.UserItemType.USER:
                    return 'principalType = "' + type + '"';
                case common.UserItemType.USER_STORE:
                    return '(_parentPath = "/identity" AND _path != "/identity/roles")';
                default:
                    return null;
            }
        })
        .filter(function(typeQuery) {
            return typeQuery != null;
        });
    return '(' + query.join(' OR ') + ')';
}
