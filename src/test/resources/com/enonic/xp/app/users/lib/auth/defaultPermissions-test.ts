import {
    assertJsonEquals
    // @ts-expect-error Cannot find module '/lib/xp/testing' or its corresponding type declarations.ts(2307)
} from '/lib/xp/testing';
import {
    defaultPermissions as _defaultPermissions
} from '/lib/users/auth';


export function defaultPermissions() {
    const result = _defaultPermissions();
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
        }
    ];
    assertJsonEquals(expectedJson, result);
}
