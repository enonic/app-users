var common = require('./common');

module.exports = {
    getByKey: function (key) {
        return common.querySingle(constructUserstoreQuery(key));
    },
    list: function (start, count, sort) {
        return common.queryAll({
            query: constructUserstoreQuery(),
            start: start,
            count: count,
            sort: sort
        });
    }
};

function constructUserstoreQuery(key) {
    var query;
    if (key) {
        query = '_id=\"' + key + '"';
    } else {
        query = '_parentPath="/identity"';
    }
    return query;
}
