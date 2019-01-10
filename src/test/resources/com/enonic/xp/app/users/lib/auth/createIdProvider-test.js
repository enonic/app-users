var t = require('/lib/xp/testing');
var auth = require('/lib/auth');

function createAndAssert(params) {

    var result = auth.createIdProvider(params);

    var expectedJson = {
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

    t.assertJsonEquals(expectedJson, result);
}

exports.createIdProvider = function () {
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
};

exports.createIdProviderByName = function () {
    createAndAssert({name: 'myIdProvider'});
};
