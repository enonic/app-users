/**
 * Created on 01.10.2026.
 *
 * 'General' step of the role editor: Display name, ID, Description. The first step, so it is what
 * opens after New (or Edit) has been clicked. When an existing role is edited the ID input is
 * read-only ('The ID cannot be changed after creation').
 */
const RoleEditorStepDialog = require('./role.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const DIALOG = RoleEditorStepDialog.css.container;

const css = {
  displayNameInput: `${DIALOG} input#role-editor-display-name`,
  idInput: `${DIALOG} input#role-editor-id`,
  descriptionTextArea: `${DIALOG} textarea#role-editor-description`,
  validationMessages: `${DIALOG} [data-registry-id='general'] p.text-error`,
};

class RoleEditorGeneralStepDialog extends RoleEditorStepDialog {
  get step() {
    return RoleEditorStepDialog.STEP.GENERAL;
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
      await this.handleError('New role dialog - Display name input', 'err_display_name_input', err);
    }
  }

  async typeInIdInput(id) {
    try {
      await this.waitForElementDisplayed(css.idInput);
      await this.typeTextInInput(css.idInput, id);
    } catch (err) {
      await this.handleError('New role dialog - ID input', 'err_id_input', err);
    }
  }

  async typeInDescriptionTextArea(description) {
    try {
      await this.waitForElementDisplayed(css.descriptionTextArea);
      await this.typeTextInInput(css.descriptionTextArea, description);
    } catch (err) {
      await this.handleError('New role dialog - Description', 'err_description_textarea', err);
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

  // Flows

  // Fills the step. `role` = { displayName, id?, description? }.
  async typeData(role) {
    await this.typeInDisplayNameInput(role.displayName);
    if (role.id !== undefined) {
      await this.typeInIdInput(role.id);
    }
    if (role.description !== undefined) {
      await this.typeInDescriptionTextArea(role.description);
    }
  }

  // Fills the step and moves on to Users.
  async typeDataAndClickOnNext(role) {
    await this.typeData(role);
    await this.clickOnNextButton();
    await this.waitForElementDisplayed(
      RoleEditorStepDialog.css.stepPanel(RoleEditorStepDialog.STEP.USERS),
      appConst.TIMEOUT.MEDIUM,
    );
  }
}

module.exports = RoleEditorGeneralStepDialog;
