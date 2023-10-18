import {
    idProviderFromKey,
    required
} from './common';
import {
    addMemberships,
    getMemberships,
    updateMemberships
} from './principals';
import {
    changePassword,
    createUser,
    modifyProfile,
    modifyUser
} from '/lib/xp/auth';
import {forceArray} from '/lib/users/util';

export function create(params) {
    let key = required(params, 'key');
    let idProviderKey = idProviderFromKey(key);
    let name = required(params, 'login');
    let displayName = required(params, 'displayName');
    let email = required(params, 'email');

    let createdUser = createUser({
        idProvider: idProviderKey,
        name: name,
        displayName: displayName,
        email: email,
    });

    let mms = params.memberships;
    if (mms && mms.length > 0) {
        addMemberships(key, mms);
    }

    let password = required(params, 'password');
    updatePwd(key, password);

    populateMemberships(createdUser);

    return createdUser;
}

export function update(params) {
    let key = required(params, 'key');
    let displayName = required(params, 'displayName');

    let updatedUser = modifyUser({
        key: key,
        editor: function (user) {
            let newUser = user;
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
}

export function updatePwd(key, pwd) {
    let password = pwd.replace(/\s/g, '');
    try {
        changePassword({
            userKey: key,
            password: password
        });
        return true;
    } catch (e) {
        log.error('Could not update password for [' + key + ']');
        return false;
    }
}

export function removePublicKey(params) {
    const userKey = required(params, 'userKey');
    const kid = required(params, 'kid');

    const updatedProfile = modifyProfile({
        key: userKey,
        editor: function (profile) {
            const publicKeys = forceArray(profile.publicKeys);
            profile.publicKeys = publicKeys.filter(key => key.kid !== kid);
            return profile;
        }
    });

    return forceArray(updatedProfile.publicKeys).filter(key => key.kid === kid).length === 0;
}

export function addPublicKey(params) {
    const userKey = required(params, 'userKey');
    const publicKey = required(params, 'publicKey');
    const label = params.label;

    const kidGenerator = __.newBean<{
        generateKid: (publicKey: string) => string
    }>('com.enonic.xp.app.users.handler.KidGeneratorHandler');
    const kid = kidGenerator.generateKid(publicKey);

    const updatedProfile = modifyProfile({
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
}

function populateMemberships(user) {
    // eslint-disable-next-line no-param-reassign
    user.memberships = getMemberships(user.key || user._id);
}
