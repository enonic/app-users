/**
 * Created on 25.09.2026.
 *
 * 'Groups' step of the user editor: a principal picker over the groups of the user's ID provider,
 * with a 'Show groups from all ID providers' toggle (a pressed button, aria-pressed) above it. The picker's search input has the
 * placeholder 'Search groups'; the picked groups are listed under it, each with its provider and a
 * Remove icon. A system-owned account shows a notice instead of the picker.
 */
const UserEditorStepDialog = require('./user.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const GROUPS_PLACEHOLDER = 'Search groups';

const DIALOG = UserEditorStepDialog.css.container;

const css = {
  showAllGroupsToggle:
    `${DIALOG} [data-registry-id='groups'] button[data-component='Toggle']` +
    "[aria-label='Show groups from all ID providers']",
  notice: `${DIALOG} [data-registry-id='groups'] p.text-subtle`,
  failedNotice: `${DIALOG} [data-registry-id='groups'] p.text-error`,
};

class UserEditorGroupsStepDialog extends UserEditorStepDialog {
  get step() {
    return UserEditorStepDialog.STEP.GROUPS;
  }

  get groupsFilterInput() {
    return UserEditorStepDialog.css.pickerInput(GROUPS_PLACEHOLDER);
  }

  get showAllGroupsToggle() {
    return css.showAllGroupsToggle;
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

  // 'Show groups from all ID providers'

  async clickOnShowAllGroupsToggle() {
    try {
      await this.waitForElementDisplayed(css.showAllGroupsToggle);
      await this.clickOnElement(css.showAllGroupsToggle);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        "Groups step - 'Show groups from all ID providers' toggle",
        'err_show_all_groups_toggle',
        err,
      );
    }
  }

  async isShowAllGroupsTogglePressed() {
    const pressed = await this.getAttribute(css.showAllGroupsToggle, 'aria-pressed');
    return pressed === 'true';
  }

  isShowAllGroupsToggleDisplayed() {
    return this.isElementDisplayed(css.showAllGroupsToggle);
  }

  async waitForShowAllGroupsTogglePressed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForAttributeValue(css.showAllGroupsToggle, 'aria-pressed', 'true');
    } catch (err) {
      await this.handleError(
        "Groups step - 'Show groups from all ID providers' toggle should be pressed",
        'err_show_all_groups_toggle',
        err,
      );
    }
  }

  // The checkbox-era names, kept for the specs written against them.
  clickOnShowAllGroupsCheckbox() {
    return this.clickOnShowAllGroupsToggle();
  }

  isShowAllGroupsCheckboxSelected() {
    return this.isShowAllGroupsTogglePressed();
  }

  isShowAllGroupsCheckboxDisplayed() {
    return this.isShowAllGroupsToggleDisplayed();
  }

  waitForShowAllGroupsCheckboxSelected(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForShowAllGroupsTogglePressed(ms);
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

module.exports = UserEditorGroupsStepDialog;
