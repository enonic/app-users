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
    }
};

function rolesFilter(hit) {
    return hit._name !== 'roles';
}

function createUserstoreQuery(path) {
    return '_parentPath="/identity' + (path || '') + '"';
}

function calculateAccess(userStore) {
    var ps = getPrincipals(userStore);

    if (rolesFilter(userStore)) {
        var userNode = common.querySingle('_path="/identity/' + userStore._name + '/users"');
        var groupNode = common.querySingle('_path="/identity/' + userStore._name + '/groups"');

        var uniques = {};
        ps = ps.concat(getPrincipals(userNode), getPrincipals(groupNode)).filter(function (item) {
            var existing = uniques[item];
            if (!existing) {
                uniques[item] = true;
            }
            return !existing;
        });
    }

    var permissions = [];
    var access;
    ps.forEach(function (p) {
        if (isAllowedFor(userStore, p, Permission.admin())) {
            access = Access.ADMINISTRATOR;
        } else if (isAllowedFor(userStore, p, Permission.manager())) {
            access = Access.USER_STORE_MANAGER;
        } else if (isAllowedFor(userStore, p, Permission.write())) {
            access = Access.WRITE_USERS;
        } else if (isAllowedFor(userStore, p, Permission.create())) {
            access = Access.CREATE_USERS;
        } else if (isAllowedFor(userStore, p, Permission.read())) {
            access = Access.READ;
        }
        permissions.push({
            principal: p,
            access: access
        })
    });

    userStore._permissions = permissions;
}

function getPrincipals(store) {
    return store._permissions.map(function (p) {
        return p.principal;
    });
}

function isAllowedFor(store, principalKey, actions) {

    return store._permissions && store._permissions.some(function (p) {
            return principalKey === p.principal && actions.every(function (a) {
                    return p.allow.indexOf(a) >= 0;
                });
        });
}