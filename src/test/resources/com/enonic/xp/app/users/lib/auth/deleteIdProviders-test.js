var t = require('/lib/xp/testing');
var auth = require('/lib/auth');

exports.deleteIdProviders = function () {

    var result = auth.deleteIdProviders({
        keys: ['invalid', 'myIdProvider']
    });

    var expected = [
        {
            idProviderKey: 'invalid',
            deleted: false,
            reason: 'IdProvider [invalid] not found'
        },
        {
            idProviderKey: 'myIdProvider',
            deleted: true,
            reason: undefined
        }
    ];

    t.assertJsonEquals(expected, result);

};

