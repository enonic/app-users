var common = require('./common');

module.exports = {
    getByIds: function (ids) {
        return common.getByIds(ids);
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

function constructUserstoreQuery() {
    return '_parentPath="/identity"';
}
