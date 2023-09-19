import {
    nameFromKey,
    required
} from './common';
import {
    addMembers,
    getMembers,
    updateMembers
} from './principals';
import {
    createRole,
    modifyRole
} from '/lib/xp/auth';


export function create(params) {
    let key = required(params, 'key');
    let name = nameFromKey(key);
    let displayName = required(params, 'displayName');

    let createdRole = createRole({
        name: name,
        displayName: displayName,
        description: params.description
    });

    let members = params.members;
    if (members && members.length > 0) {
        addMembers(key, members);
    }

    populateMembers(createdRole);

    return createdRole;
}

export function update(params) {
    let key = required(params, 'key');
    let displayName = required(params, 'displayName');

    if (isSuperUserToBeRemovedFromAdmins(key, params.removeMembers)) {
        throw new Error('Can\'t remove Super User from Administrators');
    }

    let modifiedRole = modifyRole({
        key: key,
        editor: function (role) {
            let newRole = role;
            newRole.displayName = displayName;
            newRole.description = params.description;
            return newRole;
        }
    });

    updateMembers(key, params.addMembers, params.removeMembers);

    populateMembers(modifiedRole);

    return modifiedRole;
}

function isSuperUserToBeRemovedFromAdmins(key, removeMembers) {
    return key === 'role:system.admin' && !!removeMembers && removeMembers.some((member) => member === 'user:system:su');
}

function populateMembers(role) {
    // eslint-disable-next-line no-param-reassign
    role.member = getMembers(role.key || role._id)
        .map(function (member) {
            return member.key;
        });
}
