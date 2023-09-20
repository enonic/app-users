import {
    assertJsonEquals
    // @ts-expect-error Cannot find module '/lib/xp/testing' or its corresponding type declarations.ts(2307)
} from '/lib/xp/testing';
import {
    deleteIdProviders as _deleteIdProviders
} from '/lib/users/auth';


export function deleteIdProviders() {
    const result = _deleteIdProviders({
        keys: ['invalid', 'myIdProvider']
    });
    const expected = [
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
    assertJsonEquals(expected, result);
}

