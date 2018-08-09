var repoLib = require('/lib/xp/repo');
var nodeLib = require('/lib/xp/node');
var contextLib = require('/lib/xp/context');

var REPO_NAME = exports.REPO_NAME = 'com.enonic.xp.app.users';
var REPORTS_PATH = '/reports/permissions';
var ROOT_PERMISSIONS = [
    {
        principal: 'role:system.admin',
        allow: [
            'READ',
            'CREATE',
            'MODIFY',
            'DELETE',
            'PUBLISH',
            'READ_PERMISSIONS',
            'WRITE_PERMISSIONS'
        ],
        deny: []
    }
];

var createRepo = function () {
    log.info('Creating repository [' + REPO_NAME + ']...');
    repoLib.create({
        id: REPO_NAME,
        rootPermissions: ROOT_PERMISSIONS
    });

    repoLib.refresh('SEARCH');
};

var nodeWithPathExists = function (repoConnection, path) {
    var result = repoConnection.query({
        start: 0,
        count: 0,
        query: "_path = '" + path + "'"
    });
    return result.total > 0;
};

var createAllNodesInPath = function (repoConn, path) {
    var parentPath = '';
    path.slice(1).split('/').forEach(function (part) {
        var totalPath = parentPath + '/' + part;
        createNodeWithPath(repoConn, part, parentPath);
        parentPath = totalPath;
    });
};

var createNodeWithPath = function (repoConn, name, parentPath) {
    var totalPath = parentPath + '/' + name;
    var nodeExist = nodeWithPathExists(repoConn, totalPath);
    if (nodeExist) {
        log.info('Node [' + totalPath + '] exist.');
    } else {
        log.info('Creating node [' + name + '] at [' + parentPath + ']...');
        repoConn.create({
            _name: name,
            _parentPath: parentPath,
            _permissions: ROOT_PERMISSIONS
        });
    }
};

var createNodes = function () {
    var repoConn = nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master'
    });

    createNodesWithPath(repoConn, REPORTS_PATH);

    repoConn.refresh('SEARCH');
};

var createNodesWithPath = function (repoConn, path) {
    var nodesExist = nodeWithPathExists(repoConn, path);

    if (nodesExist) {
        log.info('Nodes [' + path + '] exist.');
        return;
    }

    createAllNodesInPath(repoConn, path);
};

var doInitialize = function () {
    var result = repoLib.get(REPO_NAME);

    if (result) {
        log.info('Repository [' + REPO_NAME + '] exists.');
    } else {
        createRepo();
    }
    createNodes();
};

exports.initialize = function () {
    log.info('Initializing repository...');

    contextLib.run(
        {
            user: {
                login: 'su',
                userStore: 'system'
            },
            principals: ['role:system.admin']
        },
        doInitialize
    );

    log.info('Repository initialized.');
};
