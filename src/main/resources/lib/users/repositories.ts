import {
    getByIds,
    queryAll
} from './common';

export function getById(id) {
    return getByIds(id);
}

export function list(search, start, count, sort) {
    let queryResult = queryAll({
        query: createRepoQuery(search),
        start: start,
        count: count,
        sort: sort
    });
    return queryResult.hits;
}

function createRepoQuery(search) {
    return '_parentPath="/repository"' + (search ? ' AND ngram("_name","' + search + '")' : '');
}
