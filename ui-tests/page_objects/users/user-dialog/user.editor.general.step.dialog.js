/**
 * Created on 25.09.2026.
 *
 * 'General' step of the user editor: Display name, ID, Email. On create it follows the ID provider
 * step (user.editor.id.provider.step.dialog.js), so it is the first step only for a service account
 * or when an existing user is edited. In edit mode the provider is shown above the fields as a
 * disabled input, and the ID input is read-only ('The ID cannot be changed after creation').
 */
const UserEditorStepDialog = require('./user.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const DIALOG = UserEditorStepDialog.css.container;

const css = {
  // Edit mode only: the provider the user lives in, as a disabled input.
  idProviderInput: `${DIALOG} input#user-editor-id-provider`,
  displayNameInput: `${DIALOG} input#user-editor-display-name`,
  idInput: `${DIALOG} input#user-editor-id`,
  emailInput: `${DIALOG} input#user-editor-email`,
  validationMessages: `${DIALOG} [data-registry-id='general'] p.text-error`,
};

class UserEditorGeneralStepDialog extends UserEditorStepDialog {
  get step() {
    return UserEditorStepDialog.STEP.GENERAL;
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

  get emailInput() {
    return css.emailInput;
  }

  // Inputs

  async typeInDisplayNameInput(displayName) {
    try {
      await this.waitForElementDisplayed(css.displayNameInput);
      await this.typeTextInInput(css.displayNameInput, displayName);
    } catch (err) {
      await this.handleError('New user dialog - Display name input', 'err_display_name_input', err);
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
      await this.handleError('New user dialog - ID input', 'err_id_input', err);
    }
  }

  // Types the ID only when it differs from the one derived from the display name.
  async setIdIfDiffers(id) {
    if ((await this.getTextInIdInput()) !== id) {
      await this.typeInIdInput(id);
    }
  }

  // The ID is the user's name (the 'Name' field of the old wizard).
  typeInNameInput(name) {
    return this.typeInIdInput(name);
  }

  async typeInEmailInput(email) {
    try {
      await this.waitForElementDisplayed(css.emailInput);
      await this.typeTextInInput(css.emailInput, email);
    } catch (err) {
      await this.handleError('New user dialog - Email input', 'err_email_input', err);
    }
  }

  getTextInDisplayNameInput() {
    return this.getTextInInput(css.displayNameInput);
  }

  getTextInIdInput() {
    return this.getTextInInput(css.idInput);
  }

  getTextInNameInput() {
    return this.getTextInIdInput();
  }

  getTextInEmailInput() {
    return this.getTextInInput(css.emailInput);
  }

  clearDisplayNameInput() {
    return this.clearInputText(css.displayNameInput);
  }

  clearIdInput() {
    return this.clearInputText(css.idInput);
  }

  clearNameInput() {
    return this.clearIdInput();
  }

  clearEmailInput() {
    return this.clearInputText(css.emailInput);
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

  isEmailInputDisplayed() {
    return this.isElementDisplayed(css.emailInput);
  }

  // Texts of the validation messages shown under the fields, e.g. 'ID is required'.
  getValidationMessages() {
    return this.getTextInDisplayedElements(css.validationMessages);
  }

  // ID provider (edit mode)

  isIdProviderInputDisplayed() {
    return this.isElementDisplayed(css.idProviderInput);
  }

  // The provider of the edited user, e.g. 'system'.
  async getIdProvider() {
    await this.waitForElementDisplayed(css.idProviderInput);
    return await this.getTextInInput(css.idProviderInput);
  }

  // Flows

  // Fills the step. `user` = { displayName, id?, email? }; `name` is accepted as an alias of `id`.
  // The provider is picked on the step before this one (user.editor.id.provider.step.dialog.js).
  async typeData(user) {
    await this.typeInDisplayNameInput(user.displayName);
    const id = user.id ?? user.name;
    if (id !== undefined) {
      await this.setIdIfDiffers(id);
    }
    if (user.email !== undefined) {
      await this.typeInEmailInput(user.email);
    }
  }

  // Fills the step and moves on to Credentials.
  async typeDataAndClickOnNext(user) {
    await this.typeData(user);
    await this.clickOnNextButton();
    await this.waitForElementDisplayed(
      UserEditorStepDialog.css.stepPanel(UserEditorStepDialog.STEP.CREDENTIALS),
      appConst.TIMEOUT.MEDIUM,
    );
  }
}

module.exports = UserEditorGeneralStepDialog;
