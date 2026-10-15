var t = require('/lib/xp/testing');
var idProvider = require('/lib/idprovider');

exports.getIdProvider = function () {
  var result = idProvider.getIdProvider({ idProvider: 'myIdProvider' });

  var expected = {
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
          // A null of a type that is not nullable stays as an entry with no value.
          name: 'sessionTimeout',
          type: 'Long',
          values: [{}],
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
          // A null Reference is left out of values entirely, unlike the null Long above.
          name: 'defaultGroups',
          type: 'Reference',
          values: [],
        },
      ],
    },
  };

  t.assertJsonEquals(expected, result);
};

exports.getNonExistingIdProvider = function () {
  t.assertNull(idProvider.getIdProvider({ idProvider: 'myIdProvider' }));
};
