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
var authLib = require('/lib/xp/auth');

export function create(params) {
    var key = required(params, 'key');
    var idProviderKey = idProviderFromKey(key);
    var name = nameFromKey(key);
    var displayName = required(params, 'displayName');

    var createdGroup = authLib.createGroup({
        idProvider: idProviderKey,
        name: name,
        displayName: displayName,
        description: params.description
    });

    var ms = params.members;
    if (ms && ms.length > 0) {
        addMembers(key, ms);
    }

    populateMembers(createdGroup);

    updateMemberships(key, params.memberships);

    populateMemberships(createdGroup);

    return createdGroup;
};

export function update(params) {
    var key = required(params, 'key');
    var displayName = required(params, 'displayName');

    var updatedGroup = authLib.modifyGroup({
        key: key,
        editor: function(group) {
            var newGroup = group;
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
};

function populateMembers(group) {
    // eslint-disable-next-line no-param-reassign
    group.member = getMembers(group.key || group._id)
        .map(function(member) {
            return member.key;
        });
}

function populateMemberships(group) {
    // eslint-disable-next-line no-param-reassign
    group.memberships = getMemberships(group.key || group._id);
}
