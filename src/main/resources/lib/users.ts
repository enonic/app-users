import {
    idProviderFromKey,
    required
} from './common';
import {
    addMemberships,
    getMemberships,
    updateMemberships
} from './principals';
var authLib = require('/lib/xp/auth');
// @ts-expect-error Cannot find module '/lib/util' or its corresponding type declarations.ts(2307)
import { forceArray } from '/lib/util';

export function create(params) {
    var key = required(params, 'key');
    var idProviderKey = idProviderFromKey(key);
    var name = required(params, 'login');
    var displayName = required(params, 'displayName');
    var email = required(params, 'email');

    var createdUser = authLib.createUser({
        idProvider: idProviderKey,
        name: name,
        displayName: displayName,
        email: email,
    });

    var mms = params.memberships;
    if (mms && mms.length > 0) {
        addMemberships(key, mms);
    }

    var password = required(params, 'password');
    updatePwd(key, password);

    populateMemberships(createdUser);

    return createdUser;
};

export function update(params) {
    var key = required(params, 'key');
    var displayName = required(params, 'displayName');

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

    updateMemberships(
        key,
        params.addMemberships,
        params.removeMemberships
    );

    populateMemberships(updatedUser);

    return updatedUser;
};

export function updatePwd(key, pwd) {
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

export function removePublicKey(params) {
    const userKey = required(params, 'userKey');
    const kid = required(params, 'kid');

    const updatedProfile = authLib.modifyProfile({
        key: userKey,
        editor: function (profile) {
            const publicKeys = forceArray(profile.publicKeys);
            profile.publicKeys = publicKeys.filter(key => key.kid !== kid);
            return profile;
        }
    });

    return forceArray(updatedProfile.publicKeys).filter(key => key.kid === kid).length === 0;
};

export function addPublicKey(params) {
    const userKey = required(params, 'userKey');
    const publicKey = required(params, 'publicKey');
    const label = params.label;

    const kidGenerator = __.newBean('com.enonic.xp.app.users.handler.KidGeneratorHandler') as {
        generateKid: (publicKey: string) => string
    };
    const kid = kidGenerator.generateKid(publicKey);

    const updatedProfile = authLib.modifyProfile({
        key: userKey,
        editor: function (profile) {
            const publicKeys = forceArray(profile.publicKeys);

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

    return forceArray(updatedProfile.publicKeys).filter(key => key.kid === kid)[0];
};

function populateMemberships(user) {
    // eslint-disable-next-line no-param-reassign
    user.memberships = getMemberships(user.key || user._id);
}
