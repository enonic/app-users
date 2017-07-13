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

    log.info('createdGroup: ' + JSON.stringify(createdGroup));

    var ms = params.members;
    if (ms && ms.length > 0) {
        principals.addMembers(key, ms);
    }

    populateMembers(createdGroup);

    return createdGroup;
};

exports.update = function updateGroup(params) {
    log.info('Update group with params: ' + JSON.stringify(params));
    var key = common.required(params, 'key');

    var updatedGroup = authLib.modifyGroup({
        key: key,
        editor: function (group) {
            group.displayName = params.displayName;
            group.description = params.description;
            return group;
        }
    });

    log.info('updatedGroup: ' + JSON.stringify(updatedGroup));

    principals.updateMembers(key, params.addMembers, params.removeMembers);

    populateMembers(updatedGroup);

    return updatedGroup;
};

function populateMembers(group) {
    group['member'] = principals.getMembers(group.key || group._id).map(function (member) {
        return member.key;
    });
}