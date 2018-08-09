var common = require('./common');
var principals = require('./principals');
var taskLib = require('/lib/xp/task');
var initLib = require('/lib/init');

var PERMISSIONS = ['READ', 'CREATE', 'MODIFY', 'DELETE', 'PUBLISH', 'READ_PERMISSIONS', 'WRITE_PERMISSIONS'];

var list = function (principalKey, userStoreKey, start, count, sort) {
    var queryResult = common.queryAll({
        query: createRepoQuery(principalKey, userStoreKey),
        start: start,
        count: count,
        sort: sort
    });
    return queryResult.hits;
};

var deleteReports = function (ids) {
    return common.delete(ids);
};

var generate = function (principalKey, repositoryKeys) {

    log.info('Generate: pKey=' + principalKey + ', rKeys=' + JSON.stringify(repositoryKeys));

    var userStoreKeys = repositoryKeys.reduce(function (prev, curr) {
        return prev.concat(queryUserStores(curr));
    }, []);

    log.info('Generate: uKeys=' + JSON.stringify(userStoreKeys));

    var ids = userStoreKeys.map(function (uKey) {
        var node = common.create({
            _parentPath: '/reports/permissions',
            principalKey: principalKey,
            userStoreKey: uKey,
            report: 'Report is being generated...'
        }, initLib.REPO_NAME);
        common.refresh(initLib.REPO_NAME);
        return generateReport(node._id, principalKey, uKey);
    });

    log.info('Generate: ids=' + JSON.stringify(ids));

    return {
        ids: ids
    };
};

var queryUserStores = function (repoKey) {
    return common.queryAll({
        query: '_parentPath="/identity" AND _name!="roles"'
    }, repoKey).hits.map(function (hit) {
        return hit._name;
    });
};

var generateReport = function (nodeId, pKey, uKey) {
    return taskLib.submit({
        description: 'Report task for userStore[' + uKey + '] and principal[' + pKey + ']',
        task: function (nodeId, pKey, uKey) {
            return function () {
                var report = 'Path, Read, Create, Modify, Delete, Publish, ReadPerm., WritePerm.\n';
                var memKeys;
                if (common.isRole(pKey)) {
                    memKeys = [pKey]
                } else {
                    memKeys = principals.getMemberships(pKey, true).map(function (m) {
                        return m.key;
                    });
                }
                log.info('Membership keys for principal[' + pKey + ']: ' + JSON.stringify(memKeys));

                var nodes = queryUserStoreNodes(uKey, memKeys);
                log.info('Userstore nodes having permissions for above keys: ' + JSON.stringify(nodes.map(function (n) {
                    return n._path
                })));

                nodes.forEach(function (node) {
                    report += generateReportLine(node, memKeys);
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
        }(nodeId, pKey, uKey)
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
        log.info('Filtering hit for mems [' + memKeys + ']: ' + JSON.stringify(hit._name));
        return hit._permissions.some(function (perm) {
            log.info('Filtering permission: ' + JSON.stringify(perm));
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
            log.info('Generated line for principal[' + perm.principal + '] from permissions' + JSON.stringify(perm.allow) + ': ' + line);
        }
    }
    return lines.join('\n');
};

module.exports = {
    list: list,
    delete: deleteReports,
    generate: generate
};

function createRepoQuery(principalKey, userStoreKey) {
    var q = '_parentPath="/reports/permissions"';
    if (!!principalKey) {
        q += ' AND principalKey="' + principalKey + '"';
    }
    if (!!userStoreKey) {
        q += ' AND userStoreKey="' + userStoreKey + '"';
    }
    return q;
}
