/**
 * Created  on 04.10.2026.
 *
 * The confirmation dialog, titled 'Confirmation', in its two shapes:
 *
 * - A plain question with Confirm and Cancel (shared/ui/dialogs/ConfirmDialog): 'Do you want to
 *   close the dialog? Changes will be lost.' when a dirty editor is closed, say.
 * - A delete confirmation (DeleteConfirmDialog over ConfirmValueDialog): the question names the item
 *   ('Are you sure you want to delete <display name>?'), and the Delete button stays disabled until
 *   the expected value is typed back in the gate - the item's name for one item, the count for
 *   several ('Enter 3 in the field and click Delete:'). Each section renders it under its own
 *   data-component: UserDeleteDialog, ServiceAccountDeleteDialog, GroupDeleteDialog,
 *   RoleDeleteDialog, IdProviderDeleteDialog.
 *
 * Both are modals portalled inside the section's shadow root, so every locator is CSS resolved
 * through SectionPage; pass the SECTION_ID of the section the dialog belongs to.
 */
const SectionPage = require('./section.page');
const appConst = require('./../libs/app_const');

// The shapes of the dialog, by the data-component of their content. A deep selector must not be a
// comma-separated list (webdriverio splits it on the commas when it re-matches the element), so
// the shape is picked in the constructor rather than matched all at once.
const KIND = Object.freeze({
  // The delete confirmation of every section: '<Section>DeleteDialog'.
  DELETE: 'delete',
  // The plain question: ConfirmDialog.
  CONFIRM: 'confirm',
});

function buildCss(kind) {
  const DIALOG =
    kind === KIND.CONFIRM
      ? "[data-component='ConfirmDialog'][data-state='open']"
      : "[data-component$='DeleteDialog'][data-state='open']";
  const FOOTER = `${DIALOG} [data-component='Dialog.Footer']`;
  const GATE = `${DIALOG} [data-component='ConfirmGate']`;
  return {
    container: DIALOG,
    title: `${DIALOG} [data-component='Dialog.Title']`,
    // The question: Dialog.Description in the delete dialog, the body's paragraph in the plain one.
    question:
      kind === KIND.CONFIRM
        ? `${DIALOG} [data-component='Dialog.Body'] > div > p`
        : `${DIALOG} [data-component='Dialog.Description']`,
    targetDisplayName: `${DIALOG} [data-component='Dialog.Description'] strong`,
    // The gate (delete): 'Enter <expected> in the field and click Delete:' and the input under it.
    gate: GATE,
    gateText: `${GATE} > p`,
    expectedValue: `${GATE} > p strong`,
    confirmInput: `${GATE} input`,
    mismatchMessage: `${GATE} p.text-error`,
    // Footer: Cancel and the primary button - 'Delete' in the delete dialog, 'Confirm' otherwise.
    deleteButton: `${FOOTER} button[aria-label='Delete']`,
    confirmButton: `${FOOTER} button[aria-label='Confirm']`,
    primaryButton:
      kind === KIND.CONFIRM
        ? `${FOOTER} button[aria-label='Confirm']`
        : `${FOOTER} button[aria-label='Delete']`,
    cancelButton: `${FOOTER} button[aria-label='Cancel']`,
    closeButton: `${DIALOG} button[aria-label='Close']`,
    errorMessage: `${FOOTER} p[role='alert']`,
  };
}

class ConfirmationDialog extends SectionPage {
  // `kind` is KIND.DELETE (default) for a section's delete confirmation, KIND.CONFIRM for the plain
  // question (closing a dirty editor, say).
  constructor(sectionId = appConst.SECTION_ID.USERS, kind = KIND.DELETE) {
    super(sectionId);
    this.kind = kind;
    this.css = buildCss(kind);
  }

  static get KIND() {
    return KIND;
  }

  get container() {
    return this.css.container;
  }

  get confirmInput() {
    return this.css.confirmInput;
  }

  get deleteButton() {
    return this.css.deleteButton;
  }

  get confirmButton() {
    return this.css.confirmButton;
  }

  get cancelButton() {
    return this.css.cancelButton;
  }

  // Dialog

  async waitForDialogOpened(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.container, ms);
      await this.waitForElementDisplayed(this.css.primaryButton, ms);
    } catch (err) {
      await this.handleError('Confirmation dialog was not opened', 'err_confirmation_dialog', err);
    }
  }

  async waitForDialogClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.container, ms);
    } catch (err) {
      await this.handleError(
        'Confirmation dialog should be closed',
        'err_confirmation_dialog_closed',
        err,
      );
    }
  }

  isDialogDisplayed() {
    return this.isElementDisplayed(this.css.container);
  }

  // 'Confirmation'
  async getTitle() {
    await this.waitForElementDisplayed(this.css.title);
    return await this.getText(this.css.title);
  }

  // The question, e.g. 'Are you sure you want to delete My Group?' or 'Do you want to close the
  // dialog? Changes will be lost.'
  async getQuestion() {
    await this.waitForElementDisplayed(this.css.question);
    return await this.getText(this.css.question);
  }

  // The display name the delete question names - or undefined for several items / a plain question.
  async getTargetDisplayName() {
    const names = await this.getDisplayedElements(this.css.targetDisplayName);
    return names.length === 0 ? undefined : await names[0].getText();
  }

  // Gate (delete confirmation)

  isConfirmInputDisplayed() {
    return this.isElementDisplayed(this.css.confirmInput);
  }

  // 'Enter <expected> in the field and click Delete:'
  async getGateText() {
    await this.waitForElementDisplayed(this.css.gateText);
    return await this.getText(this.css.gateText);
  }

  // What has to be typed back: the item's name, or the count of the items as text ('3').
  async getExpectedValue() {
    await this.waitForElementDisplayed(this.css.expectedValue);
    return await this.getText(this.css.expectedValue);
  }

  async typeInConfirmInput(value) {
    try {
      await this.waitForElementDisplayed(this.css.confirmInput);
      await this.typeTextInInput(this.css.confirmInput, String(value));
      return await this.pause(300);
    } catch (err) {
      await this.handleError('Confirmation dialog - the gate input', 'err_confirm_input', err);
    }
  }

  getTextInConfirmInput() {
    return this.getTextInInput(this.css.confirmInput);
  }

  clearConfirmInput() {
    return this.clearInputText(this.css.confirmInput);
  }

  // 'Type <expected> to confirm, you typed <typed>' - shown half a second after a wrong entry - or
  // undefined.
  async getMismatchMessage() {
    const messages = await this.getDisplayedElements(this.css.mismatchMessage);
    return messages.length === 0 ? undefined : await messages[0].getText();
  }

  async waitForMismatchMessage(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.mismatchMessage, ms);
      return await this.getText(this.css.mismatchMessage);
    } catch (err) {
      await this.handleError(
        'Confirmation dialog - the mismatch message should be displayed',
        'err_confirm_mismatch',
        err,
      );
    }
  }

  // Buttons

  // Delete / Confirm - whichever the open dialog has.
  async clickOnPrimaryButton() {
    try {
      await this.waitForElementEnabled(this.css.primaryButton);
      await this.clickOnElement(this.css.primaryButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('Confirmation dialog - Delete/Confirm button', 'err_confirm_btn', err);
    }
  }

  async clickOnDeleteButton() {
    try {
      await this.waitForDeleteButtonEnabled();
      await this.clickOnElement(this.css.deleteButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('Confirmation dialog - Delete button', 'err_confirm_delete_btn', err);
    }
  }

  async clickOnConfirmButton() {
    try {
      await this.waitForConfirmButtonEnabled();
      await this.clickOnElement(this.css.confirmButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('Confirmation dialog - Confirm button', 'err_confirm_btn', err);
    }
  }

  async waitForDeleteButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.deleteButton, ms);
    } catch (err) {
      await this.handleError(
        'Confirmation dialog - Delete button should be displayed',
        'err_confirm_delete_btn',
        err,
      );
    }
  }

  async waitForDeleteButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementEnabled(this.css.deleteButton, ms);
    } catch (err) {
      await this.handleError(
        'Confirmation dialog - Delete button should be enabled',
        'err_confirm_delete_btn',
        err,
      );
    }
  }

  async waitForDeleteButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisabled(this.css.deleteButton, ms);
    } catch (err) {
      await this.handleError(
        'Confirmation dialog - Delete button should be disabled',
        'err_confirm_delete_btn',
        err,
      );
    }
  }

  isDeleteButtonEnabled() {
    return this.isElementEnabled(this.css.deleteButton);
  }

  isDeleteButtonDisplayed() {
    return this.isElementDisplayed(this.css.deleteButton);
  }

  async waitForConfirmButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementEnabled(this.css.confirmButton, ms);
    } catch (err) {
      await this.handleError(
        'Confirmation dialog - Confirm button should be enabled',
        'err_confirm_btn',
        err,
      );
    }
  }

  async waitForConfirmButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisabled(this.css.confirmButton, ms);
    } catch (err) {
      await this.handleError(
        'Confirmation dialog - Confirm button should be disabled',
        'err_confirm_btn',
        err,
      );
    }
  }

  isConfirmButtonEnabled() {
    return this.isElementEnabled(this.css.confirmButton);
  }

  isConfirmButtonDisplayed() {
    return this.isElementDisplayed(this.css.confirmButton);
  }

  async clickOnCancelButton() {
    try {
      await this.waitForElementDisplayed(this.css.cancelButton);
      await this.clickOnElement(this.css.cancelButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('Confirmation dialog - Cancel button', 'err_confirm_cancel_btn', err);
    }
  }

  async clickOnCloseButton() {
    try {
      await this.waitForElementDisplayed(this.css.closeButton);
      await this.clickOnElement(this.css.closeButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('Confirmation dialog - Close button', 'err_confirm_close_btn', err);
    }
  }

  isCancelButtonDisplayed() {
    return this.isElementDisplayed(this.css.cancelButton);
  }

  // The footer's error, when the confirmed action failed - or undefined.
  async getErrorMessage() {
    const errors = await this.getDisplayedElements(this.css.errorMessage);
    return errors.length === 0 ? undefined : await errors[0].getText();
  }

  // Flows

  // Delete confirmation: types the expected value, then Delete; the dialog goes away.
  // `expected` is the item's name for one item, the count for several; omitted, it is read from the
  // gate itself ('Enter <expected> in the field…').
  async confirmDelete(expected) {
    await this.waitForDialogOpened();
    const value = expected === undefined ? await this.getExpectedValue() : expected;
    await this.typeInConfirmInput(value);
    await this.clickOnDeleteButton();
    await this.waitForDialogClosed();
  }

  // Plain confirmation: Confirm, then the dialog goes away.
  async confirm() {
    await this.waitForDialogOpened();
    await this.clickOnConfirmButton();
    await this.waitForDialogClosed();
  }

  // Cancel, then the dialog goes away.
  async cancel() {
    await this.waitForDialogOpened();
    await this.clickOnCancelButton();
    await this.waitForDialogClosed();
  }
}

module.exports = ConfirmationDialog;
