var common = require('./common');

var Permission = {
    READ: 'READ',
    CREATE: 'CREATE',
    MODIFY: 'MODIFY',
    DELETE: 'DELETE',
    PUBLISH: 'PUBLISH',
    READ_PERMISSIONS: 'READ_PERMISSIONS',
    WRITE_PERMISSIONS: 'WRITE_PERMISSIONS',
    admin: function () {
        return [Permission.READ, Permission.CREATE, Permission.MODIFY, Permission.DELETE, Permission.PUBLISH, Permission.READ_PERMISSIONS,
            Permission.WRITE_PERMISSIONS]
    },
    manager: function () {
        return [Permission.READ, Permission.CREATE, Permission.MODIFY, Permission.DELETE];
    },
    write: function () {
        return Permission.manager();
    },
    create: function () {
        return [Permission.CREATE];
    },
    read: function () {
        return [Permission.READ];
    }
};

var Access = {
    READ: 'READ',
    CREATE_USERS: 'CREATE_USERS',
    WRITE_USERS: 'WRITE_USERS',
    USER_STORE_MANAGER: 'USER_STORE_MANAGER',
    ADMINISTRATOR: 'ADMINISTRATOR'
};

module.exports = {
    getByKeys: function (keys) {
        var result = common.queryAll({
            query: createUserstoreQuery() + ' AND ' + common.createQueryByField('_name', keys)
        });
        result.hits = result.hits.filter(rolesFilter);
        result.hits.forEach(calculateAccess);
        return common.singleOrArray(result.hits);
    },
    list: function (start, count, sort) {
        var result = common.queryAll({
            query: createUserstoreQuery(),
            start: start,
            count: count,
            sort: sort
        });
        result.hits = result.hits.filter(rolesFilter);
        result.hits.forEach(calculateAccess);
        return result;
    },
    create: function (params) {
        log.info('Create userStore with params: ' + JSON.stringify(params));
        var createdStore = common.create({
            _parentPath: '/identity',
            _name: common.prettifyName(params.key),
            _permissions: calculateUserStorePermissions(params.permissions),
            displayName: params.displayName,
            description: params.description,
            idProvider: calculateIdProvider(params.authConfig)
        });
        log.info('\nCreated userStore:\n' + JSON.stringify(createdStore) + '\n');

        var users, groups;
        if (createdStore) {

            users = common.create({
                _parentPath: '/identity/' + createdStore._name,
                _name: 'users',
                _permissions: calculateUsersPermissions(params.permissions)
            });

            groups = common.create({
                _parentPath: '/identity/' + createdStore._name,
                _name: 'groups',
                _permissions: calculateGroupsPermissions(params.permissions)
            });

            log.info('\nCreated users and groups nodes:\n' + users._path + '\n' + groups._path + '\n');
        }

        createdStore['idProviderMode'] = calculateIdProviderMode(params.authConfig);

        return createdStore;
    },
    update: function (params) {
        log.info('\nUpdate userStore with params:\n' + JSON.stringify(params) + '\n');
        var key = common.required(params, 'key');

        var updatedStore = common.update({
            key: '/identity/' + key,
            editor: function (store) {
                store.displayName = params.displayName;
                store.description = params.description;
                store._permissions = calculateUserStorePermissions(params.permissions);
                store.idProvider = calculateIdProvider(params.authConfig);
                return store;
            }
        });
        log.info('\nUpdated userStore:\n' + JSON.stringify(updatedStore) + '\n');

        var updatedUsers = common.update({
            key: '/identity/' + key + '/users',
            editor: function (users) {
                users._permissions = calculateUsersPermissions(params.permissions);
                return users;
            }
        });

        log.info('\nUpdated permissions for: ' + updatedUsers._path + '\n' + JSON.stringify(updatedUsers._permissions) + '\n');

        var updatedGroups = common.update({
            key: '/identity/' + key + '/groups',
            editor: function (groups) {
                groups._permissions = calculateGroupsPermissions(params.permissions);
                return groups;
            }
        });

        log.info('\nUpdated permissions for: ' + updatedGroups._path + '\n' + JSON.stringify(updatedGroups._permissions) + '\n');

        updatedStore['idProviderMode'] = calculateIdProviderMode(params.authConfig);

        return updatedStore;
    }
};

function calculateIdProviderMode(authConfig) {
    var appKey = authConfig && authConfig.applicationKey;
    if (appKey) {
        //TODO: get idProvider
        //return = idProvider.getMode();
    }
    return undefined;
}

function calculateIdProvider(authConfig) {
    return authConfig ? {
        applicationKey: authConfig.applicationKey,
        config: authConfig.config || {}
    } : undefined;
}

function calculateUserStorePermissions(access) {
    var permissions = [];
    access.forEach(function (acc) {
        if (acc.access === Access.ADMINISTRATOR) {
            permissions.push({
                principal: acc.principal.key,
                allow: Permission.admin()
            });
        }
    });
    log.info(
        '\nCalculated userStore permissions from access: \n' + JSON.stringify(access) + '\npermissions: ' + JSON.stringify(permissions) +
        '\n');
    return permissions;
}

function calculateGroupsPermissions(access) {
    var permissions = [];
    access.forEach(function (acc) {
        switch (acc.access) {
        case Access.ADMINISTRATOR:
            permissions.push({
                principal: acc.principal.key,
                allow: Permission.admin()
            });
            break;
        case Access.USER_STORE_MANAGER:
            permissions.push({
                principal: acc.principal.key,
                allow: Permission.manager()
            });
            break;
        }
    });
    log.info('\nCalculated groups permissions from access: \n' + JSON.stringify(access) + '\npermissions: ' + JSON.stringify(permissions) +
             '\n');
    return permissions;
}

function calculateUsersPermissions(access) {
    var permissions = [];
    access.forEach(function (acc) {
        switch (acc.access) {
        case Access.ADMINISTRATOR:
            permissions.push({
                principal: acc.principal.key,
                allow: Permission.admin()
            });
            break;
        case Access.USER_STORE_MANAGER:
            permissions.push({
                principal: acc.principal.key,
                allow: Permission.manager()
            });
            break;
        case Access.WRITE_USERS:
            permissions.push({
                principal: acc.principal.key,
                allow: Permission.write()
            });
            break;
        case Access.CREATE_USERS:
            permissions.push({
                principal: acc.principal.key,
                allow: Permission.create()
            });
            break;
        case Access.READ:
            permissions.push({
                principal: acc.principal.key,
                allow: Permission.read()
            });
            break;
        }
    });
    log.info(
        '\nCalculated users permissions from access: \n' + JSON.stringify(access) + '\npermissions: ' + JSON.stringify(permissions) + '\n');
    return permissions;
}

function rolesFilter(hit) {
    return hit._name !== 'roles';
}

function createUserstoreQuery(path) {
    return '_parentPath="/identity' + (path || '') + '"';
}

function calculateAccess(userStore) {
    var isRole = !rolesFilter(userStore);

    if (!isRole) {
        var userNode = common.querySingle('_path="/identity/' + userStore._name + '/users"');
        var groupNode = common.querySingle('_path="/identity/' + userStore._name + '/groups"');

        var uniques = {};
        var ps = getPrincipals(userStore).concat(getPrincipals(userNode), getPrincipals(groupNode)).filter(function (item) {
            var existing = uniques[item];
            if (!existing) {
                uniques[item] = true;
            }
            return !existing;
        });
        var accesses = [];
        ps.forEach(function (p) {
            var access = null;
            if (isAllowedFor(userStore, p, Permission.admin()) &&
                isAllowedFor(userNode, p, Permission.admin()) &&
                isAllowedFor(groupNode, p, Permission.admin())) {

                access = Access.ADMINISTRATOR;

            } else if (isAllowedFor(userNode, p, Permission.manager()) &&
                       isAllowedFor(groupNode, p, Permission.manager())) {

                access = Access.USER_STORE_MANAGER;

            } else if (isAllowedFor(userNode, p, Permission.write())) {

                access = Access.WRITE_USERS;

            } else if (isAllowedFor(userNode, p, Permission.create())) {

                access = Access.CREATE_USERS;

            } else if (isAllowedFor(userNode, p, Permission.read())) {

                access = Access.READ;
            }
            if (access) {
                accesses.push({
                    principal: p,
                    access: access
                });
            }
        });
        log.info(
            '\nCalculated access for [' + userStore._name + '] from permissions: \n' + JSON.stringify(ps) + '\npermissions: ' +
            JSON.stringify(accesses) + '\n');
        userStore.access = accesses;
    }
}

function getPrincipals(store) {
    return store._permissions.map(function (p) {
        return p.principal;
    });
}

function isAllowedFor(store, principalKey, actions) {

    return store._permissions && store._permissions.some(function (perm) {
            return principalKey === perm.principal && actions.every(function (a) {
                    return perm.allow.indexOf(a) >= 0;
                });
        });
}