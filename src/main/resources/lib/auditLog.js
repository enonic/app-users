var eventLib = require('/lib/xp/event');
var authLib = require('/lib/xp/auth');
var common = require('./common');

var AUDIT_EVENT = 'AUDIT_EVENT';
var ACTIONS = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
};
var TYPES = {
    USER: 'USER',
    GROUP: 'GROUP',
    ROLE: 'ROLE',
    USERSTORE: 'USERSTORE'
};

var notifyEvent = function (itemKeys, action, extra) {
    var user = authLib.getUser();

    eventLib.send({
        type: AUDIT_EVENT,
        distributed: false,
        data: {
            auditData: JSON.stringify({
                user: {
                    id: user.key,
                    displayName: user.displayName
                },
                app: {
                    name: app.name,
                    version: app.version
                },
                items: [].concat(itemKeys).map(function (itemKey) {
                    return {
                        type: common.typeFromKey(itemKey),
                        id: itemKey,
                        action: action,
                        extra: extra
                    }
                })
            })
        }
    })
};

module.exports = {
    notify: notifyEvent,
    ACTIONS: ACTIONS,
    TYPES: TYPES
};
