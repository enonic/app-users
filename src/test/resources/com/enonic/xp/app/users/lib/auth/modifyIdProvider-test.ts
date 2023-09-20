import {
    assertJsonEquals
    // @ts-expect-error Cannot find module '/lib/xp/testing' or its corresponding type declarations.ts(2307)
} from '/lib/xp/testing';
import {
    modifyIdProvider as _modifyIdProvider
} from '/lib/users/auth';


export function modifyIdProvider() {
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

    const result = _modifyIdProvider({
        key: 'myIdProvider',
        editor: function (idProvider) {
            var newIdProvider = idProvider;
            newIdProvider.displayName = 'Id provider test';
            newIdProvider.description = 'Id provider used for testing';
            newIdProvider.idProviderConfig = {
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
            };
            return newIdProvider
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

    assertJsonEquals(expectedJson, result);
}

export function modifyIdProviderWithNullValues() {
    const expectedJson = {
        key: 'myIdProvider',
        displayName: 'Id provider test'
    };

    const result = _modifyIdProvider({
        key: 'myIdProvider',
        editor: function (idProvider) {
            idProvider.description = null;
            idProvider.idProviderConfig = null;
            return idProvider;
        }
    });

    assertJsonEquals(expectedJson, result);
}
