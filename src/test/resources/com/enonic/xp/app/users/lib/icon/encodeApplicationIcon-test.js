var t = require('/lib/xp/testing');
var icon = require('/lib/icon');

exports.encodeIcon = function () {
  // `<svg/>`, base64.
  t.assertEquals('PHN2Zy8+', icon.encodeApplicationIcon({ application: 'com.enonic.app.oidc' }));
};

exports.encodeNoIcon = function () {
  t.assertNull(icon.encodeApplicationIcon({ application: 'com.enonic.app.oidc' }));
};
