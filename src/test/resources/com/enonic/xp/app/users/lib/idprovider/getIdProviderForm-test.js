var t = require('/lib/xp/testing');
var idProvider = require('/lib/idprovider');

function form(translated) {
  return [
    {
      formItemType: 'Input',
      name: 'clientId',
      label: translated ? 'Klient-ID' : 'Client ID',
      helpText: translated ? 'Fra leverandøren' : 'From the provider',
      inputType: 'TextLine',
      occurrences: { minimum: 1, maximum: 1 },
      config: { maxLength: 64 },
    },
    {
      formItemType: 'Input',
      name: 'scope',
      label: 'Scope',
      inputType: 'ComboBox',
      occurrences: { minimum: 0, maximum: 0 },
      config: {
        options: [
          // `{ text, i18n }` is flattened to the text in the admin's language.
          { value: 'openid', label: translated ? 'Kun OpenID' : 'OpenID only' },
          { value: 'email', label: 'Email' },
        ],
      },
    },
    {
      formItemType: 'Layout',
      label: 'Claims',
      items: [
        {
          formItemType: 'Input',
          name: 'claim',
          label: 'Claim',
          inputType: 'TextLine',
          occurrences: { minimum: 0, maximum: 1 },
          config: {},
        },
      ],
    },
    {
      formItemType: 'ItemSet',
      name: 'endpoints',
      label: 'Endpoints',
      occurrences: { minimum: 0, maximum: 2 },
      items: [
        {
          formItemType: 'Input',
          name: 'url',
          label: 'URL',
          inputType: 'TextLine',
          occurrences: { minimum: 0, maximum: 1 },
          config: {},
        },
      ],
    },
    {
      formItemType: 'OptionSet',
      name: 'mode',
      label: 'Mode',
      expanded: true,
      occurrences: { minimum: 1, maximum: 1 },
      selection: { minimum: 1, maximum: 1 },
      options: [
        { name: 'code', label: 'Code', default: true, items: [] },
        {
          name: 'implicit',
          label: 'Implicit',
          default: false,
          items: [
            {
              formItemType: 'Input',
              name: 'nonce',
              label: 'Nonce',
              inputType: 'CheckBox',
              occurrences: { minimum: 0, maximum: 1 },
              config: {},
            },
          ],
        },
      ],
    },
  ];
}

exports.getForm = function () {
  var result = idProvider.getIdProviderForm({ application: 'com.enonic.app.oidc', locale: 'no' });

  t.assertJsonEquals(form(true), result);
};

exports.getUntranslatedForm = function () {
  var result = idProvider.getIdProviderForm({ application: 'com.enonic.app.oidc' });

  t.assertJsonEquals(form(false), result);
};

exports.getEmptyForm = function () {
  t.assertJsonEquals([], idProvider.getIdProviderForm({ application: 'com.enonic.app.oidc' }));
};

exports.getMissingForm = function () {
  t.assertNull(idProvider.getIdProviderForm({ application: 'com.enonic.app.oidc' }));
};
