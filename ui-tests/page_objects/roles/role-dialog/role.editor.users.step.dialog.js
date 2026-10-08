/**
 * Created on 01.10.2026.
 *
 * 'Users' step of the role editor: a principal picker over the users of every ID provider. The
 * picker's search input has the placeholder 'Search users'; the picked users are listed under it,
 * each with its provider and a Remove icon.
 */
const RoleEditorStepDialog = require('./role.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const USERS_PLACEHOLDER = 'Search users';

class RoleEditorUsersStepDialog extends RoleEditorStepDialog {
  get step() {
    return RoleEditorStepDialog.STEP.USERS;
  }

  // The picker of this step (principal.combobox.js), for what the methods here do not cover.
  get combobox() {
    return this.principalCombobox(USERS_PLACEHOLDER);
  }

  get usersFilterInput() {
    return RoleEditorStepDialog.css.pickerInput(USERS_PLACEHOLDER);
  }

  typeInUsersFilterInput(text) {
    return this.filterPrincipals(USERS_PLACEHOLDER, text);
  }

  clickOnUsersDropdownHandle() {
    return this.clickOnPickerToggle(USERS_PLACEHOLDER);
  }

  // Display names of the users offered in the opened popup.
  getUserOptions() {
    return this.getPickerOptions();
  }

  clickOnUserOption(displayName) {
    return this.clickOnPickerOption(displayName);
  }

  clickOnApplyButton() {
    return this.clickOnPickerApply(USERS_PLACEHOLDER);
  }

  // Filter → tick the user → Apply.
  addUser(displayName) {
    return this.addPrincipal(USERS_PLACEHOLDER, displayName);
  }

  async addUsers(displayNames) {
    for (const displayName of displayNames) {
      await this.addUser(displayName);
    }
  }

  // Display names of the picked users.
  getSelectedUsers() {
    return this.getPickedPrincipals();
  }

  waitForUserSelected(displayName) {
    return this.waitForPrincipalPicked(displayName);
  }

  // Clicks on the Remove icon of the picked user.
  removeUser(displayName) {
    return this.removePickedPrincipal(displayName);
  }

  isUsersFilterInputDisplayed() {
    return this.isElementDisplayed(this.usersFilterInput);
  }

  // Flows

  // Picks the users and moves on to Groups.
  async addUsersAndClickOnNext(displayNames) {
    await this.addUsers(displayNames);
    await this.clickOnNextButton();
    await this.waitForElementDisplayed(
      RoleEditorStepDialog.css.stepPanel(RoleEditorStepDialog.STEP.GROUPS),
      appConst.TIMEOUT.MEDIUM,
    );
  }
}

module.exports = RoleEditorUsersStepDialog;
