/**
 * Created on 26.10.2026.
 *
 * 'Test ADFS ID Provider configuration' - the configuration dialog (ApplicationConfigDialog,
 * application.config.dialog.js) opened for the test application com.enonic.uitest.adfs_idprovider.
 * Its form: the Client fieldset with the three required inputs Domain, Client ID and Client secret,
 * which the configuration starts without - the General step's red icon stands until they are
 * filled - then Groups (a principal selector), 'site key' (an item set) and the Widget options.
 */
const ApplicationConfigDialog = require('./application.config.dialog');

const APPLICATION = 'Test ADFS ID Provider';

// The labels of the inputs, as the form gives them to aria-label (without the asterisk).
const FIELD = Object.freeze({
  DOMAIN: 'Domain',
  CLIENT_ID: 'Client ID',
  CLIENT_SECRET: 'Client secret',
});

// The required inputs of the Client fieldset - a configuration is complete once they are filled.
const CLIENT_FIELDS = Object.freeze([FIELD.DOMAIN, FIELD.CLIENT_ID, FIELD.CLIENT_SECRET]);

class AdfsIdProviderConfigDialog extends ApplicationConfigDialog {
  static get APPLICATION() {
    return APPLICATION;
  }

  static get TITLE() {
    return `${APPLICATION} configuration`;
  }

  static get FIELD() {
    return FIELD;
  }

  static get CLIENT_FIELDS() {
    return CLIENT_FIELDS;
  }

  // Groups - the PrincipalSelector input of the Groups fieldset: 'Groups automatically associated
  // to new users'. The one such input of the form.
  get groupsSelector() {
    return this.principalSelector();
  }

  // Client

  typeInDomainInput(domain) {
    return this.typeInInput(FIELD.DOMAIN, domain);
  }

  typeInClientIdInput(clientId) {
    return this.typeInInput(FIELD.CLIENT_ID, clientId);
  }

  typeInClientSecretInput(clientSecret) {
    return this.typeInInput(FIELD.CLIENT_SECRET, clientSecret);
  }

  getTextInDomainInput() {
    return this.getInputValue(FIELD.DOMAIN);
  }

  getTextInClientIdInput() {
    return this.getInputValue(FIELD.CLIENT_ID);
  }

  getTextInClientSecretInput() {
    return this.getInputValue(FIELD.CLIENT_SECRET);
  }

  // The values of the Client fieldset as { Domain, 'Client ID', 'Client secret' }.
  getClientSettings() {
    return this.getInputValues(CLIENT_FIELDS);
  }

  // Types the Client fieldset: `settings` is { Domain, 'Client ID', 'Client secret' }.
  typeClientSettings(settings) {
    return this.typeInInputs(settings);
  }
}

module.exports = AdfsIdProviderConfigDialog;
