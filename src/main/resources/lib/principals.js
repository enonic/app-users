var common = require('./common');

module.exports = {
    getByKey: function (key) {
        return common.querySingle(constructPrincipalQuery(key));
    },
    list: function (userstore, types, start, count, sort) {
        return common.queryAll({
            query: constructPrincipalQuery(null, userstore, types),
            start: start,
            count: count,
            sort: sort
        });
    }
};

function constructPrincipalQuery(key, userstoreKey, types) {
    var query;
    if (key) {
        query = '_id=\"' + key + '"';
    } else {
        query = 'userStoreKey="' + userstoreKey + '"';
        if (types) {
            var typeString = types.map(function (type) {
                return '"' + type + '"';
            }).join(', ');
            query += ' AND principalType IN (' + typeString + ')'
        }
    }
    return query;
}
