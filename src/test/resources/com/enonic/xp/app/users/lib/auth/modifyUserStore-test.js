var t = require('/lib/xp/testing');
var auth = require('/lib/auth');

exports.modifyUserStore = function () {
    var expectedJson = {
        key: 'myUserStore',
        displayName: 'User store test',
        description: 'User store used for testing',
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

    var result = auth.modifyUserStore({
        key: 'myUserStore',
        editor: function (userStore) {
            var newUserStore = userStore;
            newUserStore.displayName = 'User store test';
            newUserStore.description = 'User store used for testing';
            newUserStore.idProviderConfig = {
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
            return newUserStore
        },
        permissions: [
            {
                principal: 'user:myUserStore:user',
                access: 'ADMINISTRATOR'
            },
            {
                principal: 'group:myUserStore:group',
                access: 'CREATE_USERS'
            }
        ]
    });

    t.assertJsonEquals(expectedJson, result);
};

exports.modifyUserStoreWithNullValues = function () {
    var expectedJson = {
        key: 'myUserStore',
        displayName: 'User store test'
    };

    var result = auth.modifyUserStore({
        key: 'myUserStore',
        editor: function (userStore) {
            userStore.description = null;
            userStore.idProviderConfig = null;
            return userStore;
        }
    });

    t.assertJsonEquals(expectedJson, result);
};
