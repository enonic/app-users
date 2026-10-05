/**
 * Created on 05.10.2026.
 *
 * The details panel of a role (pages/roles/RoleDetails): the header with the display name and the
 * name, then the sections
 *
 *   Role                  - Type ('System', for a built-in role), Description ('No description' when
 *                           empty), Modified (the timestamp, when known); Edit
 *   Users (N)             - the member users with their ID provider on the right; Edit users
 *   Service accounts (N)  - the member service accounts; Edit service accounts
 *   Groups (N)            - the member groups with their ID provider on the right; Edit groups
 *
 * Everything generic is in DetailsPanel (details.panel.js); this class names the sections, the
 * fields and the buttons.
 */
const DetailsPanel = require('../details.panel');
const appConst = require('../../libs/app_const');

const SECTION = Object.freeze({
  ROLE: 'Role',
  USERS: 'Users',
  SERVICE_ACCOUNTS: 'Service accounts',
  GROUPS: 'Groups',
});

const FIELD = Object.freeze({
  TYPE: 'Type',
  DESCRIPTION: 'Description',
  MODIFIED: 'Modified',
});

const BUTTON = Object.freeze({
  EDIT: 'Edit',
  EDIT_USERS: 'Edit users',
  EDIT_SERVICE_ACCOUNTS: 'Edit service accounts',
  EDIT_GROUPS: 'Edit groups',
});

const NO_DESCRIPTION = 'No description';

class RoleDetails extends DetailsPanel {
  constructor() {
    super({
      sectionId: appConst.SECTION_ID.ROLES,
      panelComponent: 'RoleDetails',
      itemPageComponent: 'RolesItemPage',
      panelName: 'Role details',
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

  static get NO_DESCRIPTION() {
    return NO_DESCRIPTION;
  }

  // The name shown under the display name, e.g. 'system.admin'
  getName() {
    return this.getSubtitle();
  }

  // Role

  // 'System' for a built-in role - undefined for one made here
  getType() {
    return this.getFieldValue(SECTION.ROLE, FIELD.TYPE);
  }

  async isSystemRole() {
    return (await this.getType()) !== undefined;
  }

  // The description, or 'No description'
  getDescription() {
    return this.getFieldValue(SECTION.ROLE, FIELD.DESCRIPTION);
  }

  // The 'Modified' timestamp - undefined when the role carries none
  getModified() {
    return this.getFieldValue(SECTION.ROLE, FIELD.MODIFIED);
  }

  clickOnEditButton() {
    return super.clickOnEditButton(BUTTON.EDIT, SECTION.ROLE);
  }

  isEditButtonDisplayed() {
    return super.isEditButtonDisplayed(BUTTON.EDIT, SECTION.ROLE);
  }

  // Users (members)

  getUsers() {
    return this.getListItemTitles(SECTION.USERS);
  }

  // The users as [{ title, subtitle, meta }], meta being the user's ID provider
  getUserItems() {
    return this.getListItems(SECTION.USERS);
  }

  getUsersCount() {
    return this.getSectionCount(SECTION.USERS);
  }

  waitForUser(displayName) {
    return this.waitForListItem(SECTION.USERS, displayName);
  }

  clickOnEditUsersButton() {
    return super.clickOnEditButton(BUTTON.EDIT_USERS, SECTION.USERS);
  }

  clickOnMoreUsersButton() {
    return this.clickOnMoreButton(SECTION.USERS);
  }

  // Service accounts (members)

  getServiceAccounts() {
    return this.getListItemTitles(SECTION.SERVICE_ACCOUNTS);
  }

  getServiceAccountsCount() {
    return this.getSectionCount(SECTION.SERVICE_ACCOUNTS);
  }

  waitForServiceAccount(displayName) {
    return this.waitForListItem(SECTION.SERVICE_ACCOUNTS, displayName);
  }

  clickOnEditServiceAccountsButton() {
    return super.clickOnEditButton(BUTTON.EDIT_SERVICE_ACCOUNTS, SECTION.SERVICE_ACCOUNTS);
  }

  clickOnMoreServiceAccountsButton() {
    return this.clickOnMoreButton(SECTION.SERVICE_ACCOUNTS);
  }

  // Groups (members)

  getGroups() {
    return this.getListItemTitles(SECTION.GROUPS);
  }

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

  clickOnMoreGroupsButton() {
    return this.clickOnMoreButton(SECTION.GROUPS);
  }
}

module.exports = RoleDetails;
