var nodeLib = require('/lib/xp/node');

var REPO_NAME = "system-repo";
var REPO_BRANCH = 'master';
var MAX_COUNT = 100;

exports.getByIds = function (ids) {
    return getConnection().get(ids);
};

exports.createQueryByField = function (field, values) {
    if (!values || !field) {
        return null;
    }
    var clause = String(field);
    if (values instanceof Array) {
        clause += ' IN (' + serializeValues(values) + ')';
    } else {
        clause += '=' + serializeValue(values);
    }
    return clause
};

function serializeValues(values) {
    return values ? values.map(serializeValue).join(',') : '';
}

function serializeValue(value) {
    return typeof value === 'string' ? '"' + value + '"' : value;
}

exports.querySingle = function (query) {
    var results = queryAll({
        start: 0,
        count: 1,
        query: query
    });

    return results.total === 1 ? results.hits[0] : null;
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
        log.info('repoConn.get(): ' + JSON.stringify(ids));
        hits = repoConn.get(ids);
    }

    return {
        total: queryResult.total,
        start: start,
        count: count,
        hits: [].concat(hits)
    };
};

var getConnection = function () {
    return nodeLib.connect({
        repoId: REPO_NAME,
        branch: REPO_BRANCH
    });
};