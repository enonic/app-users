var common = require('./common');
var authLib = require('/lib/xp/auth');

module.exports = {
    getByKeys: function (keys) {
        var noKeys = keys == null || (keys instanceof Array && keys.length === 0);

        // users and groups have their keys as _id, but roles have them stored as key
        var principals = noKeys ? [] : common.queryAll({
            query:
                common.createQueryByField('_id', keys) +
                ' OR ' +
                common.createQueryByField('key', keys)
        }).hits;

        return keys instanceof Array ? principals : common.singleOrArray(principals);
    },
    getMemberships: function (key, transitive) {
        return authLib.getMemberships(key, transitive);
    },
    addMemberships: function(key, memberships) {
        var addMms = [].concat(memberships).map(function(current) {
            module.exports.addMembers(current, key);
            return current;
        });
        return addMms;
    },
    removeMemberships: function(key, memberships) {
        var removeMms = [].concat(memberships).map(function(current) {
            module.exports.removeMembers(current, key);
            return current;
        });
        return removeMms;
    },
    updateMemberships: function(key, addMms, removeMms) {
        if (addMms && addMms.length > 0) {
            module.exports.addMemberships(key, addMms);
        }
        if (removeMms && removeMms.length > 0) {
            module.exports.removeMemberships(key, removeMms);
        }
    },
    getMembers: function(key) {
        return authLib.getMembers(key);
    },
    addMembers: function(key, members) {
        try {
            authLib.addMembers(key, members);
        } catch (e) {
            log.error(
                'Could not add members ' +
                    JSON.stringify(members) +
                    ' to [' +
                    key +
                    ']',
                e
            );
        }
        return members;
    },
    removeMembers: function(key, members) {
        try {
            authLib.removeMembers(key, members);
        } catch (e) {
            log.error(
                'Could not remove members ' +
                    JSON.stringify(members) +
                    ' from [' +
                    key +
                    ']',
                e
            );
        }
        return members;
    },
    updateMembers: function(key, addMs, removeMs) {
        if (addMs && addMs.length > 0) {
            module.exports.addMembers(key, addMs);
        }
        if (removeMs && removeMs.length > 0) {
            module.exports.removeMembers(key, removeMs);
        }
    },
    list: function (idProviderKey, types, query, start, count, sort) {
        return common.queryAll({
            query: createPrincipalQuery(idProviderKey, types, query),
            start: start,
            count: count,
            sort: sort
        });
    },
    delete: function(keys) {
        return keys.map(function(key) {
            try {
                var deleted = authLib.deletePrincipal(key);
                return {
                    key: key,
                    deleted: deleted,
                    reason: deleted ? '' : 'Principal [' + key + '] could not be deleted'
                };
            } catch (e) {
                return {
                    key: key,
                    deleted: false,
                    reason: e.message
                };
            }
        });
    },
    Type: common.PrincipalType
};

function createPrincipalQuery(idProviderKey, types, query) {
    var q = query ? textQuery(query) : '';
    if (!types) {
        q += (q ? ' AND ' : '') + idProviderQuery(idProviderKey);
    } else {
        var tq = '';
        types.forEach(function(type, index) {
            var add;
            switch (type) {
                case common.PrincipalType.ROLE:
                    add = rolesQuery();
                    break;
                case common.PrincipalType.GROUP:
                case common.PrincipalType.USER:
                    add = idProviderQuery(idProviderKey, type);
                    break;
                default: // none
            }
            tq += (index > 0 ? ' OR ' : '') + add;
        });
        q += q ? ' AND (' + tq + ')' : tq;
    }
    return q;
}

function textQuery(query) {
    var q = '"_allText,displayName","' + query + '","AND"';
    return '(fulltext(' + q + ') OR ngram(' + q + '))';
}

function rolesQuery() {
    return '_parentPath="/identity/roles"';
}

function idProviderQuery(key, type) {
    return (
        '(userStoreKey="' +
        key +
        '"' +
        (type ? 'AND principalType="' + type + '")' : ')')
    );
}
