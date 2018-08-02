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
    log.info('Repo query result: ' + JSON.stringify(queryResult));
    return queryResult.hits;
};

function createRepoQuery() {
    return '_parentPath="/repository"';
}
