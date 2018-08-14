var taskLib = require('/lib/xp/task');
var eventLib = require('/lib/xp/event');
var portalLib = require('/lib/xp/portal');
var authLib = require('/lib/xp/auth');
var initLib = require('/lib/init');
var principals = require('./principals');
var common = require('./common');

var PERMISSIONS = ['READ', 'CREATE', 'MODIFY', 'DELETE', 'PUBLISH', 'READ_PERMISSIONS', 'WRITE_PERMISSIONS'];
var PROGRESS_EVENT = 'reportProgress';

var list = function (principalKey, repositoryIds, start, count, sort) {
    var queryResult = common.queryAll({
        query: createRepoQuery(principalKey, repositoryIds),
        start: start,
        count: count,
        sort: sort
    }, initLib.REPO_NAME);
    return queryResult.hits;
};

var deleteReports = function (ids) {
    return common.delete(ids).length;
};

var get = function (ids) {
    return common.getByIds(ids, initLib.REPO_NAME)
};

var generate = function (principalKey, repositoryIds) {

    log.info('Generate: principalKey=' + principalKey + ', repositoryIds=' + JSON.stringify(repositoryIds));
    var principal = authLib.getPrincipal(principalKey);

    var reports = repositoryIds.map(function (repositoryId) {
        var node = common.create({
            _parentPath: '/reports/permissions',
            principalKey: principalKey,
            principalDisplayName: principal.displayName,
            repositoryId: repositoryId
        }, initLib.REPO_NAME);
        
        
        node.url = portalLib.serviceUrl({
            service: 'permissionReport',
            params: {
                id: node._id
            }
        });
        var taskId = generateReport(node, principalKey, repositoryId);
        return {
            _id: node._id,
            taskId: taskId,
            principalKey: principalKey,
            repositoryId: repositoryId,
            url: node.url
        }
    });

    log.info('Generate: results=' + JSON.stringify(reports));

    return reports;
};

var reportProgressToSocket = function (reportNode, progress) {
    eventLib.send({
        type: PROGRESS_EVENT,
        distributed: false,
        data: {
            report: JSON.stringify(reportNode),
            progress: progress
        }
    });
};

var generateReport = function (reportNode, principalKey, repositoryId) {
    return taskLib.submit({
        description: 'Report task for repository [' + repositoryId + '] and principal [' + principalKey + ']',
        task: function () {
            var principalKeys = [principalKey];
            if (!common.isRole(principalKey)) {
                var membershipKeys = principals.getMemberships(principalKey, true).map(function (m) {
                    return m.key;
                });
                principalKeys = principalKeys.concat(membershipKeys);
            }
            if (common.isUser(principalKey)) {
                principalKeys.push('role:system.everyone');
                if (principalKey != 'user:system:anonymous') {
                    principalKeys.push('role:system.authenticated');
                }
            }
            log.info('Principal keys: ' + JSON.stringify(principalKeys));

            var nodes = queryRepositoryNodes(repositoryId, principalKeys);
            
            var nodeProcessCount = 0;
            reportProgressToSocket(reportNode, 0);
            taskLib.progress({info: 'Generating permissions report', current: nodeProcessCount, total: nodes.length});

            var report = 'Path, Read, Create, Modify, Delete, Publish, ReadPerm., WritePerm.';
            nodes.forEach(function (node) {
                report += '\n' + generateReportLine(node, principalKeys);

                nodeProcessCount++;
                reportProgressToSocket(reportNode, nodeProcessCount * 100 / nodes.length);
                taskLib.progress({info: 'Generating permissions report', current: nodeProcessCount, total: nodes.length});
            });

            var updatedNode = common.update({
                key: reportNode._id,
                editor: function (node) {
                    node.report = report;
                    return node;
                }
            }, initLib.REPO_NAME);
            log.info('Generated report for repository [' + repositoryId + ']: ' + report);

        }
    });
};

var queryRepositoryNodes = function (repositoryId, principalKeys) {
    var filters = {
        hasValue: {
            field: "_permissions.read",
            values: principalKeys
        }
    };

    var repoConn = common.newConnection(repositoryId);
    return repoConn.query({
        count: 1024, //TODO Batch
        query: '',
        filters: filters
    }).hits.map(function (nodeHit) {
        var node = repoConn.get(nodeHit.id);
        log.info('node:' + node._path);
        return {
            _path: node._path,
            _permissions: node._permissions
        };
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
    generate: generate,
    PROGRESS_EVENT: PROGRESS_EVENT
};

function createRepoQuery(principalKey, repositoryIds) {
    var q = '_parentPath="/reports/permissions"';
    if (!!principalKey) {
        q += ' AND principalKey="' + principalKey + '"';
    }
    if (!!repositoryIds) {
        q += ' AND repositoryId IN ["' + repositoryIds.join('","') + '"]';
    }
    return q;
}
