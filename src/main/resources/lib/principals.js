var common = require('./common');

var PrincipalType = {
    ROLE: 'ROLE',
    USER: 'USER',
    GROUP: 'GROUP',
    all: function () {
        return [PrincipalType.ROLE, PrincipalType.USER, PrincipalType.GROUP];
    }
};

function isUser(key) {
    return key && key.split(":")[0] === 'user';
}
function isGroup(key) {
    return key && key.split(":")[0] === 'group';
}
function isRole(key) {
    return key && key.split(":")[0] === 'role';
}

module.exports = {
    getByKeys: function (ids, includeMemberships) {
        var principals = common.getByIds(ids);
        if (includeMemberships) {
            // principals may be object so make sure we have array
            [].concat(principals).forEach(function (p) {
                var key = p._id;
                if (isUser(key)) {
                    p["memberships"] = module.exports.getMemberships(key);
                } else if (isGroup(key) || isRole(key)) {
                    // uncomment to return principals instead of their keys
                    // p["member"] = common.getByIds(p.member);
                }
            });
        }
        return common.singleOrArray(principals);
    },
    getMemberships: function (id) {
        return common.queryAll({
            query: 'member="' + id + '"',
            count: -1
        }).hits;
    },
    list: function (userStoreKey, types, query, start, count, sort) {
        return common.queryAll({
            query: createPrincipalQuery(userStoreKey, types, query),
            start: start,
            count: count,
            sort: sort
        });
    },
    Type: PrincipalType
};

function createPrincipalQuery(userStoreKey, types, query) {

    var q = !!query ? textQuery(query) : '';
    if (!types) {
        q += (q ? ' AND ' : '') + userStoreQuery(userStoreKey);
    } else {
        var tq = '';
        types.forEach(function (type, index) {
            var add;
            switch (type) {
            case PrincipalType.ROLE:
                add = rolesQuery();
                break;
            case PrincipalType.GROUP:
            case PrincipalType.USER:
                add = userStoreQuery(userStoreKey, type);
                break;
            }
            tq += (index > 0 ? ' OR ' : '') + add;
        });
        q += (q ? ' AND (' + tq + ')' : tq);
    }
    return q;
}

function textQuery(query) {
    var q = '"_allText,displayName","' + query + '","AND"';
    return '(fulltext(' + q + ') OR ngram(' + q + '))';
}

function rolesQuery() {
    return '_parentPath="/identity/roles"'
}

function userStoreQuery(key, type) {
    return '(userStoreKey="' + key + '"' + (type ? 'AND principalType="' + type + '")' : ')');
}
