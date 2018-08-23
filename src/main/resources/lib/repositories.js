var common = require('./common');

exports.getById = function (id) {
    return common.getByIds(id)
};

exports.list = function (search, start, count, sort) {
    var queryResult = common.queryAll({
        query: createRepoQuery(search),
        start: start,
        count: count,
        sort: sort
    });
    return queryResult.hits;
};

function createRepoQuery(search) {
    return '_parentPath="/repository"' + (search ? ' AND ngram("_name","' + search + '")' : '');
}
