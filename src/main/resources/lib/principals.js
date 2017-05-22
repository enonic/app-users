var common = require('./common');

module.exports = {
    getByIds: function (ids) {
        return common.getByIds(ids);
    },
    list: function (userStoreKey, types, start, count, sort) {
        return common.queryAll({
            query: constructPrincipalQuery(userStoreKey, types),
            start: start,
            count: count,
            sort: sort
        });
    }
};

function constructPrincipalQuery(userStoreKey, types) {
    var query = 'userStoreKey="' + userStoreKey + '"';
    if (types) {
        var typeString = types.map(function (type) {
            return '"' + type + '"';
        }).join(', ');
        query += ' AND principalType IN (' + typeString + ')'
    }
    return query;
}
