/**
 * Created on 05.10.2026.
 *
 * The details panel of a group (pages/groups/GroupDetails): the header with the display name and
 * the name, then the sections
 *
 *   Group                 - ID provider, Description ('No description' when empty); Edit
 *   Memberships           - the 'Transitive memberships' checkbox (only when the group may inherit
 *                           any)
 *   Member of (N)         - the groups this group is a member of (only with the checkbox ticked)
 *   Roles (N)             - the roles, one row each; Edit roles
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
  GROUP: 'Group',
  MEMBERSHIPS: 'Memberships',
  MEMBER_OF: 'Member of',
  ROLES: 'Roles',
  USERS: 'Users',
  SERVICE_ACCOUNTS: 'Service accounts',
  GROUPS: 'Groups',
});

const FIELD = Object.freeze({
  ID_PROVIDER: 'ID provider',
  DESCRIPTION: 'Description',
});

const BUTTON = Object.freeze({
  EDIT: 'Edit',
  EDIT_ROLES: 'Edit roles',
  EDIT_USERS: 'Edit users',
  EDIT_SERVICE_ACCOUNTS: 'Edit service accounts',
  EDIT_GROUPS: 'Edit groups',
});

const NO_DESCRIPTION = 'No description';

class GroupDetails extends DetailsPanel {
  constructor() {
    super({
      sectionId: appConst.SECTION_ID.GROUPS,
      panelComponent: 'GroupDetails',
      itemPageComponent: 'GroupsItemPage',
      panelName: 'Group details',
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

  // The name shown under the display name
  getName() {
    return this.getSubtitle();
  }

  // Group

  getIdProvider() {
    return this.getFieldValue(SECTION.GROUP, FIELD.ID_PROVIDER);
  }

  // The description, or 'No description'
  getDescription() {
    return this.getFieldValue(SECTION.GROUP, FIELD.DESCRIPTION);
  }

  clickOnEditButton() {
    return super.clickOnEditButton(BUTTON.EDIT, SECTION.GROUP);
  }

  isEditButtonDisplayed() {
    return super.isEditButtonDisplayed(BUTTON.EDIT, SECTION.GROUP);
  }

  // Memberships / Member of

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

  // Display names of the groups this group is a member of
  getMemberOf() {
    return this.getListItemTitles(SECTION.MEMBER_OF);
  }

  getMemberOfCount() {
    return this.getSectionCount(SECTION.MEMBER_OF);
  }

  isMemberOfSectionDisplayed() {
    return this.isSectionDisplayed(SECTION.MEMBER_OF);
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

  clickOnMoreRolesButton() {
    return this.clickOnMoreButton(SECTION.ROLES);
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

module.exports = GroupDetails;
