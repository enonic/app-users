var t = require('/lib/xp/testing');
var idProvider = require('/lib/idprovider');

exports.createIdProvider = function () {
  var result = idProvider.createIdProvider({
    key: 'myIdProvider',
    displayName: 'Id provider test',
    description: 'Id provider used for testing',
    idProviderConfig: {
      applicationKey: 'com.enonic.app.test',
      config: [
        {
          name: 'title',
          type: 'String',
          values: [{ v: 'App Title' }],
        },
        {
          name: 'avatar',
          type: 'Boolean',
          values: [{ v: true }],
        },
        {
          name: 'sessionTimeout',
          type: 'Long',
          values: [{ v: null }],
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
                  values: [{ v: 'noreply@example.com' }],
                },
                {
                  name: 'site',
                  type: 'String',
                  values: [{ v: 'MyWebsite' }],
                },
              ],
            },
          ],
        },
        {
          name: 'emptySet',
          type: 'PropertySet',
          values: [],
        },
        {
          name: 'defaultGroups',
          type: 'Reference',
          values: [],
        },
      ],
    },
    permissions: [
      // The user is gone by the time this is written, and the entry naming it is dropped rather than
      // stored — the Java side asserts only the group survives.
      { principal: 'user:myIdProvider:user', access: 'ADMINISTRATOR' },
      { principal: 'group:myIdProvider:group', access: 'CREATE_USERS' },
    ],
  });

  t.assertEquals('myIdProvider', result.key);
  t.assertEquals('Id provider test', result.displayName);
};

exports.createUnboundIdProvider = function () {
  var result = idProvider.createIdProvider({
    key: 'myIdProvider',
    displayName: 'Id provider test',
  });

  t.assertNotNull(result);
};
