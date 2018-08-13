var common = require('./common');
var principals = require('./principals');
var taskLib = require('/lib/xp/task');
var initLib = require('/lib/init');

var PERMISSIONS = ['READ', 'CREATE', 'MODIFY', 'DELETE', 'PUBLISH', 'READ_PERMISSIONS', 'WRITE_PERMISSIONS'];

var list = function (principalKey, repositoryId, start, count, sort) {
    var queryResult = common.queryAll({
        query: createRepoQuery(principalKey, repositoryId),
        start: start,
        count: count,
        sort: sort
    });
    return queryResult.hits;
};

var deleteReports = function (ids) {
    return common.delete(ids);
};

var get = function (ids) {
    return common.getByIds(ids, initLib.REPO_NAME)
};

var generate = function (principalKey, repositoryIds) {

    log.info('Generate: principalKey=' + principalKey + ', repositoryIds=' + JSON.stringify(repositoryIds));

    var ids = repositoryIds.map(function (repositoryId) {
        var node = common.create({
            _parentPath: '/reports/permissions',
            principalKey: principalKey,
            repositoryId: repositoryId,
            report: 'Report is being generated...'
        }, initLib.REPO_NAME);
        return generateReport(node._id, principalKey, repositoryId);
    });

    log.info('Generate: ids=' + JSON.stringify(ids));

    return {
        ids: ids
    };
};

var generateReport = function (nodeId, principalKey, repositoryId) {
    return taskLib.submit({
        description: 'Report task for repository [' + repositoryId + '] and principal [' + principalKey + ']',
        task: function () {
            var report = 'Path, Read, Create, Modify, Delete, Publish, ReadPerm., WritePerm.';

            var membershipKeys;
            if (common.isRole(principalKey)) {
                membershipKeys = [principalKey]
            } else {
                membershipKeys = principals.getMemberships(principalKey, true).map(function (m) {
                    return m.key;
                });
            }

            queryRepositoryNodes(repositoryId, membershipKeys).forEach(function (node) {
                report += '\n' + generateReportLine(node, membershipKeys);
            });

            var updatedNode = common.update({
                key: nodeId,
                editor: function (node) {
                    node.report = report;
                    return node;
                }
            }, initLib.REPO_NAME);
            log.info('Generated report for node[' + updatedNode._name + ']: ' + report);

        }
    });
};

var queryRepositoryNodes = function (repositoryId, membershipKeys) {
    var filters = {
        hasValue: {
            field: "_permissions.principal",
            values: membershipKeys
        }
    };

    var repoConn = common.newConnection(repositoryId);
    var nodeHits = repoConn.query({
        count: 10, //TODO Batch
        query: '',
        //filters: filters //TODO
    }).hits;

    return nodeHits.map(function (nodeHit) {
        log.info('nodeId:' + nodeHit.id);
        var node = repoConn.get(nodeHit.id);

        log.info('node:' + JSON.stringify(node, null, 2));
        if (node) {

            var hasReadAccess = node._permissions.some(function (permission) {
                return membershipKeys.indexOf(permission.principal) !== -1
                       && permission.allow.indexOf('READ') !== -1
                       && permission.deny.indexOf('READ') === -1
            });
            log.info('hasReadAccess:' + hasReadAccess);
            if (hasReadAccess) {
                return {
                    _path: node._path,
                    _permissions: node._permissions
                };
            }
        }
        return null;
    }).filter(function (node) {
        return !!node;
    });
};

var generateReportLine = function (node, memKeys) {
    var lines = [];
    for (var i = 0; i < node._permissions.length; i++) {
        var perm = node._permissions[i];
        if (memKeys.indexOf(perm.principal) >= 0) {
            var cols = [node._path];
            PERMISSIONS.forEach(function (pt) {
                cols.push(perm.allow.indexOf(pt) >= 0 ? 'X' : '')
            });
            var line = cols.join(',');
            lines.push(line);
        }
    }
    return lines.join('\n');
};

module.exports = {
    get: get,
    list: list,
    delete: deleteReports,
    generate: generate
};

function createRepoQuery(principalKey, repositoryId) {
    var q = '_parentPath="/reports/permissions"';
    if (!!principalKey) {
        q += ' AND principalKey="' + principalKey + '"';
    }
    if (!!userStoreKey) {
        q += ' AND repositoryId="' + repositoryId + '"';
    }
    return q;
}
