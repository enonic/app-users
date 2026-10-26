/**
 * Created on 26.10.2026.
 *
 * 'Test Auth0 ID Provider configuration' - the configuration dialog (ApplicationConfigDialog,
 * application.config.dialog.js) opened for the second test application. Its form is flat: the
 * inputs authorizationUrl, tokenUrl, logoutUrl and 'Graph API url' (required, with defaults),
 * clientId (required, empty to begin with - the one thing that keeps a fresh configuration
 * incomplete) and resource; the item sets 'User mappings', Proxy and 'Property to user profile
 * from AD FS JWT Claim'; and three checkboxes. A Proxy occurrence holds Host (required), Port
 * Number, Username and Password, and is labelled by its host.
 */
const ApplicationConfigDialog = require('./application.config.dialog');

const APPLICATION = 'Test Auth0 ID Provider';

// The labels of the inputs, as the form gives them to aria-label (without the asterisk).
const FIELD = Object.freeze({
  AUTHORIZATION_URL: 'authorizationUrl',
  TOKEN_URL: 'tokenUrl',
  LOGOUT_URL: 'logoutUrl',
  CLIENT_ID: 'clientId',
  RESOURCE: 'resource',
  GRAPH_API_URL: 'Graph API url',
});

const ITEM_SET = Object.freeze({
  USER_MAPPINGS: 'User mappings',
  PROXY: 'Proxy',
  PROFILE_PROPERTIES: 'Property to user profile from AD FS JWT Claim',
});

// The inputs of a Proxy occurrence.
const PROXY_FIELD = Object.freeze({
  HOST: 'Host',
  PORT: 'Port Number',
  USERNAME: 'Username',
  PASSWORD: 'Password',
});

class Auth0IdProviderConfigDialog extends ApplicationConfigDialog {
  static get APPLICATION() {
    return APPLICATION;
  }

  static get TITLE() {
    return `${APPLICATION} configuration`;
  }

  static get FIELD() {
    return FIELD;
  }

  static get ITEM_SET() {
    return ITEM_SET;
  }

  static get PROXY_FIELD() {
    return PROXY_FIELD;
  }

  // Proxy - an item set. With one occurrence its inputs are told by their labels alone, so these
  // take no index.

  clickOnAddProxyButton() {
    return this.clickOnItemSetAddButton(ITEM_SET.PROXY);
  }

  getProxyLabels() {
    return this.getItemSetOccurrenceLabels(ITEM_SET.PROXY);
  }

  waitForProxyCount(count, ms) {
    return this.waitForItemSetOccurrenceCount(ITEM_SET.PROXY, count, ms);
  }

  typeInProxyHostInput(host) {
    return this.typeInInput(PROXY_FIELD.HOST, host);
  }

  getTextInProxyHostInput() {
    return this.getInputValue(PROXY_FIELD.HOST);
  }

  typeInAuthorizationUrlInput(url) {
    return this.typeInInput(FIELD.AUTHORIZATION_URL, url);
  }

  typeInTokenUrlInput(url) {
    return this.typeInInput(FIELD.TOKEN_URL, url);
  }

  typeInLogoutUrlInput(url) {
    return this.typeInInput(FIELD.LOGOUT_URL, url);
  }

  typeInClientIdInput(clientId) {
    return this.typeInInput(FIELD.CLIENT_ID, clientId);
  }

  typeInResourceInput(resource) {
    return this.typeInInput(FIELD.RESOURCE, resource);
  }

  typeInGraphApiUrlInput(url) {
    return this.typeInInput(FIELD.GRAPH_API_URL, url);
  }

  getTextInAuthorizationUrlInput() {
    return this.getInputValue(FIELD.AUTHORIZATION_URL);
  }

  getTextInTokenUrlInput() {
    return this.getInputValue(FIELD.TOKEN_URL);
  }

  getTextInLogoutUrlInput() {
    return this.getInputValue(FIELD.LOGOUT_URL);
  }

  getTextInClientIdInput() {
    return this.getInputValue(FIELD.CLIENT_ID);
  }

  getTextInResourceInput() {
    return this.getInputValue(FIELD.RESOURCE);
  }

  getTextInGraphApiUrlInput() {
    return this.getInputValue(FIELD.GRAPH_API_URL);
  }
}

module.exports = Auth0IdProviderConfigDialog;
