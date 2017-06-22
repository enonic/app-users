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

    return createdRole;
};