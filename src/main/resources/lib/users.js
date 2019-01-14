var common = require('./common');
var principals = require('./principals');
var authLib = require('/lib/xp/auth');

exports.create = function createUser(params) {
    var key = common.required(params, 'key');
    var idProviderKey = common.idProviderFromKey(key);
    var name = common.required(params, 'login');
    var displayName = common.required(params, 'displayName');
    var email = common.required(params, 'email');

    var createdUser = authLib.createUser({
        idProvider: idProviderKey,
        name: name,
        displayName: displayName,
        email: email
    });

    var mms = params.memberships;
    if (mms && mms.length > 0) {
        principals.addMemberships(key, mms);
    }

    var password = common.required(params, 'password');
    exports.updatePwd(key, password);

    populateMemberships(createdUser);

    return createdUser;
};

exports.update = function updateUser(params) {
    var key = common.required(params, 'key');
    var displayName = common.required(params, 'displayName');

    var updatedUser = authLib.modifyUser({
        key: key,
        editor: function(user) {
            var newUser = user;
            newUser.displayName = displayName;
            newUser.email = params.email;
            newUser.login = params.login;
            return newUser;
        }
    });

    principals.updateMemberships(
        key,
        params.addMemberships,
        params.removeMemberships
    );

    populateMemberships(updatedUser);

    return updatedUser;
};

exports.updatePwd = function(key, pwd) {
    var password = pwd.replace(/\s/g, '');
    try {
        authLib.changePassword({
            userKey: key,
            password: password
        });
        return true;
    } catch (e) {
        log.error('Could not update password for [' + key + ']');
        return false;
    }
};

function populateMemberships(user) {
    // eslint-disable-next-line no-param-reassign
    user.memberships = principals.getMemberships(user.key || user._id);
}
