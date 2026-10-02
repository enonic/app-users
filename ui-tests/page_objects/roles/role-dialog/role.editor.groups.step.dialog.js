/**
 * Created on 01.10.2026.
 *
 * 'Groups' step of the role editor: a principal picker over the groups of every ID provider. The
 * picker's search input has the placeholder 'Search groups'; the picked groups are listed under it,
 * each with its provider and a Remove icon.
 */
const RoleEditorStepDialog = require('./role.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const GROUPS_PLACEHOLDER = 'Search groups';

class RoleEditorGroupsStepDialog extends RoleEditorStepDialog {
  get step() {
    return RoleEditorStepDialog.STEP.GROUPS;
  }

  get groupsFilterInput() {
    return RoleEditorStepDialog.css.pickerInput(GROUPS_PLACEHOLDER);
  }

  typeInGroupsFilterInput(text) {
    return this.filterPrincipals(GROUPS_PLACEHOLDER, text);
  }

  clickOnGroupsDropdownHandle() {
    return this.clickOnPickerToggle(GROUPS_PLACEHOLDER);
  }

  // Display names of the groups offered in the opened popup.
  getGroupOptions() {
    return this.getPickerOptions();
  }

  clickOnGroupOption(displayName) {
    return this.clickOnPickerOption(displayName);
  }

  clickOnApplyButton() {
    return this.clickOnPickerApply(GROUPS_PLACEHOLDER);
  }

  // Filter → tick the group → Apply.
  addGroup(displayName) {
    return this.addPrincipal(GROUPS_PLACEHOLDER, displayName);
  }

  async addGroups(displayNames) {
    for (const displayName of displayNames) {
      await this.addGroup(displayName);
    }
  }

  // Display names of the picked groups.
  getSelectedGroups() {
    return this.getPickedPrincipals();
  }

  waitForGroupSelected(displayName) {
    return this.waitForPrincipalPicked(displayName);
  }

  // Clicks on the Remove icon of the picked group.
  removeGroup(displayName) {
    return this.removePickedPrincipal(displayName);
  }

  isGroupsFilterInputDisplayed() {
    return this.isElementDisplayed(this.groupsFilterInput);
  }

  // Flows

  // Picks the groups and moves on to Summary.
  async addGroupsAndClickOnNext(displayNames) {
    await this.addGroups(displayNames);
    await this.clickOnNextButton();
    await this.waitForElementDisplayed(
      RoleEditorStepDialog.css.stepPanel(RoleEditorStepDialog.STEP.SUMMARY),
      appConst.TIMEOUT.MEDIUM,
    );
  }
}

module.exports = RoleEditorGroupsStepDialog;
