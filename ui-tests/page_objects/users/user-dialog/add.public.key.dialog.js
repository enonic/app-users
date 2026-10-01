/**
 * Created on 01.10.2026.
 *
 * 'New public key' dialog, opened by 'Add' in the Public keys block of the Credentials step. A modal
 * (ModalDialog) over the user editor: a required Label input, a help text, an Upload button that
 * opens the browser's file chooser (a hidden input[type='file'] for .pem files), and in the footer
 * Cancel and the primary Generate. Either Generate or a successful Upload stages the key and closes
 * the dialog; a failure is reported in the footer (role='alert').
 */
const SectionPage = require('../../section.page');
const appConst = require('../../../libs/app_const');

const DIALOG = "[data-component='AddPublicKeyDialog'][data-state='open']";

const css = {
  container: DIALOG,
  title: `${DIALOG} [data-component='Dialog.Title']`,
  labelInput: `${DIALOG} input#public-key-label`,
  helpText: `${DIALOG} [data-component='Dialog.Body'] p.text-subtle`,
  fileInput: `${DIALOG} input[type='file']`,
  uploadButton: `${DIALOG} button[data-component='Button'][aria-label='Upload']`,
  generateButton: `${DIALOG} [data-component='Dialog.Footer'] button[aria-label='Generate']`,
  cancelButton: `${DIALOG} [data-component='Dialog.Footer'] button[aria-label='Cancel']`,
  closeButton: `${DIALOG} button[aria-label='Close']`,
  errorMessage: `${DIALOG} [data-component='Dialog.Footer'] p[role='alert']`,
};

class AddPublicKeyDialog extends SectionPage {
  // The same dialog serves the Users and the Service Accounts sections; pass the SECTION_ID.
  constructor(sectionId = appConst.SECTION_ID.SERVICE_ACCOUNTS) {
    super(sectionId);
  }

  get labelInput() {
    return css.labelInput;
  }

  get generateButton() {
    return css.generateButton;
  }

  get uploadButton() {
    return css.uploadButton;
  }

  async waitForLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.container, ms);
      await this.waitForElementDisplayed(css.labelInput, ms);
    } catch (err) {
      await this.handleError('Add public key dialog was not loaded', 'err_add_key_dialog', err);
    }
  }

  async waitForClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(css.container, ms);
    } catch (err) {
      await this.handleError('Add public key dialog should be closed', 'err_add_key_closed', err);
    }
  }

  isDialogDisplayed() {
    return this.isElementDisplayed(css.container);
  }

  // 'New public key'
  async getTitle() {
    await this.waitForElementDisplayed(css.title);
    return await this.getText(css.title);
  }

  async getHelpText() {
    await this.waitForElementDisplayed(css.helpText);
    return await this.getText(css.helpText);
  }

  // Label

  async typeInLabelInput(label) {
    try {
      await this.waitForElementDisplayed(css.labelInput);
      await this.typeTextInInput(css.labelInput, label);
    } catch (err) {
      await this.handleError('Add public key dialog - Label input', 'err_key_label_input', err);
    }
  }

  getTextInLabelInput() {
    return this.getTextInInput(css.labelInput);
  }

  clearLabelInput() {
    return this.clearInputText(css.labelInput);
  }

  // Generate / Upload - both disabled until a label is typed

  isGenerateButtonEnabled() {
    return this.isElementEnabled(css.generateButton);
  }

  isUploadButtonEnabled() {
    return this.isElementEnabled(css.uploadButton);
  }

  async waitForGenerateButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementEnabled(css.generateButton, ms);
    } catch (err) {
      await this.handleError(
        'Add public key dialog - Generate button should be enabled',
        'err_generate_key_btn',
        err,
      );
    }
  }

  async waitForGenerateButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisabled(css.generateButton, ms);
    } catch (err) {
      await this.handleError(
        'Add public key dialog - Generate button should be disabled',
        'err_generate_key_btn',
        err,
      );
    }
  }

  // Generates a key pair in the browser: the public half is staged, the private half is downloaded,
  // and the dialog closes.
  async clickOnGenerateButton() {
    try {
      await this.waitForElementEnabled(css.generateButton);
      await this.clickOnElement(css.generateButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Add public key dialog - Generate button',
        'err_generate_key_btn',
        err,
      );
    }
  }

  // Uploads the .pem at the absolute path through the hidden file input (the Upload button itself
  // only opens the browser's chooser, which WebDriver cannot drive).
  async uploadPublicKey(filePath) {
    try {
      const fileInput = await this.findElement(css.fileInput);
      const remotePath = await this.getBrowser().uploadFile(filePath);
      await fileInput.setValue(remotePath);
      return await this.pause(500);
    } catch (err) {
      await this.handleError(
        `Add public key dialog - uploading '${filePath}'`,
        'err_upload_key',
        err,
      );
    }
  }

  // Cancel / Close

  async clickOnCancelButton() {
    try {
      await this.waitForElementDisplayed(css.cancelButton);
      await this.clickOnElement(css.cancelButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('Add public key dialog - Cancel button', 'err_add_key_cancel', err);
    }
  }

  async clickOnCloseButton() {
    try {
      await this.waitForElementDisplayed(css.closeButton);
      await this.clickOnElement(css.closeButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('Add public key dialog - Close button', 'err_add_key_close', err);
    }
  }

  // The footer's error, e.g. 'That file is not an RSA public key…' - or undefined.
  async getErrorMessage() {
    const errors = await this.getDisplayedElements(css.errorMessage);
    return errors.length === 0 ? undefined : await errors[0].getText();
  }

  // Flows

  // Type the label → Generate → the dialog closes.
  async generateKey(label) {
    await this.waitForLoaded();
    await this.typeInLabelInput(label);
    await this.clickOnGenerateButton();
    await this.waitForClosed();
  }

  // Type the label → upload the .pem → the dialog closes.
  async uploadKey(label, filePath) {
    await this.waitForLoaded();
    await this.typeInLabelInput(label);
    await this.uploadPublicKey(filePath);
    await this.waitForClosed();
  }
}

module.exports = AddPublicKeyDialog;
