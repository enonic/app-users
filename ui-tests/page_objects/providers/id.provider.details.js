/**
 * Created on 22.10.2026.
 *
 * The details panel of an ID provider (pages/id-providers/IdProviderDetails): the header with the
 * display name and the provider's key, then the sections
 *
 *   ID provider          - Description ('No description' when empty), Application ('Not set' when
 *                          none is bound) and Mode; Edit
 *   Permissions (N)      - the access control list, one principal per row with its access level on
 *                          the right; Edit permissions
 *   Users (N)            - the users of the provider as a row of avatars, the display name of each
 *                          in an sr-only node beside it. The system provider shows its accounts as
 *                          a list under 'Service accounts (N)' instead.
 *   Groups (N)           - the groups of the provider, one row each
 *
 * A section whose total is zero is not rendered at all, so a provider nobody belongs to has neither
 * Users nor Groups. Everything generic is in DetailsPanel (details.panel.js); this class names the
 * sections, the fields and the buttons, and reads the avatars.
 */
const DetailsPanel = require('../details.panel');
const appConst = require('../../libs/app_const');

const SECTION = Object.freeze({
  ID_PROVIDER: 'ID provider',
  PERMISSIONS: 'Permissions',
  USERS: 'Users',
  SERVICE_ACCOUNTS: 'Service accounts',
  GROUPS: 'Groups',
});

const FIELD = Object.freeze({
  DESCRIPTION: 'Description',
  APPLICATION: 'Application',
  MODE: 'Mode',
});

const BUTTON = Object.freeze({
  EDIT: 'Edit',
  EDIT_PERMISSIONS: 'Edit permissions',
});

// Modes as the panel words them (phrases: idProviders.mode.*). A provider bound to nothing is LOCAL.
const MODE = Object.freeze({
  LOCAL: 'Local (Users and groups managed in XP)',
  MIXED: 'Mixed (Users managed externally, groups in XP)',
  EXTERNAL: 'External (Users and groups managed externally)',
  UNAVAILABLE: 'Unavailable (Application is not installed or not running)',
});

const NO_DESCRIPTION = 'No description';
const APPLICATION_NOT_SET = 'Not set';

// The avatars of the Users section: a `ul` of `li`, each with the principal's display name in an
// sr-only node. Scoped to the section element, so it cannot reach the lists of the other sections -
// those are a `div[role='list']`, never a `ul`.
const AVATAR_NAME = 'ul li span.sr-only';

class IdProviderDetails extends DetailsPanel {
  constructor() {
    super({
      sectionId: appConst.SECTION_ID.ID_PROVIDERS,
      panelComponent: 'IdProviderDetails',
      itemPageComponent: 'IdProvidersItemPage',
      panelName: 'ID provider details',
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

  static get MODE() {
    return MODE;
  }

  static get NO_DESCRIPTION() {
    return NO_DESCRIPTION;
  }

  static get APPLICATION_NOT_SET() {
    return APPLICATION_NOT_SET;
  }

  // The key shown under the display name
  getKey() {
    return this.getSubtitle();
  }

  // ID provider

  // The description, or 'No description'
  getDescription() {
    return this.getFieldValue(SECTION.ID_PROVIDER, FIELD.DESCRIPTION);
  }

  // Display name of the bound application, or 'Not set'
  getApplication() {
    return this.getFieldValue(SECTION.ID_PROVIDER, FIELD.APPLICATION);
  }

  waitForApplication(expected, ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForFieldValue(SECTION.ID_PROVIDER, FIELD.APPLICATION, expected, ms);
  }

  // One of IdProviderDetails.MODE.*
  getMode() {
    return this.getFieldValue(SECTION.ID_PROVIDER, FIELD.MODE);
  }

  clickOnEditButton() {
    return super.clickOnEditButton(BUTTON.EDIT, SECTION.ID_PROVIDER);
  }

  isEditButtonDisplayed() {
    return super.isEditButtonDisplayed(BUTTON.EDIT, SECTION.ID_PROVIDER);
  }

  isEditButtonEnabled() {
    return super.isEditButtonEnabled(BUTTON.EDIT, SECTION.ID_PROVIDER);
  }

  // Permissions

  // The entries as [{ title, subtitle, meta }] - the principal's display name, its name and its
  // access level.
  getPermissionItems() {
    return this.getListItems(SECTION.PERMISSIONS);
  }

  // Display names of the principals with access, in display order.
  getPermissionPrincipals() {
    return this.getListItemTitles(SECTION.PERMISSIONS);
  }

  getPermissionsCount() {
    return this.getSectionCount(SECTION.PERMISSIONS);
  }

  // The entries as { '<display name>': '<appConst.ID_PROVIDER_ACCESS.*>' }.
  async getPermissions() {
    const items = await this.getPermissionItems();
    const permissions = {};
    for (const { title, meta } of items) {
      permissions[title] = meta;
    }
    return permissions;
  }

  async getAccess(displayName) {
    const permissions = await this.getPermissions();
    return permissions[displayName];
  }

  waitForPermission(displayName) {
    return this.waitForListItem(SECTION.PERMISSIONS, displayName);
  }

  // Waits for the principal's row to read the access - a save sends the panel back to the server,
  // so a check right after one has to wait.
  async waitForAccess(displayName, access, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.getAccess(displayName)) === access,
        { timeout: ms, timeoutMsg: `'${displayName}' should have the access '${access}'` },
      );
    } catch (err) {
      await this.handleError(
        `${this.panelName} - the access of '${displayName}'`,
        'err_details_access',
        err,
      );
    }
  }

  // 'The permissions could not be loaded and are not shown here' - or undefined.
  getPermissionsErrorNotice() {
    return this.getErrorNotice(SECTION.PERMISSIONS);
  }

  clickOnEditPermissionsButton() {
    return super.clickOnEditButton(BUTTON.EDIT_PERMISSIONS, SECTION.PERMISSIONS);
  }

  isEditPermissionsButtonDisplayed() {
    return super.isEditButtonDisplayed(BUTTON.EDIT_PERMISSIONS, SECTION.PERMISSIONS);
  }

  isEditPermissionsButtonEnabled() {
    return super.isEditButtonEnabled(BUTTON.EDIT_PERMISSIONS, SECTION.PERMISSIONS);
  }

  // Users - avatars, one per user, in every provider but the system one.

  isUsersSectionDisplayed() {
    return this.isSectionDisplayed(SECTION.USERS);
  }

  // The count in the section's label, which is the provider's total rather than the number of
  // avatars shown.
  getUsersCount() {
    return this.getSectionCount(SECTION.USERS);
  }

  // Display names of the users behind the avatars, in display order. Read from the sr-only node of
  // each avatar through textContent: an sr-only node is clipped, and getText() reads as rendered.
  async getUsers() {
    const section = await this.getSection(SECTION.USERS);
    const names = await section.$$(AVATAR_NAME);
    const result = [];
    for (const name of names) {
      result.push(await name.getProperty('textContent'));
    }
    return result;
  }

  async waitForUser(displayName, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(async () => (await this.getUsers()).includes(displayName), {
        timeout: ms,
        timeoutMsg: `'${displayName}' is not one of the users`,
      });
    } catch (err) {
      await this.handleError(
        `${this.panelName} - '${displayName}' should be one of the users`,
        'err_details_users',
        err,
      );
    }
  }

  clickOnMoreUsersButton() {
    return this.clickOnMoreButton(SECTION.USERS);
  }

  getUsersErrorNotice() {
    return this.getErrorNotice(SECTION.USERS);
  }

  // Service accounts - the system provider's own users, a list rather than avatars.

  isServiceAccountsSectionDisplayed() {
    return this.isSectionDisplayed(SECTION.SERVICE_ACCOUNTS);
  }

  getServiceAccounts() {
    return this.getListItemTitles(SECTION.SERVICE_ACCOUNTS);
  }

  getServiceAccountsCount() {
    return this.getSectionCount(SECTION.SERVICE_ACCOUNTS);
  }

  waitForServiceAccount(displayName) {
    return this.waitForListItem(SECTION.SERVICE_ACCOUNTS, displayName);
  }

  clickOnMoreServiceAccountsButton() {
    return this.clickOnMoreButton(SECTION.SERVICE_ACCOUNTS);
  }

  // Groups

  isGroupsSectionDisplayed() {
    return this.isSectionDisplayed(SECTION.GROUPS);
  }

  getGroups() {
    return this.getListItemTitles(SECTION.GROUPS);
  }

  // The groups as [{ title, subtitle, meta }] - the display name, the group's name and nothing on
  // the right.
  getGroupItems() {
    return this.getListItems(SECTION.GROUPS);
  }

  getGroupsCount() {
    return this.getSectionCount(SECTION.GROUPS);
  }

  waitForGroup(displayName) {
    return this.waitForListItem(SECTION.GROUPS, displayName);
  }

  clickOnMoreGroupsButton() {
    return this.clickOnMoreButton(SECTION.GROUPS);
  }

  getGroupsErrorNotice() {
    return this.getErrorNotice(SECTION.GROUPS);
  }
}

module.exports = IdProviderDetails;
