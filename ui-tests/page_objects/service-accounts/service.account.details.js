/**
 * Created on 05.10.2026.
 *
 * The details panel of a service account (pages/service-accounts/ServiceAccountDetails): the
 * header with the display name and the login, then the sections
 *
 *   Service account  - Email ('Not set' when absent), or Type ('System') in its place for the
 *                      built-in accounts su and anonymous; Edit
 *   Credentials      - Password ('Set' / 'Not set'), the 'Public keys (N)' subsection with a row per
 *                      key (its label, its kid under it); Edit credentials
 *   Memberships      - the 'Transitive memberships' checkbox (only when the account may inherit any)
 *   Roles (N)        - the roles, one row each; Edit roles
 *   Groups (N)       - the groups with the key of their ID provider on the right; Edit groups
 *
 * Everything generic is in DetailsPanel (details.panel.js); this class names the sections, the
 * fields and the buttons.
 */
const DetailsPanel = require('../details.panel');
const appConst = require('../../libs/app_const');

const SECTION = Object.freeze({
  SERVICE_ACCOUNT: 'Service account',
  CREDENTIALS: 'Credentials',
  MEMBERSHIPS: 'Memberships',
  ROLES: 'Roles',
  GROUPS: 'Groups',
});

const SUBSECTION = Object.freeze({
  PUBLIC_KEYS: 'Public keys',
});

const FIELD = Object.freeze({
  TYPE: 'Type',
  EMAIL: 'Email',
  PASSWORD: 'Password',
});

const BUTTON = Object.freeze({
  EDIT: 'Edit',
  EDIT_CREDENTIALS: 'Edit credentials',
  EDIT_ROLES: 'Edit roles',
  EDIT_GROUPS: 'Edit groups',
});

const PASSWORD = Object.freeze({ SET: 'Set', NOT_SET: 'Not set' });

class ServiceAccountDetails extends DetailsPanel {
  constructor() {
    super({
      sectionId: appConst.SECTION_ID.SERVICE_ACCOUNTS,
      panelComponent: 'ServiceAccountDetails',
      itemPageComponent: 'ServiceAccountsItemPage',
      panelName: 'Service account details',
    });
  }

  static get SECTION() {
    return SECTION;
  }

  static get SUBSECTION() {
    return SUBSECTION;
  }

  static get FIELD() {
    return FIELD;
  }

  static get BUTTON() {
    return BUTTON;
  }

  static get PASSWORD() {
    return PASSWORD;
  }

  // The login shown under the display name
  getLogin() {
    return this.getSubtitle();
  }

  // Service account

  // 'System' - shown for the built-in accounts (su, anonymous) only; undefined for any other.
  getType() {
    return this.getFieldValue(SECTION.SERVICE_ACCOUNT, FIELD.TYPE);
  }

  // The email, or 'Not set'; undefined for a built-in account, which shows its Type instead.
  getEmail() {
    return this.getFieldValue(SECTION.SERVICE_ACCOUNT, FIELD.EMAIL);
  }

  clickOnEditButton() {
    return super.clickOnEditButton(BUTTON.EDIT, SECTION.SERVICE_ACCOUNT);
  }

  isEditButtonDisplayed() {
    return super.isEditButtonDisplayed(BUTTON.EDIT, SECTION.SERVICE_ACCOUNT);
  }

  // Credentials

  // 'Set' or 'Not set' (ServiceAccountDetails.PASSWORD.*)
  getPassword() {
    return this.getFieldValue(SECTION.CREDENTIALS, FIELD.PASSWORD);
  }

  async isPasswordSet() {
    return (await this.getPassword()) === PASSWORD.SET;
  }

  // Waits for the Password field to read 'Set' or 'Not set' (ServiceAccountDetails.PASSWORD.*).
  waitForPassword(expected, ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForFieldValue(SECTION.CREDENTIALS, FIELD.PASSWORD, expected, ms);
  }

  // The public keys as [{ title, subtitle }]: the key's label ('Unlabelled key' when it has none)
  // and its kid.
  getPublicKeys() {
    return this.getSubsectionListItems(SECTION.CREDENTIALS, SUBSECTION.PUBLIC_KEYS);
  }

  async getPublicKeyLabels() {
    return (await this.getPublicKeys()).map(({ title }) => title);
  }

  // The count in 'Public keys (N)'
  getPublicKeysCount() {
    return this.getSubsectionCount(SECTION.CREDENTIALS, SUBSECTION.PUBLIC_KEYS);
  }

  clickOnEditCredentialsButton() {
    return super.clickOnEditButton(BUTTON.EDIT_CREDENTIALS, SECTION.CREDENTIALS);
  }

  isEditCredentialsButtonDisplayed() {
    return super.isEditButtonDisplayed(BUTTON.EDIT_CREDENTIALS, SECTION.CREDENTIALS);
  }

  // Memberships

  isMembershipsSectionDisplayed() {
    return this.isSectionDisplayed(SECTION.MEMBERSHIPS);
  }

  clickOnTransitiveMembershipsCheckbox() {
    return this.clickOnCheckbox(SECTION.MEMBERSHIPS);
  }

  isTransitiveMembershipsChecked() {
    return this.isCheckboxChecked(SECTION.MEMBERSHIPS);
  }

  getMembershipsErrorNotice() {
    return this.getErrorNotice(SECTION.MEMBERSHIPS);
  }

  // Roles

  getRoles() {
    return this.getListItemTitles(SECTION.ROLES);
  }

  getRolesCount() {
    return this.getSectionCount(SECTION.ROLES);
  }

  waitForRole(displayName) {
    return this.waitForListItem(SECTION.ROLES, displayName);
  }

  clickOnEditRolesButton() {
    return super.clickOnEditButton(BUTTON.EDIT_ROLES, SECTION.ROLES);
  }

  isEditRolesButtonDisplayed() {
    return super.isEditButtonDisplayed(BUTTON.EDIT_ROLES, SECTION.ROLES);
  }

  clickOnMoreRolesButton() {
    return this.clickOnMoreButton(SECTION.ROLES);
  }

  // Groups

  getGroups() {
    return this.getListItemTitles(SECTION.GROUPS);
  }

  // The groups as [{ title, subtitle, meta }], meta being the key of the group's ID provider
  getGroupItems() {
    return this.getListItems(SECTION.GROUPS);
  }

  getGroupsCount() {
    return this.getSectionCount(SECTION.GROUPS);
  }

  waitForGroup(displayName) {
    return this.waitForListItem(SECTION.GROUPS, displayName);
  }

  clickOnEditGroupsButton() {
    return super.clickOnEditButton(BUTTON.EDIT_GROUPS, SECTION.GROUPS);
  }

  isEditGroupsButtonDisplayed() {
    return super.isEditButtonDisplayed(BUTTON.EDIT_GROUPS, SECTION.GROUPS);
  }

  clickOnMoreGroupsButton() {
    return this.clickOnMoreButton(SECTION.GROUPS);
  }
}

module.exports = ServiceAccountDetails;
