var nodeLib = require('/lib/xp/node');
var namePrettyfier = Java.type('com.enonic.xp.name.NamePrettyfier');

var REPO_NAME = "system-repo";
var REPO_BRANCH = 'master';
var MAX_COUNT = 100;

exports.singleOrArray = function (value) {
    return value && value.length === 1 ? value[0] : value;
};

exports.refresh = function () {
    newConnection().refresh('SEARCH');
};

exports.required = function (params, name) {
    var value = params[name];
    if (value === undefined || value === null) {
        throw "Parameter '" + name + "' is required";
    }
    return value;
};

exports.default = function (params, name, defaultValue) {
    var value = params[name];
    if (value === undefined || value === null) {
        return defaultValue;
    }
    return value;
};

exports.getByIds = function (ids) {
    return newConnection().get(ids);
};

exports.delete = function (ids) {
    return newConnection().delete(ids);
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

exports.extensionFromMimeType = function (mimeType) {
    var ext = '';
    if (mimeType.indexOf('image/png') > -1) {
        ext = '.png';
    } else if (mimeType.indexOf('image/jpg') > -1 || mimeType.indexOf('image/jpeg') > -1) {
        ext = '.jpg';
    } else if (mimeType.indexOf('image/gif') > -1) {
        ext = '.gif';
    } else if (mimeType.indexOf('image/svg+xml') > -1) {
        ext = '.svg';
    }
    return ext;
};

function splitKey(key) {
    var parts = key && key.split(':');
    var isRole = parts[0] === 'role';
    if (!parts || !isRole && parts.length !== 3 || isRole && parts.length !== 2) {
        throw "Invalid principal key [" + key + "]";
    }
    return parts;
}

exports.userStoreFromKey = function (key) {
    var parts = splitKey(key);
    if (parts[0] === 'role') {
        throw "Principal keys of type role can't have userStore [" + key + "]";
    }
    return parts[1];
};

exports.nameFromKey = function (key) {
    var parts = splitKey(key);
    return parts[0] !== 'role' ? parts[2] : parts[1];
};

exports.typeFromKey = function (key) {
    return splitKey(key)[0];
};

exports.prettifyName = function (text) {
    return namePrettyfier.create(text);
};

exports.querySingle = function (query) {
    var results = queryAll({
        start: 0,
        count: 1,
        query: query
    });

    return results.total === 1 ? results.hits[0] : null;
};

exports.create = function (params) {
    return newConnection().create(params);
};

exports.update = function (params) {
    return newConnection().modify(params);
};

var queryAll = exports.queryAll = function (params) {
    var start = params.start || 0;
    var count = params.count || MAX_COUNT;

    log.info('queryAll(): query="' + params.query + '"');

    var repoConn = newConnection();
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
        hits: [].concat(hits)
    };
};

var newConnection = function () {
    return nodeLib.connect({
        repoId: REPO_NAME,
        branch: REPO_BRANCH
    });
};