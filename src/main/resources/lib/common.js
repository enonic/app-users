var nodeLib = require('/lib/xp/node');

var REPO_NAME = "system-repo";
var REPO_BRANCH = 'master';
var MAX_COUNT = 100;

exports.getByIds = function (ids) {
    return getConnection().get(ids);
};

exports.querySingle = function (query) {
    var results = queryAll({
        start: 0,
        count: 1,
        query: query
    });
    // if there's 1 result, it is returned as hits
    return results.total === 1 ? results.hits : null;
};

var queryAll = exports.queryAll = function (params) {
    var start = params.start || 0;
    var count = params.count || MAX_COUNT;

    log.info('queryAll() with params: ' + JSON.stringify(params));

    var repoConn = getConnection();
    var queryResult = repoConn.query({
        start: start,
        count: count,
        query: params.query,
        sort: params.sort
    });

    var hits = [];
    if (queryResult.count > 0) {
        var ids = queryResult.hits.map(function (hit) {
            return hit.id;
        });
        hits = repoConn.get(ids);
    }

    return {
        total: queryResult.total,
        start: start,
        count: count,
        hits: hits
    };
};

var getConnection = function () {
    return nodeLib.connect({
        repoId: REPO_NAME,
        branch: REPO_BRANCH
    });
};