var common = require('./common');

exports.getById = function (id) {
    return common.getByIds(id)
};

exports.list = function (start, count, sort) {
    var queryResult = common.queryAll({
        query: createRepoQuery(),
        start: start,
        count: count,
        sort: sort
    });
    return queryResult.hits;
};

function createRepoQuery() {
    return '_parentPath="/repository"';
}
