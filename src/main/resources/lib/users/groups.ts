import {
    idProviderFromKey,
    nameFromKey,
    required
} from './common';
import {
    addMembers,
    getMembers,
    getMemberships,
    updateMembers,
    updateMemberships
} from './principals';
import {
    createGroup,
    modifyGroup
} from '/lib/xp/auth';

export function create(params) {
    let key = required(params, 'key');
    let idProviderKey = idProviderFromKey(key);
    let name = nameFromKey(key);
    let displayName = required(params, 'displayName');

    let createdGroup = createGroup({
        idProvider: idProviderKey,
        name: name,
        displayName: displayName,
        description: params.description
    });

    let ms = params.members;
    if (ms && ms.length > 0) {
        addMembers(key, ms);
    }

    populateMembers(createdGroup);

    updateMemberships(key, params.memberships);

    populateMemberships(createdGroup);

    return createdGroup;
}

export function update(params) {
    let key = required(params, 'key');
    let displayName = required(params, 'displayName');

    let updatedGroup = modifyGroup({
        key: key,
        editor: function (group) {
            let newGroup = group;
            newGroup.displayName = displayName;
            newGroup.description = params.description;
            return newGroup;
        }
    });

    updateMembers(key, params.addMembers, params.removeMembers);

    populateMembers(updatedGroup);

    updateMemberships(
        key,
        params.addMemberships,
        params.removeMemberships
    );

    populateMemberships(updatedGroup);

    return updatedGroup;
}

function populateMembers(group) {
    // eslint-disable-next-line no-param-reassign
    group.member = getMembers(group.key || group._id)
        .map(function (member) {
            return member.key;
        });
}

function populateMemberships(group) {
    // eslint-disable-next-line no-param-reassign
    group.memberships = getMemberships(group.key || group._id);
}
