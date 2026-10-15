var t = require('/lib/xp/testing');
var idProvider = require('/lib/idprovider');

exports.deleteIdProviders = function () {
  var result = idProvider.deleteIdProviders({ idProviders: ['invalid', 'myIdProvider'] });

  // One refusal does not stop the rest, and the platform's own message is what says why.
  var expected = [
    {
      key: 'invalid',
      deleted: false,
      reason: 'IdProvider [invalid] not found',
    },
    {
      key: 'myIdProvider',
      deleted: true,
    },
  ];

  t.assertJsonEquals(expected, result);
};
