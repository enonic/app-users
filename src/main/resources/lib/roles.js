var common = require('./common');
var principals = require('./principals');

exports.create = function createRole(params) {

    var key = common.required(params, 'key');
    var name = common.nameFromKey(key);

    var createdRole = common.create({
        _parentPath: '/identity/roles',
        _name: name,
        key: key,   //TODO: save key to a separate field because we can't save it as id
        displayName: common.required(params, 'displayName'),
        description: params.description,
        principalType: principals.Type.ROLE
    });

    log.info('createdRole: ' + JSON.stringify(createdRole));

    var members = params.members;
    if (members && members.length > 0) {
        principals.addMembers(key, members);
    }

    populateMembers(createdRole);

    return createdRole;
};

exports.update = function updateRole(params) {
    log.info('Update role with params: ' + JSON.stringify(params));
    var key = common.required(params, 'key');

    var updatedRole = common.update({
        key: '/identity/roles/' + common.nameFromKey(key),
        editor: function (role) {
            role.displayName = params.displayName;
            role.description = params.description;
            return role;
        }
    });

    log.info('Updated role: ' + JSON.stringify(updatedRole));

    principals.updateMembers(key, params.addMembers, params.removeMembers);

    populateMembers(updatedRole);

    return updatedRole;
};

function populateMembers(role) {
    role['member'] = principals.getMembers(role.key || role._id).map(function (member) {
        return member.key;
    });
}