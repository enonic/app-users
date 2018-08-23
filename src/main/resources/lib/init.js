var repoLib = require('/lib/xp/repo');
var nodeLib = require('/lib/xp/node');
var contextLib = require('/lib/xp/context');

var REPO_NAME = 'com.enonic.xp.app.users';
exports.REPO_NAME = REPO_NAME;
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
    },
    {
        principal: 'role:system.user.app',
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
    },
    {
        principal: 'role:system.user.admin',
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
var PERMISSIONS_REPORT_PERMISSIONS = [
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
    log.info('Repository [' + REPO_NAME + '] created');
};

var createNodes = function () {
    var repoConn = nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master',
    });
    repoConn.create({
        _name: 'reports',
        _parentPath: '/',
        _permissions: ROOT_PERMISSIONS
    });
    repoConn.create({
        _name: 'permissions',
        _parentPath: '/reports',
        _permissions: PERMISSIONS_REPORT_PERMISSIONS
    });
};

var doInitialize = function () {
    var result = repoLib.get(REPO_NAME);
    if (!result) {
        createRepo();
        createNodes();
        repoLib.refresh('SEARCH');
    }
};

exports.initialize = function () {
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
};
