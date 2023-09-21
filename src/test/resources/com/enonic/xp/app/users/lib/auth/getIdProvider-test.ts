import {
    assertEquals,
    assertJsonEquals
    // @ts-expect-error Cannot find module '/lib/xp/testing' or its corresponding type declarations.ts(2307)
} from '/lib/xp/testing';
import {
    getIdProvider as _getIdProvider
} from '/lib/users/auth';


export function getIdProvider() {
    const result = _getIdProvider({key: 'myIdProvider'});
    const expectedJson = {
        key: 'myIdProvider',
        displayName: 'Id provider test',
        description: 'Id provider used for testing',
        idProviderConfig: {
            applicationKey: 'com.enonic.app.test',
            config: [
                {
                    name: 'title',
                    type: 'String',
                    values: [
                        {
                            v: 'App Title'
                        }
                    ]
                },
                {
                    name: 'avatar',
                    type: 'Boolean',
                    values: [
                        {
                            v: true
                        }
                    ]
                },
                {
                    'name': 'sessionTimeout',
                    'type': 'Long',
                    'values': [
                        {}
                    ]
                },
                {
                    name: 'forgotPassword',
                    type: 'PropertySet',
                    values: [
                        {
                            set: [
                                {
                                    name: 'email',
                                    type: 'String',
                                    values: [
                                        {
                                            v: 'noreply@example.com'
                                        }
                                    ]
                                },
                                {
                                    name: 'site',
                                    type: 'String',
                                    values: [
                                        {
                                            v: 'MyWebsite'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    'name': 'emptySet',
                    'type': 'PropertySet',
                    'values': []
                },
                {
                    'name': 'defaultGroups',
                    'type': 'Reference',
                    'values': []
                }
            ]
        }
    };
    assertJsonEquals(expectedJson, result);
}

export function getNonExistingIdProvider() {
    const result = _getIdProvider({key: 'myIdProvider'});
    assertEquals(null, result);
}
