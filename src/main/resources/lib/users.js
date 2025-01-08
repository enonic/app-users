var common = require('./common');
var principals = require('./principals');
var authLib = require('/lib/xp/auth');
var utilLib = require('/lib/util');

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
        email: email,
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
        editor: function (user) {
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

exports.updatePwd = function (key, pwd) {
    const password = pwd ? pwd.replace(/\s/g, '') : null;
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

exports.removePublicKey = function (params) {
    const userKey = common.required(params, 'userKey');
    const kid = common.required(params, 'kid');

    const updatedProfile = authLib.modifyProfile({
        key: userKey,
        editor: function (profile) {
            const publicKeys = utilLib.forceArray(profile.publicKeys);
            profile.publicKeys = publicKeys.filter(key => key.kid !== kid);
            return profile;
        }
    });

    return utilLib.forceArray(updatedProfile.publicKeys).filter(key => key.kid === kid).length === 0;
};

exports.addPublicKey = function (params) {
    const userKey = common.required(params, 'userKey');
    const publicKey = common.required(params, 'publicKey');
    const label = params.label;

    const kidGenerator = __.newBean('com.enonic.xp.app.users.handler.KidGeneratorHandler');
    const kid = kidGenerator.generateKid(publicKey);

    const updatedProfile = authLib.modifyProfile({
        key: userKey,
        editor: function (profile) {
            const publicKeys = utilLib.forceArray(profile.publicKeys);

            const existingKeys = publicKeys.filter(key => key.kid === kid);
            if (existingKeys.length > 0) {
                throw new Error(`Public key with kid ${kid} already exists for user ${userKey}`);
            }

            publicKeys.push({
                kid,
                publicKey,
                algorithm: 'RSA',
                label,
                creationTime: new Date().toISOString(),
            });

            profile.publicKeys = publicKeys;
            return profile;
        }
    });

    return utilLib.forceArray(updatedProfile.publicKeys).filter(key => key.kid === kid)[0];
};

function populateMemberships(user) {
    // eslint-disable-next-line no-param-reassign
    user.memberships = principals.getMemberships(user.key || user._id);
}
