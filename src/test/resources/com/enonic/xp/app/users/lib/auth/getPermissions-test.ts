import {
    assertEquals,
    assertJsonEquals
    // @ts-expect-error Cannot find module '/lib/xp/testing' or its corresponding type declarations.ts(2307)
} from '/lib/xp/testing';
import {
    getPermissions as _getPermissions
} from '/lib/users/auth';


export function getPermissions() {
    const result = _getPermissions({key: 'myIdProvider'});
    const expectedJson = [
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
    assertJsonEquals(expectedJson, result);
}

export function getNonExistingPermissions() {
    const result = _getPermissions({key: 'myIdProvider'});
    const length = result.length;
    assertEquals(0, length);
}
