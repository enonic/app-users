var principals = require('./principals');
var common = require('./common');

var PERMISSIONS = ['READ', 'CREATE', 'MODIFY', 'DELETE', 'PUBLISH', 'READ_PERMISSIONS', 'WRITE_PERMISSIONS'];

function generateReport(principalKey, repositoryId, branch) {
    var principalKeys = getPrincipalKeys(principalKey);
    var isSystemAdmin = hasSystemAdminRole(principalKeys);
    var filters = isSystemAdmin ? null : makeRepoNodesQueryFilters(principalKeys);
    var nodes = queryRepositoryNodes(repositoryId, branch, filters);

    var reportLine = 'Path, Read, Create, Modify, Delete, Publish, ReadPerm., WritePerm.';
    var tempFile = Java.type('java.io.File').createTempFile("perm-report-", ".csv");
    var Files = Java.type('com.google.common.io.Files');
    var charset = Java.type('java.nio.charset.Charset').forName("UTF-8");
    Files.append(reportLine, tempFile, charset);

    nodes.forEach(function (node) {
        reportLine = '\n' + (isSystemAdmin ? generateSystemAdminReportLine(node) : generateReportLine(node, principalKeys));
        Files.append(reportLine, tempFile, charset);
    });

    var bytes = Files.toByteArray(tempFile);
    tempFile.delete();

    return bytes;
}

function getPrincipalKeys(principalKey) {
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

    return principalKeys;
}

var queryRepositoryNodes = function (repositoryId, branch, filters) {
    var repoConn = common.newConnection(repositoryId, branch);

    return repoConn.query({
        count: 1024, //TODO Batch
        query: `_path LIKE '/content*'`,
        filters: filters
    }).hits.map(function (nodeHit) {
        var node = repoConn.get(nodeHit.id);
        const path = node._path.substr(8); // remove starting '/content'
        return {
            _path: path.length === 0 ? '/' : path,
            _permissions: node._permissions
        };
    });
};

function makeRepoNodesQueryFilters(principalKeys) {
    return {
        hasValue: {
            field: "_permissions.read",
            values: principalKeys
        }
    }
}

function hasSystemAdminRole(principalKeys) {
    return principalKeys.some(function (principalKey) {
        return common.isSystemAdmin(principalKey);
    })
}

var generateReportLine = function (node, memKeys) {

    var allow = {};
    var deny = {};
    for (var i = 0; i < node._permissions.length; i++) {
        var perm = node._permissions[i];
        if (memKeys.indexOf(perm.principal) >= 0) {
            PERMISSIONS.forEach(function (pt) {
                if (perm.allow.indexOf(pt) !== -1) {
                    allow[pt] = true;
                }
                if (perm.deny.indexOf(pt) !== -1) {
                    deny[pt] = true;
                }
            });
        }
    }
    var line = [node._path];
    PERMISSIONS.forEach(function (pt) {
        line.push(allow[pt] && !deny[pt] ? 'X' : '');
    });
    return line.join(',');
};

var generateSystemAdminReportLine = function (node) {
    var line = [node._path];

    PERMISSIONS.forEach(function () {
        line.push('X');
    });

    return line.join(',');
};

module.exports = {
    generateReport: generateReport
};
