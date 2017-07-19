var common = require('./common');

module.exports = {
    list: function (query, start, count) {
        var result =  common.queryAll({
            query: createUserItemsQuery(query),
            start: start,
            count: count,
            aggregations: {
                type: {
                    terms: {
                        field: 'principalType'
                    }
                }
            }
        });

        return result;
    }
};

function createUserItemsQuery(query) {
    var q = createTypesQuery();
    if (query) {
        q = createTextQuery(query) + ' AND ' + q;
    }
    return q;
}

function createTextQuery(query) {
    var q = '"_allText,displayName","' + query + '","AND"';
    return '(fulltext(' + q + ') OR ngram(' + q + '))';
}

function createTypesQuery() {
    var query = common.PrincipalType.all().map(function (type) { return 'principalType = "' + type + '"'; });
    query.push('(_parentPath = "/identity" AND _path != "/identity/roles")');
    return '(' + query.join(' OR ') + ')';
}
