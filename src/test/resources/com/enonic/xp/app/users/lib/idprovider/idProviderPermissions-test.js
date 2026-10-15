var t = require('/lib/xp/testing');
var idProvider = require('/lib/idprovider');

exports.getIdProviderPermissions = function () {
  var result = idProvider.getIdProviderPermissions({ idProvider: 'myIdProvider' });

  var expected = [
    {
      principal: {
        key: 'user:myIdProvider:user',
        type: 'user',
        displayName: 'User 1',
      },
      access: 'ADMINISTRATOR',
    },
    {
      principal: {
        key: 'group:myIdProvider:group',
        type: 'group',
        displayName: 'Group A',
      },
      access: 'CREATE_USERS',
    },
  ];

  t.assertJsonEquals(expected, result);
};

exports.getNonExistingIdProviderPermissions = function () {
  t.assertNull(idProvider.getIdProviderPermissions({ idProvider: 'myIdProvider' }));
};

exports.defaultIdProviderPermissions = function () {
  var result = idProvider.defaultIdProviderPermissions();

  // The access levels come from the seeded list; which three principals it names is asserted in Java,
  // since only the ones the instance still holds come back as names.
  var expected = [
    {
      principal: {
        key: 'role:system.admin',
        type: 'role',
        displayName: 'Administrator',
      },
      access: 'ADMINISTRATOR',
    },
  ];

  t.assertJsonEquals(expected, result);
};
