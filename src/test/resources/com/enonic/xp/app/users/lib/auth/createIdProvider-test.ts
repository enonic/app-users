import {
    assertJsonEquals
    // @ts-expect-error Cannot find module '/lib/xp/testing' or its corresponding type declarations.ts(2307)
} from '/lib/xp/testing';
import {
    createIdProvider as _createIdProvider
} from '/lib/users/auth';


function createAndAssert(params) {
    const result = _createIdProvider(params);
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
                    name: "sessionTimeout",
                    type: "Long",
                    values: [{}]
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
                    name: 'emptySet',
                    type: 'PropertySet',
                    values: []
                },
                {
                    name: 'defaultGroups',
                    type: 'Reference',
                    values: []
                }
            ]
        }
    };

    assertJsonEquals(expectedJson, result);
}

export function createIdProvider() {
    createAndAssert({
        name: 'myIdProvider',
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
                    name: "sessionTimeout",
                    type: "Long",
                    values: [
                        {
                            v: null
                        }
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
                    name: 'emptySet',
                    type: 'PropertySet',
                    values: []
                },
                {
                    name: 'defaultGroups',
                    type: 'Reference',
                    values: []
                }
            ]
        },
        permissions: [
            {
                principal: 'user:myIdProvider:user',
                access: 'ADMINISTRATOR'
            },
            {
                principal: 'group:myIdProvider:group',
                access: 'CREATE_USERS'
            }
        ]
    });
}

export function createIdProviderByName() {
    createAndAssert({name: 'myIdProvider'});
}
