/**
 * Created on 05.10.2026.
 *
 * The details panel of a user (pages/users/UserDetails): the header with the display name and the
 * login, then the sections
 *
 *   User         - ID provider, Email; Edit
 *   Credentials  - Password ('Set' / 'Not set'); Edit credentials
 *   Memberships  - the 'Transitive memberships' checkbox (only when the user may inherit any)
 *   Roles (N)    - the roles, one row each; Edit roles
 *   Groups (N)   - the groups with their ID provider on the right; Edit groups
 *
 * Everything generic is in DetailsPanel (details.panel.js); this class names the sections, the
 * fields and the buttons.
 */
const DetailsPanel = require('../details.panel');
const appConst = require('../../libs/app_const');

const SECTION = Object.freeze({
  USER: 'User',
  CREDENTIALS: 'Credentials',
  MEMBERSHIPS: 'Memberships',
  ROLES: 'Roles',
  GROUPS: 'Groups',
});

const FIELD = Object.freeze({
  ID_PROVIDER: 'ID provider',
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

class UserDetails extends DetailsPanel {
  constructor() {
    super({
      sectionId: appConst.SECTION_ID.USERS,
      panelComponent: 'UserDetails',
      itemPageComponent: 'UsersItemPage',
      panelName: 'User details',
    });
  }

  static get SECTION() {
    return SECTION;
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

  // User

  getIdProvider() {
    return this.getFieldValue(SECTION.USER, FIELD.ID_PROVIDER);
  }

  // Absent when the user has none: undefined.
  getEmail() {
    return this.getFieldValue(SECTION.USER, FIELD.EMAIL);
  }

  clickOnEditButton() {
    return super.clickOnEditButton(BUTTON.EDIT, SECTION.USER);
  }

  isEditButtonDisplayed() {
    return super.isEditButtonDisplayed(BUTTON.EDIT, SECTION.USER);
  }

  // Credentials

  // 'Set' or 'Not set' (UserDetails.PASSWORD.*)
  getPassword() {
    return this.getFieldValue(SECTION.CREDENTIALS, FIELD.PASSWORD);
  }

  async isPasswordSet() {
    return (await this.getPassword()) === PASSWORD.SET;
  }

  // Waits for the Password field to read 'Set' or 'Not set' (UserDetails.PASSWORD.*).
  waitForPassword(expected, ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForFieldValue(SECTION.CREDENTIALS, FIELD.PASSWORD, expected, ms);
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

  // 'The full memberships could not be loaded' - or undefined
  getMembershipsErrorNotice() {
    return this.getErrorNotice(SECTION.MEMBERSHIPS);
  }

  // Roles

  // Display names of the roles listed
  getRoles() {
    return this.getListItemTitles(SECTION.ROLES);
  }

  // The count in 'Roles (N)'
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

  // Display names of the groups listed
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

module.exports = UserDetails;
