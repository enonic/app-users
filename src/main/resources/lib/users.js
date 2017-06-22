var common = require('./common');
var principals = require('./principals');
var authLib = require('/lib/xp/auth');

exports.create = function createUser(params) {
    log.info('Create user with params: ' + JSON.stringify(params));
    var key = common.required(params, 'key');
    var userStoreKey = common.userStoreFromKey(key);

    var createdUser = authLib.createUser({
        userStore: userStoreKey,
        name: common.required(params, 'login'),
        displayName: common.required(params, 'displayName'),
        email: common.required(params, 'email')
    });

    log.info('createdUser: ' + JSON.stringify(createdUser));

    var mms = params.memberships;
    if (createdUser && mms && mms.length > 0) {
        var updatedMms = principals.addMemberships(key, mms);
        log.info('Added memberships for [' + key + '] in ' + JSON.stringify(updatedMms))
    }

    authLib.changePassword({
        userKey: createdUser.key || createdUser._id,
        password: common.required(params, 'password')
    });

    return createdUser;
};

exports.update = function updateUser(params) {
    log.info('Update user with params: ' + JSON.stringify(params));
    var key = common.required(params, 'key');

    var updatedUser = authLib.modifyUser({
        key: key,
        editor: function (user) {
            user.displayName = params.displayName;
            user.email = params.email;
            user.login = params.login;
            return user;
        }
    });

    log.info('updatedUser: ' + JSON.stringify(updatedUser));

    var addMs = params.addMemberships;
    if (addMs && addMs.length > 0) {
        var addedMs = principals.addMemberships(key, addMs);
        log.info('added memberships for [' + key + '] to ' + JSON.stringify(addedMs));
    }

    var removeMs = params.removeMemberships;
    if (removeMs && removeMs.length > 0) {
        var removedMs = principals.removeMemberships(key, removeMs);
        log.info('removed memberships for [' + key + '] from ' + JSON.stringify(removedMs));
    }

    updatedUser['memberships'] = principals.getMemberships(key);

    return updatedUser;
};