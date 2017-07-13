var common = require('./common');

module.exports = {
    list: function (start, count) {
        return common.queryAll({
            query: createTypesQuery(),
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
    },
    Type: common.PrincipalType
};

function createTypesQuery() {
    var query = common.PrincipalType.all().map(function (type) { return 'principalType = "' + type + '"'; });
    query.push('(_parentPath = "/identity" AND _path != "/identity/roles")');
    return query.join(' OR ');
}
