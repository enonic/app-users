/**
 * Created on 01.10.2026.
 *
 * 'Members' step of the group editor: a principal picker over the users and groups of the group's
 * ID provider, with a 'Show members from all ID providers' toggle above it. The picker's search
 * input has the placeholder 'Search users and groups'; the picked members are listed under it, each
 * with its provider and a Remove icon. The group itself is never offered as its own member.
 */
const GroupEditorStepDialog = require('./group.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const MEMBERS_PLACEHOLDER = 'Search users and groups';

const DIALOG = GroupEditorStepDialog.css.container;

const css = {
  // A pressed toggle button (aria-pressed), not a checkbox.
  showAllMembersToggle:
    `${DIALOG} [data-registry-id='members'] button[data-component='Toggle']` +
    "[aria-label='Show members from all ID providers']",
};

class GroupEditorMembersStepDialog extends GroupEditorStepDialog {
  get step() {
    return GroupEditorStepDialog.STEP.MEMBERS;
  }

  get membersFilterInput() {
    return GroupEditorStepDialog.css.pickerInput(MEMBERS_PLACEHOLDER);
  }

  get showAllMembersToggle() {
    return css.showAllMembersToggle;
  }

  typeInMembersFilterInput(text) {
    return this.filterPrincipals(MEMBERS_PLACEHOLDER, text);
  }

  clickOnMembersDropdownHandle() {
    return this.clickOnPickerToggle(MEMBERS_PLACEHOLDER);
  }

  // Display names of the users and groups offered in the opened popup.
  getMemberOptions() {
    return this.getPickerOptions();
  }

  clickOnMemberOption(displayName) {
    return this.clickOnPickerOption(displayName);
  }

  clickOnApplyButton() {
    return this.clickOnPickerApply(MEMBERS_PLACEHOLDER);
  }

  // Filter → tick the member → Apply.
  addMember(displayName) {
    return this.addPrincipal(MEMBERS_PLACEHOLDER, displayName);
  }

  async addMembers(displayNames) {
    for (const displayName of displayNames) {
      await this.addMember(displayName);
    }
  }

  // Display names of the picked members.
  getSelectedMembers() {
    return this.getPickedPrincipals();
  }

  waitForMemberSelected(displayName) {
    return this.waitForPrincipalPicked(displayName);
  }

  // Clicks on the Remove icon of the picked member.
  removeMember(displayName) {
    return this.removePickedPrincipal(displayName);
  }

  isMembersFilterInputDisplayed() {
    return this.isElementDisplayed(this.membersFilterInput);
  }

  // 'Show members from all ID providers'

  async clickOnShowAllMembersToggle() {
    try {
      await this.waitForElementDisplayed(css.showAllMembersToggle);
      await this.clickOnElement(css.showAllMembersToggle);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        "Members step - 'Show members from all ID providers' toggle",
        'err_show_all_members_toggle',
        err,
      );
    }
  }

  async isShowAllMembersTogglePressed() {
    const pressed = await this.getAttribute(css.showAllMembersToggle, 'aria-pressed');
    return pressed === 'true';
  }

  isShowAllMembersToggleDisplayed() {
    return this.isElementDisplayed(css.showAllMembersToggle);
  }

  async waitForShowAllMembersTogglePressed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForAttributeValue(css.showAllMembersToggle, 'aria-pressed', 'true');
    } catch (err) {
      await this.handleError(
        "Members step - 'Show members from all ID providers' toggle should be pressed",
        'err_show_all_members_toggle',
        err,
      );
    }
  }

  // Flows

  // Picks the members and moves on to Roles.
  async addMembersAndClickOnNext(displayNames) {
    await this.addMembers(displayNames);
    await this.clickOnNextButton();
    await this.waitForElementDisplayed(
      GroupEditorStepDialog.css.stepPanel(GroupEditorStepDialog.STEP.ROLES),
      appConst.TIMEOUT.MEDIUM,
    );
  }
}

module.exports = GroupEditorMembersStepDialog;
