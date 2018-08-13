var common = require('./common');

exports.getById = function (id) {
    return common.getByIds(id)
};

exports.list = function (query, start, count, sort) {
    var queryResult = common.queryAll({
        query: createRepoQuery(query),
        start: start,
        count: count,
        sort: sort
    });
    return queryResult.hits;
};

function createRepoQuery(query) {
    var q = '_parentPath="/repository"';
    if (!!query) {
        q += ' AND fulltext(\'_name\', \'' + query + '\', \'AND\')'
    }
    return q;
}
