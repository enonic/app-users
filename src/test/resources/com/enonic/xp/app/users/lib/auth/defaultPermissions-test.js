var t = require('/lib/xp/testing');
var auth = require('/lib/auth');

exports.defaultPermissions = function () {

    var result = auth.defaultPermissions();

    var expectedJson = [
        {
            principal: {
                'type': 'user',
                'key': 'user:myIdProvider:user',
                'displayName': 'User 1',
                'modifiedTime': '1970-01-01T00:00:00Z',
                'disabled': false,
                'email': 'user1@enonic.com',
                'login': 'user1',
                'idProvider': 'myIdProvider'
            },
            access: 'ADMINISTRATOR'
        }
    ];

    t.assertJsonEquals(expectedJson, result);

};
