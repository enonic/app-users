import {getMemberships} from './principals';
import {
    isRole,
    isSystemAdmin,
    isUser,
    newConnection
} from './common';

const PERMISSIONS = ['READ', 'CREATE', 'MODIFY', 'DELETE', 'PUBLISH', 'READ_PERMISSIONS', 'WRITE_PERMISSIONS'];

export function generateReport(principalKey, repositoryId, branch) {
    let principalKeys = getPrincipalKeys(principalKey);
    let isSystemAdmin = hasSystemAdminRole(principalKeys);
    let filters = isSystemAdmin ? null : makeRepoNodesQueryFilters(principalKeys);
    let nodes = queryRepositoryNodes(repositoryId, branch, filters);

    let reportLine = 'Path, Read, Create, Modify, Delete, Publish, ReadPerm., WritePerm.';
    let tempFile = Java.type('java.io.File').createTempFile('perm-report-', '.csv');
    let Files = Java.type('com.google.common.io.Files');
    let charset = Java.type('java.nio.charset.Charset').forName('UTF-8');
    Files.append(reportLine, tempFile, charset);

    nodes.forEach(function (node) {
        reportLine = '\n' + (isSystemAdmin ? generateSystemAdminReportLine(node) : generateReportLine(node, principalKeys));
        Files.append(reportLine, tempFile, charset);
    });

    let bytes = Files.toByteArray(tempFile);
    tempFile.delete();

    return bytes;
}

function getPrincipalKeys(principalKey) {
    let principalKeys = [principalKey];

    if (!isRole(principalKey)) {
        let membershipKeys = getMemberships(principalKey, true).map(function (m) {
            return m.key;
        });
        principalKeys = principalKeys.concat(membershipKeys);
    }

    if (isUser(principalKey)) {
        principalKeys.push('role:system.everyone');
        if (principalKey != 'user:system:anonymous') {
            principalKeys.push('role:system.authenticated');
        }
    }

    return principalKeys;
}

function queryRepositoryNodes(repositoryId, branch, filters) {
    let repoConn = newConnection(repositoryId, branch);

    return repoConn.query({
        count: -1, // TODO Batch
        query: '_path LIKE \'/content*\'',
        filters: filters
    }).hits.map(function (nodeHit) {
        let node = repoConn.get(nodeHit.id);
        const path = node._path.substr(8); // remove starting '/content'
        return {
            _path: path.length === 0 ? '/' : path,
            _permissions: node._permissions
        };
    });
}

function makeRepoNodesQueryFilters(principalKeys) {
    return {
        hasValue: {
            field: '_permissions.read',
            values: principalKeys
        }
    };
}

function hasSystemAdminRole(principalKeys) {
    return principalKeys.some(function (principalKey) {
        return isSystemAdmin(principalKey);
    });
}

function generateReportLine(node, memKeys) {
    let allow = {};
    let deny = {};
    for (let i = 0; i < node._permissions.length; i++) { // eslint-disable-line @typescript-eslint/prefer-for-of
        const perm = node._permissions[i];
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
    let line = [node._path];
    PERMISSIONS.forEach(function (pt) {
        line.push(allow[pt] && !deny[pt] ? 'X' : '');
    });
    return line.join(',');
}

function generateSystemAdminReportLine(node) {
    let line = [node._path];

    PERMISSIONS.forEach(function () {
        line.push('X');
    });

    return line.join(',');
}
