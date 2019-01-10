var t = require('/lib/xp/testing');
var auth = require('/lib/auth');

exports.getPermissions = function () {

    var result = auth.getPermissions({key: 'myIdProvider'});

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
        },
        {
            principal: {
                'type': 'group',
                'key': 'group:myIdProvider:group',
                'displayName': 'Group A',
                'modifiedTime': '1970-01-01T00:00:00Z',
                'description': 'description'
            },
            access: 'CREATE_USERS'
        }
    ];

    t.assertJsonEquals(expectedJson, result);

};

exports.getNonExistingPermissions = function () {

    var result = auth.getPermissions({key: 'myIdProvider'});

    var length = result.length;

    t.assertEquals(0, length);

};
