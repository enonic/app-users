var taskLib = require('/lib/xp/task');
var eventLib = require('/lib/xp/event');
var portalLib = require('/lib/xp/portal');
var initLib = require('/lib/init');
var principals = require('./principals');
var common = require('./common');

var PERMISSIONS = ['READ', 'CREATE', 'MODIFY', 'DELETE', 'PUBLISH', 'READ_PERMISSIONS', 'WRITE_PERMISSIONS'];
var PROGRESS_EVENT = 'reportProgress';

var list = function (principalKey, userStoreKeys, start, count, sort) {
    log.info('List repositories: pKey=' + principalKey + ', uKeys=' + JSON.stringify(userStoreKeys) + ', start=' + start + ', count=' +
             count + ', sort=' + sort);
    var queryResult = common.queryAll({
        query: createRepoQuery(principalKey, userStoreKeys),
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

var generate = function (principalKey, repositoryKeys) {

    log.info('Generate: pKey=' + principalKey + ', rKeys=' + JSON.stringify(repositoryKeys));

    var userStoreKeys = repositoryKeys.reduce(function (prev, curr) {
        return prev.concat(queryUserStores(curr));
    }, []);

    log.info('Generate: uKeys=' + JSON.stringify(userStoreKeys));

    var reports = userStoreKeys.map(function (uKey) {
        var node = common.create({
            _parentPath: '/reports/permissions',
            principalKey: principalKey,
            userStoreKey: uKey
        }, initLib.REPO_NAME);

        node.url = portalLib.serviceUrl({
            service: 'permissionReport',
            params: {
                id: node._id
            }
        });

        var taskId = generateReport(node, principalKey, uKey);

        return {
            _id: node._id,
            taskId: taskId,
            principalKey: principalKey,
            userStoreKey: uKey,
            url: node.url
        }
    });
    common.refresh(initLib.REPO_NAME);

    log.info('Generate: results=' + JSON.stringify(reports));

    return reports;
};

module.exports = {
    get: get,
    list: list,
    delete: deleteReports,
    generate: generate,
    PROGRESS_EVENT: PROGRESS_EVENT
};

var queryUserStores = function (repoKey) {
    return common.queryAll({
        query: '_parentPath="/identity" AND _name!="roles"'
    }, repoKey).hits.map(function (hit) {
        return hit._name;
    });
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

var generateReport = function (node, pKey, uKey) {
    return taskLib.submit({
        description: 'Report task for userStore[' + uKey + '] and principal[' + pKey + ']',
        task: function (reportNode, pKey, uKey) {
            return function () {
                reportProgressToSocket(reportNode, 0);
                taskLib.progress({info: 'Querying principal memberships', value: 0});

                var memKeys;
                if (common.isRole(pKey)) {
                    memKeys = [pKey]
                } else {
                    memKeys = principals.getMemberships(pKey, true).map(function (m) {
                        return m.key;
                    });
                }

                reportProgressToSocket(reportNode, 10);
                taskLib.progress({info: 'Finding nodes accessible by memberships', value: 10});

                var report = 'Path, Read, Create, Modify, Delete, Publish, ReadPerm., WritePerm.';
                queryUserStoreNodes(uKey, memKeys).forEach(function (node, index, nodes) {
                    var progress = 80 * (index + 1) / nodes.length;
                    reportProgressToSocket(reportNode, progress);
                    taskLib.progress({info: 'Generating report for [' + node._name + ']', value: progress});

                    report += '\n' + generateReportLine(node, memKeys);
                });

                reportProgressToSocket(reportNode, 90);
                taskLib.progress({info: 'Persisting report', value: 90});

                common.update({
                    key: reportNode._id,
                    editor: function (node) {
                        node.report = report;
                        return node;
                    }
                }, initLib.REPO_NAME);

                log.info('Generated report for userStore [' + uKey + ']: ' + report);
                reportProgressToSocket(reportNode, 100);
                taskLib.progress({info: 'Report for userStore [' + uKey + '] complete.', value: 100});
            }
        }(node, pKey, uKey)
    });
};

var queryUserStoreNodes = function (uKey, memKeys, repoKey) {
    //var query = '_parentPath IN ("/identity/' + uKey + '/users","/identity/' + uKey + '/groups") AND _permissions.principal IN ("' + memKeys.join('","') + '")';

    var query = '_parentPath IN ("/identity/' + uKey + '/users","/identity/' + uKey + '/groups")';
    var filter = {
        hasValue: {
            field: "_permissions.principal",
            values: memKeys
        }
    };
    var result = common.queryAll({
        query: query,
        filters: filter,
        explain: true
    }, repoKey);

    //TODO: filtering by membershipKeys here, since query filter doesn't work !!!
    return result.hits.filter(function (hit) {
        return hit._permissions.some(function (perm) {
            return perm.allow && perm.allow.length > 0 && memKeys.indexOf(perm.principal) >= 0;
        })
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

function createRepoQuery(principalKey, userStoreKeys) {
    var q = '_parentPath="/reports/permissions"';
    if (!!principalKey) {
        q += ' AND principalKey="' + principalKey + '"';
    }
    if (!!userStoreKeys) {
        q += ' AND userStoreKey IN ["' + userStoreKeys.join('","') + '"]';
    }
    log.info('Repo list query: ' + q);
    return q;
}
