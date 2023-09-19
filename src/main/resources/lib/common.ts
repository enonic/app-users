import type {
    Aggregations,
    QueryNodeParams
} from '/lib/xp/node';


import {connect} from '/lib/xp/node';


const namePrettyfier = Java.type('com.enonic.xp.name.NamePrettyfier');

const REPO_NAME = 'system-repo';
const REPO_BRANCH = 'master';
const MAX_COUNT = -1;
const SYSTEM_ADMIN = 'role:system.admin';

export const enum UserItemType {
    ROLE = 'ROLE',
    USER = 'USER',
    GROUP = 'GROUP',
    ID_PROVIDER = 'ID_PROVIDER'
}

export const ALL_USER_ITEM_TYPES = [
    UserItemType.ROLE,
    UserItemType.USER,
    UserItemType.GROUP,
    UserItemType.ID_PROVIDER
];

export const PrincipalType = {
    ROLE: 'ROLE',
    USER: 'USER',
    GROUP: 'GROUP',
    all: () => {
        return [PrincipalType.ROLE, PrincipalType.USER, PrincipalType.GROUP];
    }
};

export function singleOrArray(value) {
    return value && value.length === 1 ? value[0] : value;
}

export function isString(str) {
    return (typeof str === 'string') || (str instanceof String);
}

export function refresh(repo) {
    newConnection(repo).refresh('SEARCH');
}

export function required(params, name, skipTrimming?: boolean) {
    let value = params[name];
    if (value === undefined || value === null) {
        throw new Error("Parameter '" + name + "' is required");
    }
    if (!skipTrimming && isString(value)) {
        return value.trim();
    }
    return value;
}

export default function (params, name, defaultValue) {
    let value = params[name];
    if (value === undefined || value === null) {
        return defaultValue;
    }
    return value;
}

export function getByIds(ids, repo?: string) {
    return newConnection(repo).get(ids);
}

function _delete(ids, repo) {
    return newConnection(repo).delete(ids);
}
export {_delete as delete};

export function keysToPaths(keys) {
    return keys.map(function (key) {
        if (isIdProvider(key)) {
            return '/identity/' + idProviderFromKey(key);
        }
        if (isUser(key)) {
            return (
                '/identity/' +
                idProviderFromKey(key) +
                '/users/' +
                nameFromKey(key)
            );
        }
        if (isGroup(key)) {
            return (
                '/identity/' +
                idProviderFromKey(key) +
                '/groups/' +
                nameFromKey(key)
            );
        }
        if (isRole(key)) {
            return '/identity/roles/' + nameFromKey(key);
        }
        return '';
    });
}

export function isUser(key) {
    return typeFromKey(key).toUpperCase() === PrincipalType.USER;
}

export function isGroup(key) {
    return typeFromKey(key).toUpperCase() === PrincipalType.GROUP;
}

export function isRole(key) {
    return typeFromKey(key).toUpperCase() === PrincipalType.ROLE;
}

export function isIdProvider(key) {
    return splitKey(key).length === 1;
}

export function isSystemAdmin(key) {
    return key === SYSTEM_ADMIN;
}

export function createQueryByField(field, values) {
    if (!values || !field) {
        return null;
    }
    if (values instanceof Array) {
        return String(field) + ' IN (' + serializeValues(values) + ')';
    }
    return String(field) + '=' + serializeValue(values);
}

function serializeValues(values) {
    return values ? values.map(serializeValue).join(',') : '';
}

function serializeValue(value) {
    return typeof value === 'string' ? '"' + value + '"' : value;
}

export function extensionFromMimeType(mimeType) {
    let ext = '';
    if (mimeType.indexOf('image/png') > -1) {
        ext = '.png';
    } else if (
        mimeType.indexOf('image/jpg') > -1 ||
        mimeType.indexOf('image/jpeg') > -1
    ) {
        ext = '.jpg';
    } else if (mimeType.indexOf('image/gif') > -1) {
        ext = '.gif';
    } else if (mimeType.indexOf('image/svg+xml') > -1) {
        ext = '.svg';
    }
    return ext;
}

function splitKey(key) {
    let parts = key && key.split(':');
    let isRoleType =
        parts &&
        parts.length === 2 &&
        parts[0].toUpperCase() === PrincipalType.ROLE;
    let isIdProviderType = parts && parts.length === 1;
    if (!isRoleType && !isIdProviderType && !(parts && parts.length === 3)) {
        throw new Error('Invalid principal key [' + key + ']');
    }
    return parts;
}

export function idProviderFromKey(key) {
    let parts = splitKey(key);
    if (parts[0].toUpperCase() === PrincipalType.ROLE) {
        throw new Error(
            "Principal keys of type role can't have idprovider [" + key + ']'
        );
    }
    return parts.length === 1 ? parts[0] : parts[1];
}

export function nameFromKey(key) {
    let parts = splitKey(key);
    if (parts.length === 1) {
        throw new Error("Key don't have name [" + key + ']');
    }
    return parts[0].toUpperCase() !== PrincipalType.ROLE ? parts[2] : parts[1];
}

export function typeFromKey(key) {
    let parts = splitKey(key);
    if (parts.length === 1) {
        throw new Error("Key don't have type [" + key + ']');
    }
    return parts[0];
}

export function prettifyName(text) {
    return namePrettyfier.create(text);
}

export function querySingle(query, repo) {
    let results = queryAll({
        start: 0,
        count: 1,
        query: query
    }, repo);

    return results.total === 1 ? results.hits[0] : null;
}

export function create(params, repo) {
    return newConnection(repo).create(params);
}

export function update(params, repo) {
    return newConnection(repo).modify(params);
}

export function queryAll<AggregationInput extends Aggregations = never>({
    aggregations,
    count,
    query,
    sort,
    start = 0
}: {
    aggregations?: AggregationInput
    count?: number
    query?: QueryNodeParams['query']
    sort?: QueryNodeParams['sort']
    start?: number
}, repo?: string) {
    const finalCount = count == null ? MAX_COUNT : count;
    const repoConn = newConnection(repo);
    const queryResult = repoConn.query({
        start,
        count: finalCount,
        query,
        sort,
        aggregations
    });
    const hits = queryResult.count > 0
        ? [].concat(repoConn.get(queryResult.hits.map((hit) => hit.id)))
        : [];
    return {
        total: queryResult.total,
        start,
        count,
        hits,
        aggregations: queryResult.aggregations
    };
}

export function newConnection(repo: string, branch?: string) {
    return connect({
        repoId: repo || REPO_NAME,
        branch: branch || REPO_BRANCH
    });
}
