var t = require('/lib/xp/testing');
var auth = require('/lib/auth');

exports.deleteUserStores = function () {

    var result = auth.deleteUserStores({
        keys: ['invalid', 'myUserStore']
    });

    var expected = [
        {
            userStoreKey: 'invalid',
            deleted: false,
            reason: 'UserStore [invalid] not found'
        },
        {
            userStoreKey: 'myUserStore',
            deleted: true,
            reason: undefined
        }
    ];

    t.assertJsonEquals(expected, result);

};

