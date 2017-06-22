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
        var updatedMs = principals.addMembers(key, ms);
        log.info('Added members for [' + key + '] ' + JSON.stringify(updatedMs));
    }

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

    var addMs = params.addMembers;
    if (addMs && addMs.length > 0) {
        var addedMs = principals.addMembers(key, addMs);
        log.info('added to [' + key + '] members ' + JSON.stringify(addedMs));
    }

    var removeMs = params.removeMembers;
    if (removeMs && removeMs.length > 0) {
        var removedMs = principals.removeMembers(key, removeMs);
        log.info('removed from [' + key + '] members ' + JSON.stringify(removedMs));
    }

    updatedGroup['member'] = principals.getMembers(key).map(function (member) {
        return member.key;
    });

    return updatedGroup;
};