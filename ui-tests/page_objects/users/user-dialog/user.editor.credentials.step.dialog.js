/**
 * Created on 25.09.2026.
 *
 * 'Credentials' step of the user editor: the password. The input is not there until 'Set password'
 * (or 'Change password' for an existing user) has been clicked; Generate, Show/Hide and Discard sit
 * beside it, and a strength meter under it.
 * A user of the system ID provider (every service account) also gets 'Public keys' below: an Add
 * button that opens AddPublicKeyDialog (add.public.key.dialog.js), and a row per key with its label,
 * its kid (or 'Will be added when you save') and a Remove button. Everything is staged until the save.
 */
const UserEditorStepDialog = require('./user.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const DIALOG = UserEditorStepDialog.css.container;

const css = {
  passwordInput: `${DIALOG} input#user-editor-password`,
  setPasswordButton: `${DIALOG} button[data-component='Button'][aria-label='Set password']`,
  changePasswordButton: `${DIALOG} button[data-component='Button'][aria-label='Change password']`,
  clearPasswordButton: `${DIALOG} button[data-component='Button'][aria-label='Clear password']`,
  keepPasswordButton: `${DIALOG} button[data-component='Button'][aria-label='Keep password']`,
  generatePasswordButton: `${DIALOG} button[data-component='Button'][aria-label='Generate']`,
  showPasswordButton: `${DIALOG} button[aria-label='Show']`,
  hidePasswordButton: `${DIALOG} button[aria-label='Hide']`,
  discardPasswordButton: `${DIALOG} button[aria-label='Discard this password']`,
  passwordStrengthMeter: `${DIALOG} [data-component='PasswordStrengthMeter']`,
  // The first p.text-subtle of the step; the 'No public keys' line, when shown, comes after it.
  passwordNotice: `${DIALOG} [data-registry-id='credentials'] p.text-subtle`,
  validationMessages: `${DIALOG} [data-registry-id='credentials'] p.text-error`,
  // Public keys (system ID provider only)
  addPublicKeyButton: `${DIALOG} [data-registry-id='credentials'] button[data-component='Button'][aria-label='Add']`,
  publicKeyRows: `${DIALOG} [data-registry-id='credentials'] [data-component='GridList.Row'][id$='-key']`,
  publicKeyLabel: 'span.truncate.text-base',
  publicKeyKid: 'small span.truncate',
  removePublicKeyButton: (label) =>
    `${DIALOG} [data-registry-id='credentials'] button[aria-label='Remove the key ${label}']`,
  keepPublicKeyButton: `${DIALOG} [data-registry-id='credentials'] button[data-component='Button'][aria-label='Keep']`,
};

const NO_PUBLIC_KEYS = 'No public keys';
const KEY_PENDING = 'Will be added when you save';

class NewUserCredentialStepDialog extends UserEditorStepDialog {
  get step() {
    return UserEditorStepDialog.STEP.CREDENTIALS;
  }

  get passwordInput() {
    return css.passwordInput;
  }

  get setPasswordButton() {
    return css.setPasswordButton;
  }

  get changePasswordButton() {
    return css.changePasswordButton;
  }

  get clearPasswordButton() {
    return css.clearPasswordButton;
  }

  // Set / Change / Clear password

  async clickOnSetPasswordButton() {
    try {
      await this.waitForElementDisplayed(css.setPasswordButton);
      await this.clickOnElement(css.setPasswordButton);
      await this.waitForElementDisplayed(css.passwordInput);
      return await this.pause(200);
    } catch (err) {
      await this.handleError('Credentials step - Set password button', 'err_set_password_btn', err);
    }
  }

  waitForSetPasswordButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForElementDisplayed(css.setPasswordButton, ms);
  }

  isSetPasswordButtonDisplayed() {
    return this.isElementDisplayed(css.setPasswordButton);
  }

  // Existing user with a password: 'Change password' stands where 'Set password' does for a new one.
  async clickOnChangePasswordButton() {
    try {
      await this.waitForElementDisplayed(css.changePasswordButton);
      await this.clickOnElement(css.changePasswordButton);
      await this.waitForElementDisplayed(css.passwordInput);
      return await this.pause(200);
    } catch (err) {
      await this.handleError(
        'Credentials step - Change password button',
        'err_change_password_btn',
        err,
      );
    }
  }

  isChangePasswordButtonDisplayed() {
    return this.isElementDisplayed(css.changePasswordButton);
  }

  async clickOnClearPasswordButton() {
    try {
      await this.waitForElementDisplayed(css.clearPasswordButton);
      await this.clickOnElement(css.clearPasswordButton);
      return await this.pause(200);
    } catch (err) {
      await this.handleError(
        'Credentials step - Clear password button',
        'err_clear_password_btn',
        err,
      );
    }
  }

  isClearPasswordButtonDisplayed() {
    return this.isElementDisplayed(css.clearPasswordButton);
  }

  // Undoes 'Clear password'.
  async clickOnKeepPasswordButton() {
    try {
      await this.waitForElementDisplayed(css.keepPasswordButton);
      await this.clickOnElement(css.keepPasswordButton);
      return await this.pause(200);
    } catch (err) {
      await this.handleError(
        'Credentials step - Keep password button',
        'err_keep_password_btn',
        err,
      );
    }
  }

  // The line under the label: 'Optional. Without one…', 'A password is set…', 'The password will be cleared…'
  async getPasswordNotice() {
    const notices = await this.getDisplayedElements(css.passwordNotice);
    return notices.length === 0 ? undefined : await notices[0].getText();
  }

  // Password input

  // The input appears after 'Set password' / 'Change password' has been clicked.
  async typeInPasswordInput(password) {
    try {
      await this.waitForElementDisplayed(css.passwordInput);
      await this.typeTextInInput(css.passwordInput, password);
    } catch (err) {
      await this.handleError('Credentials step - Password input', 'err_password_input', err);
    }
  }

  // Reads the value whether the input is masked or shown: getValue() does not depend on the type.
  getTextInPasswordInput() {
    return this.getTextInInput(css.passwordInput);
  }

  waitForPasswordInputDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForElementDisplayed(css.passwordInput, ms);
  }

  async waitForPasswordInputNotDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(css.passwordInput, ms);
    } catch (err) {
      await this.handleError(
        'Credentials step - Password input should not be displayed',
        'err_password_input',
        err,
      );
    }
  }

  isPasswordInputDisplayed() {
    return this.isElementDisplayed(css.passwordInput);
  }

  clearPasswordInput() {
    return this.clearInputText(css.passwordInput);
  }

  // 'password' (masked) or 'text' (shown)
  getPasswordInputType() {
    return this.getAttribute(css.passwordInput, 'type');
  }

  // Generate / Show / Hide / Discard

  async clickOnGeneratePasswordButton() {
    try {
      await this.waitForElementDisplayed(css.generatePasswordButton);
      await this.clickOnElement(css.generatePasswordButton);
      return await this.pause(200);
    } catch (err) {
      await this.handleError(
        'Credentials step - Generate button',
        'err_generate_password_btn',
        err,
      );
    }
  }

  async clickOnShowPasswordButton() {
    try {
      await this.waitForElementDisplayed(css.showPasswordButton);
      await this.clickOnElement(css.showPasswordButton);
      return await this.pause(200);
    } catch (err) {
      await this.handleError(
        'Credentials step - Show password button',
        'err_show_password_btn',
        err,
      );
    }
  }

  async clickOnHidePasswordButton() {
    try {
      await this.waitForElementDisplayed(css.hidePasswordButton);
      await this.clickOnElement(css.hidePasswordButton);
      return await this.pause(200);
    } catch (err) {
      await this.handleError(
        'Credentials step - Hide password button',
        'err_hide_password_btn',
        err,
      );
    }
  }

  isShowPasswordButtonDisplayed() {
    return this.isElementDisplayed(css.showPasswordButton);
  }

  isHidePasswordButtonDisplayed() {
    return this.isElementDisplayed(css.hidePasswordButton);
  }

  // Drops the typed password: the input goes away and 'Set password' comes back.
  async clickOnDiscardPasswordButton() {
    try {
      await this.waitForElementDisplayed(css.discardPasswordButton);
      await this.clickOnElement(css.discardPasswordButton);
      return await this.pause(200);
    } catch (err) {
      await this.handleError(
        'Credentials step - Discard password button',
        'err_discard_password_btn',
        err,
      );
    }
  }

  // Strength meter

  // 0..4, from the meter's aria-valuenow
  async getPasswordStrengthScore() {
    await this.waitForElementDisplayed(css.passwordStrengthMeter);
    const value = await this.getAttribute(css.passwordStrengthMeter, 'aria-valuenow');
    return Number(value);
  }

  // The label under the meter, from aria-valuetext
  async getPasswordStrengthLabel() {
    await this.waitForElementDisplayed(css.passwordStrengthMeter);
    return await this.getAttribute(css.passwordStrengthMeter, 'aria-valuetext');
  }

  // Texts of the validation messages, e.g. the one shown for a too weak password.
  getValidationMessages() {
    return this.getTextInDisplayedElements(css.validationMessages);
  }

  // Public keys

  isAddPublicKeyButtonDisplayed() {
    return this.isElementDisplayed(css.addPublicKeyButton);
  }

  // Opens the 'New public key' dialog (add.public.key.dialog.js).
  async clickOnAddPublicKeyButton() {
    try {
      await this.waitForElementEnabled(css.addPublicKeyButton);
      await this.clickOnElement(css.addPublicKeyButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('Credentials step - Add public key button', 'err_add_key_btn', err);
    }
  }

  // Labels of the keys listed, in display order ('Unlabelled key' for one without a label).
  async getPublicKeyLabels() {
    const rows = await this.getDisplayedElements(css.publicKeyRows);
    const labels = [];
    for (const row of rows) {
      labels.push(await row.$(css.publicKeyLabel).getText());
    }
    return labels;
  }

  // The keys as { label: kid }; a key staged in this dialog has 'Will be added when you save' instead.
  async getPublicKeys() {
    const rows = await this.getDisplayedElements(css.publicKeyRows);
    const keys = {};
    for (const row of rows) {
      keys[await row.$(css.publicKeyLabel).getText()] = await row.$(css.publicKeyKid).getText();
    }
    return keys;
  }

  async isPublicKeyPending(label) {
    const keys = await this.getPublicKeys();
    return keys[label] === KEY_PENDING;
  }

  // 'No public keys' - shown while the list is empty.
  async isNoPublicKeysNoticeDisplayed() {
    const notices = await this.getTextInDisplayedElements(css.passwordNotice);
    return notices.includes(NO_PUBLIC_KEYS);
  }

  async waitForPublicKeyDisplayed(label, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.removePublicKeyButton(label), ms);
    } catch (err) {
      await this.handleError(
        `Credentials step - the public key '${label}' should be listed`,
        'err_public_key',
        err,
      );
    }
  }

  // Removes the key: a staged key goes away, a stored key is struck through until Keep is clicked.
  async clickOnRemovePublicKeyButton(label) {
    try {
      await this.waitForElementDisplayed(css.removePublicKeyButton(label));
      await this.clickOnElement(css.removePublicKeyButton(label));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `Credentials step - removing the public key '${label}'`,
        'err_remove_key_btn',
        err,
      );
    }
  }

  // Undoes the staged removal of a stored key (the first struck-through row).
  async clickOnKeepPublicKeyButton() {
    try {
      await this.waitForElementDisplayed(css.keepPublicKeyButton);
      await this.clickOnElement(css.keepPublicKeyButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('Credentials step - Keep public key button', 'err_keep_key_btn', err);
    }
  }

  isKeepPublicKeyButtonDisplayed() {
    return this.isElementDisplayed(css.keepPublicKeyButton);
  }

  // Flows

  // Set password → type it.
  async setPassword(password) {
    await this.clickOnSetPasswordButton();
    await this.typeInPasswordInput(password);
  }

  // Set password → Generate → Show; returns the generated password.
  async generatePassword() {
    await this.clickOnSetPasswordButton();
    await this.clickOnGeneratePasswordButton();
    await this.clickOnShowPasswordButton();
    return await this.getTextInPasswordInput();
  }
}

module.exports = NewUserCredentialStepDialog;
