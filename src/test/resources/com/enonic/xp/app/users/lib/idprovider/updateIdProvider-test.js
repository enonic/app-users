var t = require('/lib/xp/testing');
var idProvider = require('/lib/idprovider');

exports.updateIdProvider = function () {
  var result = idProvider.updateIdProvider({
    idProvider: 'myIdProvider',
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
      ],
    },
    permissions: [
      { principal: 'user:myIdProvider:user', access: 'ADMINISTRATOR' },
      { principal: 'group:myIdProvider:group', access: 'CREATE_USERS' },
    ],
  });

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
      ],
    },
  };

  t.assertJsonEquals(expected, result);
};

// What the params alone cannot express: an absent description and a null binding are written as absences
// rather than skipped, so a provider can be renamed back to serving no login.
exports.clearIdProvider = function () {
  var result = idProvider.updateIdProvider({
    idProvider: 'myIdProvider',
    displayName: 'Renamed',
    idProviderConfig: null,
  });

  t.assertJsonEquals({ key: 'myIdProvider', displayName: 'Renamed' }, result);
};

exports.updateNonExistingIdProvider = function () {
  t.assertNull(
    idProvider.updateIdProvider({
      idProvider: 'myIdProvider',
      displayName: 'Renamed',
      idProviderConfig: null,
    }),
  );
};
