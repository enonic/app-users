var common = require('./common');
var authLib = require('/lib/xp/auth');

exports.create = function createUser(params) {

    var key = common.required(params, 'key');
    var userStoreKey = common.userStoreFromKey(key);

    var createdUser = authLib.createUser({
        userStore: userStoreKey,
        name: common.required(params, 'login'),
        displayName: common.required(params, 'displayName'),
        email: common.required(params, 'email')
    });

    log.info('createdUser: ' + JSON.stringify(createdUser));

    authLib.changePassword({
        userKey: createdUser.key || createdUser._id,
        password: common.required(params, 'password')
    });

    return createdUser;
};