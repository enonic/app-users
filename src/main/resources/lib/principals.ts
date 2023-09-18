import {
    createQueryByField,
    PrincipalType,
    queryAll,
    singleOrArray
} from './common';
import { deletePrincipal } from '/lib/xp/auth';


export function getByKeys(keys) {
    var noKeys = keys == null || (keys instanceof Array && keys.length === 0);

    // users and groups have their keys as _id, but roles have them stored as key
    var principals = noKeys ? [] : queryAll({
        query:
            createQueryByField('_id', keys) +
            ' OR ' +
            createQueryByField('key', keys)
    }).hits;

    return keys instanceof Array ? principals : singleOrArray(principals);
}

export function getMemberships(key, transitive) {
    return authLib.getMemberships(key, transitive);
}

export function addMemberships(key, memberships) {
    var addMms = [].concat(memberships).map(function(current) {
        addMembers(current, key);
        return current;
    });
    return addMms;
}

export function removeMemberships(key, memberships) {
    var removeMms = [].concat(memberships).map(function(current) {
        removeMembers(current, key);
        return current;
    });
    return removeMms;
}

export function updateMemberships(key, addMms, removeMms) {
    if (addMms && addMms.length > 0) {
        addMemberships(key, addMms);
    }
    if (removeMms && removeMms.length > 0) {
        removeMemberships(key, removeMms);
    }
}

export function getMembers(key) {
    return authLib.getMembers(key);
}

export function addMembers(key, members) {
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
}

export function removeMembers(key, members) {
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
}

export function updateMembers(key, addMs, removeMs) {
    if (addMs && addMs.length > 0) {
        addMembers(key, addMs);
    }
    if (removeMs && removeMs.length > 0) {
        removeMembers(key, removeMs);
    }
}

export function list(idProviderKey, types, query, start, count, sort) {
    return queryAll({
        query: createPrincipalQuery(idProviderKey, types, query),
        start: start,
        count: count,
        sort: sort
    });
}

function _delete(keys) {
    return keys.map(function(key) {
        try {
            var deleted = deletePrincipal(key);
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
}
export { _delete as delete };

export const Type = PrincipalType;


function createPrincipalQuery(idProviderKey, types, query) {
    var q = query ? textQuery(query) : '';
    if (!types) {
        q += (q ? ' AND ' : '') + idProviderQuery(idProviderKey);
    } else {
        var tq = '';
        types.forEach(function(type, index) {
            var add;
            switch (type) {
                case PrincipalType.ROLE:
                    add = rolesQuery();
                    break;
                case PrincipalType.GROUP:
                case PrincipalType.USER:
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

function idProviderQuery(key, type?: string) {
    return (
        '(userStoreKey="' +
        key +
        '"' +
        (type ? 'AND principalType="' + type + '")' : ')')
    );
}
