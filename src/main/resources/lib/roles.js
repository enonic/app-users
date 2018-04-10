var common = require('./common');
var principals = require('./principals');
var authLib = require('/lib/xp/auth');

exports.create = function createRole(params) {
    var key = common.required(params, 'key');
    var name = common.nameFromKey(key);
    var displayName = common.required(params, 'displayName');

    var createdRole = authLib.createRole({
        name: name,
        displayName: displayName,
        description: params.description
    });

    var members = params.members;
    if (members && members.length > 0) {
        principals.addMembers(key, members);
    }

    populateMembers(createdRole);

    return createdRole;
};

exports.update = function updateRole(params) {
    var key = common.required(params, 'key');
    var displayName = common.required(params, 'displayName');

    var modifiedRole = authLib.modifyRole({
        key: key,
        editor: function(role) {
            var newRole = role;
            newRole.displayName = displayName;
            newRole.description = params.description;
            return newRole;
        }
    });

    principals.updateMembers(key, params.addMembers, params.removeMembers);

    populateMembers(modifiedRole);

    return modifiedRole;
};

function populateMembers(role) {
    // eslint-disable-next-line no-param-reassign
    role.member = principals
        .getMembers(role.key || role._id)
        .map(function(member) {
            return member.key;
        });
}
