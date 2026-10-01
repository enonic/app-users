/**
 * Created on 01.10.2026.
 *
 * 'Roles' step of the group editor: a principal picker over the roles. The picker's search input has
 * the placeholder 'Search roles'; the picked roles are listed under it, each with a Remove icon.
 * The implicit roles (Everyone, Authenticated) are never offered.
 */
const GroupEditorStepDialog = require('./group.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const ROLES_PLACEHOLDER = 'Search roles';

class GroupEditorRolesStepDialog extends GroupEditorStepDialog {
  get step() {
    return GroupEditorStepDialog.STEP.ROLES;
  }

  get rolesFilterInput() {
    return GroupEditorStepDialog.css.pickerInput(ROLES_PLACEHOLDER);
  }

  typeInRolesFilterInput(text) {
    return this.filterPrincipals(ROLES_PLACEHOLDER, text);
  }

  clickOnRolesDropdownHandle() {
    return this.clickOnPickerToggle(ROLES_PLACEHOLDER);
  }

  // Display names of the roles offered in the opened popup.
  getRoleOptions() {
    return this.getPickerOptions();
  }

  clickOnRoleOption(displayName) {
    return this.clickOnPickerOption(displayName);
  }

  clickOnApplyButton() {
    return this.clickOnPickerApply(ROLES_PLACEHOLDER);
  }

  // Filter → tick the role → Apply.
  addRole(displayName) {
    return this.addPrincipal(ROLES_PLACEHOLDER, displayName);
  }

  async addRoles(displayNames) {
    for (const displayName of displayNames) {
      await this.addRole(displayName);
    }
  }

  // Display names of the picked roles.
  getSelectedRoles() {
    return this.getPickedPrincipals();
  }

  waitForRoleSelected(displayName) {
    return this.waitForPrincipalPicked(displayName);
  }

  // Clicks on the Remove icon of the picked role.
  removeRole(displayName) {
    return this.removePickedPrincipal(displayName);
  }

  isRolesFilterInputDisplayed() {
    return this.isElementDisplayed(this.rolesFilterInput);
  }

  // Flows

  // Picks the roles and moves on to Summary.
  async addRolesAndClickOnNext(displayNames) {
    await this.addRoles(displayNames);
    await this.clickOnNextButton();
    await this.waitForElementDisplayed(
      GroupEditorStepDialog.css.stepPanel(GroupEditorStepDialog.STEP.SUMMARY),
      appConst.TIMEOUT.MEDIUM,
    );
  }
}

module.exports = GroupEditorRolesStepDialog;
