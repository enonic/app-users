/**
 * Created on 01.10.2026.
 *
 * 'General' step of the group editor: Display name, ID, Description. On create it follows the
 * ID provider step (group.editor.id.provider.step.dialog.js); when an existing group is edited it is
 * the first step, the provider is shown above the fields as a disabled input, and the ID input is
 * read-only ('The ID cannot be changed after creation').
 */
const GroupEditorStepDialog = require('./group.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const DIALOG = GroupEditorStepDialog.css.container;

const css = {
  // Edit mode only: the provider the group lives in, as a disabled input.
  idProviderInput: `${DIALOG} input#group-editor-id-provider`,
  displayNameInput: `${DIALOG} input#group-editor-display-name`,
  idInput: `${DIALOG} input#group-editor-id`,
  descriptionTextArea: `${DIALOG} textarea#group-editor-description`,
  validationMessages: `${DIALOG} [data-registry-id='general'] p.text-error`,
};

class GroupEditorGeneralStepDialog extends GroupEditorStepDialog {
  get step() {
    return GroupEditorStepDialog.STEP.GENERAL;
  }

  get idProviderInput() {
    return css.idProviderInput;
  }

  get displayNameInput() {
    return css.displayNameInput;
  }

  get idInput() {
    return css.idInput;
  }

  get descriptionTextArea() {
    return css.descriptionTextArea;
  }

  // Inputs

  async typeInDisplayNameInput(displayName) {
    try {
      await this.waitForElementDisplayed(css.displayNameInput);
      await this.typeTextInInput(css.displayNameInput, displayName);
    } catch (err) {
      await this.handleError(
        'New group dialog - Display name input',
        'err_display_name_input',
        err,
      );
    }
  }

  // The ID is derived from the display name as it is typed. The derived value is cleared through
  // the keyboard first (Ctrl+A, Delete): setValue's own clear does not reach the component's state,
  // and the new text would be appended to the old one.
  async typeInIdInput(id) {
    try {
      await this.waitForElementDisplayed(css.idInput);
      await this.clearInputText(css.idInput);
      await this.typeTextInInput(css.idInput, id);
    } catch (err) {
      await this.handleError('New group dialog - ID input', 'err_id_input', err);
    }
  }

  // Types the ID only when it differs from the one derived from the display name.
  async setIdIfDiffers(id) {
    if ((await this.getTextInIdInput()) !== id) {
      await this.typeInIdInput(id);
    }
  }

  async typeInDescriptionTextArea(description) {
    try {
      await this.waitForElementDisplayed(css.descriptionTextArea);
      await this.typeTextInInput(css.descriptionTextArea, description);
    } catch (err) {
      await this.handleError('New group dialog - Description', 'err_description_textarea', err);
    }
  }

  getTextInDisplayNameInput() {
    return this.getTextInInput(css.displayNameInput);
  }

  getTextInIdInput() {
    return this.getTextInInput(css.idInput);
  }

  getTextInDescriptionTextArea() {
    return this.getTextInInput(css.descriptionTextArea);
  }

  clearDisplayNameInput() {
    return this.clearInputText(css.displayNameInput);
  }

  clearIdInput() {
    return this.clearInputText(css.idInput);
  }

  clearDescriptionTextArea() {
    return this.clearInputText(css.descriptionTextArea);
  }

  isDisplayNameInputDisplayed() {
    return this.isElementDisplayed(css.displayNameInput);
  }

  isIdInputDisplayed() {
    return this.isElementDisplayed(css.idInput);
  }

  isIdInputEnabled() {
    return this.isElementEnabled(css.idInput);
  }

  isDescriptionTextAreaDisplayed() {
    return this.isElementDisplayed(css.descriptionTextArea);
  }

  // Texts of the validation messages shown under the fields, e.g. 'ID is required'.
  getValidationMessages() {
    return this.getTextInDisplayedElements(css.validationMessages);
  }

  // ID provider (edit mode)

  isIdProviderInputDisplayed() {
    return this.isElementDisplayed(css.idProviderInput);
  }

  // The provider of the edited group, e.g. 'System Id Provider'.
  async getIdProvider() {
    await this.waitForElementDisplayed(css.idProviderInput);
    return await this.getTextInInput(css.idProviderInput);
  }

  // Flows

  // Fills the step. `group` = { displayName, id?, description? }.
  // The provider is picked on the step before this one (group.editor.id.provider.step.dialog.js).
  async typeData(group) {
    await this.typeInDisplayNameInput(group.displayName);
    if (group.id !== undefined) {
      await this.setIdIfDiffers(group.id);
    }
    if (group.description !== undefined) {
      await this.typeInDescriptionTextArea(group.description);
    }
  }

  // Fills the step and moves on to Members.
  async typeDataAndClickOnNext(group) {
    await this.typeData(group);
    await this.clickOnNextButton();
    await this.waitForElementDisplayed(
      GroupEditorStepDialog.css.stepPanel(GroupEditorStepDialog.STEP.MEMBERS),
      appConst.TIMEOUT.MEDIUM,
    );
  }
}

module.exports = GroupEditorGeneralStepDialog;
