var common = require('./common');
var principals = require('./principals');
var authLib = require('/lib/xp/auth');

exports.create = function createGroup(params) {
    log.info('Create group with params: ' + JSON.stringify(params));
    var key = common.required(params, 'key');
    var userStoreKey = common.userStoreFromKey(key);
    var name = common.nameFromKey(key);

    var createdGroup = authLib.createGroup({
        userStore: userStoreKey,
        name: name,
        displayName: common.required(params, 'displayName'),
        description: params.description
    });

    var ms = params.members;
    if (ms && ms.length > 0) {
        principals.addMembers(key, ms);
    }

    populateMembers(createdGroup);

    principals.updateMemberships(key, params.memberships);

    populateMemberships(createdGroup);

    log.info('createdGroup: ' + JSON.stringify(createdGroup));

    return createdGroup;
};

exports.update = function updateGroup(params) {
    log.info('Update group with params: ' + JSON.stringify(params));
    var key = common.required(params, 'key');

    var updatedGroup = authLib.modifyGroup({
        key: key,
        editor: function(group) {
            var newGroup = group;
            newGroup.displayName = params.displayName;
            newGroup.description = params.description;
            return newGroup;
        }
    });

    principals.updateMembers(key, params.addMembers, params.removeMembers);

    populateMembers(updatedGroup);

    principals.updateMemberships(
        key,
        params.addMemberships,
        params.removeMemberships
    );

    populateMemberships(updatedGroup);

    log.info('updatedGroup: ' + JSON.stringify(updatedGroup));

    return updatedGroup;
};

function populateMembers(group) {
    // eslint-disable-next-line no-param-reassign
    group.member = principals
        .getMembers(group.key || group._id)
        .map(function(member) {
            return member.key;
        });
}

function populateMemberships(group) {
    // eslint-disable-next-line no-param-reassign
    group.memberships = principals.getMemberships(group.key || group._id);
}
