/**
 * Created on 25.09.2026.
 *
 * 'Roles' step of the user editor: a principal picker over the roles. The picker's search input has
 * the placeholder 'Search roles'; the picked roles are listed under it, each with a Remove icon.
 * A system-owned account shows a notice instead of the picker.
 */
const UserEditorStepDialog = require('./user.editor.step.dialog');

const ROLES_PLACEHOLDER = 'Search roles';

const DIALOG = UserEditorStepDialog.css.container;

const css = {
  notice: `${DIALOG} [data-registry-id='roles'] p.text-subtle`,
  failedNotice: `${DIALOG} [data-registry-id='roles'] p.text-error`,
};

class UserEditorRolesStepDialog extends UserEditorStepDialog {
  get step() {
    return UserEditorStepDialog.STEP.ROLES;
  }

  get rolesFilterInput() {
    return UserEditorStepDialog.css.pickerInput(ROLES_PLACEHOLDER);
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

  // The notice a system-owned account shows in place of the picker - or undefined.
  async getNotice() {
    const notices = await this.getDisplayedElements(css.notice);
    return notices.length === 0 ? undefined : await notices[0].getText();
  }

  // 'The memberships could not be loaded' when the read of the user failed - or undefined.
  async getFailedNotice() {
    const notices = await this.getDisplayedElements(css.failedNotice);
    return notices.length === 0 ? undefined : await notices[0].getText();
  }
}

module.exports = UserEditorRolesStepDialog;
