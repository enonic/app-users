var common = require('./common');
var authLib = require('/lib/xp/auth');

exports.create = function createGroup(params) {

    var key = common.required(params, 'key');
    var userStoreKey = common.userStoreFromKey(key);
    var name = common.nameFromKey(key);

    var createdGroup = authLib.createGroup({
        userStore: userStoreKey,
        name: name,
        displayName: common.required(params, 'displayName'),
        description: params.description
    });

    log.info('createdGroup: ' + JSON.stringify(createdGroup));

    return createdGroup;
};