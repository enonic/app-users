/**
 * Created on 06.10.2026.
 *
 * Base class of the step dialogs (the editors of users, service accounts, groups, roles and ID
 * providers): the dialog frame and its titles, the footer (Previous / Next / step dots) and the
 * principal picker the membership steps are built on. An editor's base class (user.editor.step.dialog.js
 * and the like) passes in its dialog's data-component, its section and its steps; one child class per
 * step adds the step's own controls.
 *
 * The dialog is portalled inside the section's shadow root, so every locator is CSS resolved through
 * SectionPage. Only the current step's panel is visible, the others are rendered with the `hidden`
 * attribute; `waitForLoaded()` therefore waits for the step's own panel.
 */
const SectionPage = require('./section.page');
const appConst = require('../libs/app_const');
const { COMBOBOX, ITEM_LABEL } = require('../libs/elements');

// The locators of a dialog, from the data-component of its content.
function buildStepDialogCss(dialogComponent) {
  const DIALOG = `[data-component='${dialogComponent}'][data-state='open']`;
  const INDICATOR = `${DIALOG} [data-component='Dialog.StepIndicator']`;
  // The picker is told apart by the placeholder of its search input.
  const PICKER = (placeholder) => `${DIALOG} ${COMBOBOX.searchByPlaceholder(placeholder)}`;
  return {
    container: DIALOG,
    title: `${DIALOG} [data-component='Dialog.Title']`,
    stepTitle: `${DIALOG} [data-component='StepDialogHeader'] h2 + span`,
    closeButton: `${DIALOG} [data-component='Dialog.DefaultClose']`,
    // Footer (wizard view)
    nextButton: `${DIALOG} [data-component='Stepper.Next']`,
    previousButton: `${DIALOG} [data-component='Stepper.Previous']`,
    // One selector per shape of the footer's primary button: Stepper.Next on the way through, a plain
    // Button labelled 'Create' or 'Save' on the last step. Never a comma-separated list - webdriverio
    // splits a deep selector on the commas when it re-matches the element.
    footerPrimaryButtons: [
      `${INDICATOR} [data-component='Stepper.Next']`,
      `${INDICATOR} button[aria-label='Create']`,
      `${INDICATOR} button[aria-label='Save']`,
    ],
    // A dot is a tab that controls its step's panel ('...-panel-<step>'); located by the step rather
    // than by its 'Go to step N' label, which shifts when a step is skipped.
    stepDot: (step) =>
      `${DIALOG} [data-component='Stepper.Dots'] button[role='tab']` +
      `[aria-controls$='-panel-${step}']`,
    selectedStepDot: `${DIALOG} [data-component='Stepper.Dots'] button[role='tab'][aria-selected='true']`,
    stepPanel: (step) =>
      `${DIALOG} [data-component='Dialog.StepContent'][data-registry-id='${step}']:not([hidden])`,
    // Principal picker: a combobox above a list of the picked principals.
    pickerInput: (placeholder) => `${DIALOG} ${COMBOBOX.inputByPlaceholder(placeholder)}`,
    pickerToggle: (placeholder) => `${PICKER(placeholder)} ${COMBOBOX.TOGGLE}`,
    pickerApply: (placeholder) => `${PICKER(placeholder)} ${COMBOBOX.APPLY}`,
    // The popup is portalled beside the dialog, not inside it: no DIALOG prefix.
    pickerPopup: COMBOBOX.POPUP,
    pickerOptions: COMBOBOX.OPTIONS,
    pickerOptionByKey: COMBOBOX.optionByValue,
    pickerEmptyMessage: COMBOBOX.POPUP_MESSAGE,
    // The display name inside an option or a picked row
    principalDisplayName: ITEM_LABEL.DISPLAY_NAME,
    pickedRows: (step) => `${DIALOG} [data-registry-id='${step}'] [data-component='GridList.Row']`,
    pickedRemoveButton: (step, displayName) =>
      `${DIALOG} [data-registry-id='${step}'] [data-component='GridList.Row'] ` +
      `button[aria-label='Remove ${displayName}']`,
    // A step's red notice ('The members could not be loaded…')
    failedNotice: (step) => `${DIALOG} [data-registry-id='${step}'] p.text-error`,
  };
}

class StepDialog extends SectionPage {
  // `dialogName` prefixes the error messages, e.g. 'User editor dialog'.
  constructor(sectionId, dialogName) {
    super(sectionId);
    this.dialogName = dialogName;
  }

  // The editor's base class exposes its locators as `static css`; the methods here read them
  // through the instance so a child of any editor gets its own.
  get css() {
    return this.constructor.css;
  }

  // The step this page object stands for, one of the editor's STEP.*; every step class overrides it.
  get step() {
    throw new Error('step is not defined for ' + this.constructor.name);
  }

  get container() {
    return this.css.container;
  }

  get stepPanel() {
    return this.css.stepPanel(this.step);
  }

  get nextButton() {
    return this.css.nextButton;
  }

  get previousButton() {
    return this.css.previousButton;
  }

  get closeButton() {
    return this.css.closeButton;
  }

  // Dialog

  // The dialog is open and this step's panel is the visible one.
  async waitForLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    const step = String(this.step);
    try {
      await this.waitForElementDisplayed(this.css.container, ms);
      await this.waitForElementDisplayed(this.stepPanel, ms);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - '${step}' step was not loaded`,
        `err_editor_${step}`,
        err,
      );
    }
  }

  async waitForDialogLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.container, ms);
    } catch (err) {
      await this.handleError(`${this.dialogName} was not loaded`, 'err_editor_dialog', err);
    }
  }

  async waitForClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.container, ms);
    } catch (err) {
      await this.handleError(`${this.dialogName} should be closed`, 'err_editor_closed', err);
    }
  }

  isDialogDisplayed() {
    return this.isElementDisplayed(this.css.container);
  }

  isStepDisplayed() {
    return this.isElementDisplayed(this.stepPanel);
  }

  // Title of the dialog: 'New user' / 'Edit user', 'New group' / 'Edit group', ...
  async getTitle() {
    await this.waitForElementDisplayed(this.css.title);
    return await this.getText(this.css.title);
  }

  // Title of the current step: 'General', 'Credentials', ...
  async getStepTitle() {
    await this.waitForElementDisplayed(this.css.stepTitle);
    return await this.getText(this.css.stepTitle);
  }

  async clickOnCloseButton() {
    try {
      await this.waitForElementDisplayed(this.css.closeButton);
      await this.clickOnElement(this.css.closeButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(`${this.dialogName} - Close button`, 'err_editor_close_btn', err);
    }
  }

  // Footer

  async clickOnNextButton() {
    try {
      await this.waitForNextButtonEnabled();
      await this.clickOnElement(this.css.nextButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(`${this.dialogName} - Next button`, 'err_editor_next_btn', err);
    }
  }

  async clickOnPreviousButton() {
    try {
      await this.waitForElementEnabled(this.css.previousButton);
      await this.clickOnElement(this.css.previousButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(`${this.dialogName} - Previous button`, 'err_editor_prev_btn', err);
    }
  }

  async waitForNextButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementEnabled(this.css.nextButton, ms);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - Next button should be enabled`,
        'err_next_btn',
        err,
      );
    }
  }

  async waitForNextButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisabled(this.css.nextButton, ms);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - Next button should be disabled`,
        'err_next_btn',
        err,
      );
    }
  }

  isNextButtonEnabled() {
    return this.isElementEnabled(this.css.nextButton);
  }

  isPreviousButtonEnabled() {
    return this.isElementEnabled(this.css.previousButton);
  }

  isPreviousButtonDisplayed() {
    return this.isElementDisplayed(this.css.previousButton);
  }

  // 'Next' on the way through; 'Create' (a new item) or 'Save' (an existing one) on the last step.
  async getNextButtonLabel() {
    for (const selector of this.css.footerPrimaryButtons) {
      if (await this.isElementDisplayed(selector)) {
        return await this.getAttribute(selector, 'aria-label');
      }
    }
    throw new Error('the footer has no Next, Create or Save button');
  }

  // Dots in the footer, one per step; `step` is one of the editor's STEP.*.
  async clickOnStepDot(step) {
    try {
      await this.waitForElementEnabled(this.css.stepDot(step));
      await this.clickOnElement(this.css.stepDot(step));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(`${this.dialogName} - '${step}' step dot`, 'err_editor_step_dot', err);
    }
  }

  isStepDotEnabled(step) {
    return this.isElementEnabled(this.css.stepDot(step));
  }

  // The step whose dot is selected, one of the editor's STEP.*.
  async getSelectedStep() {
    await this.waitForElementDisplayed(this.css.selectedStepDot);
    const controls = await this.getAttribute(this.css.selectedStepDot, 'aria-controls');
    return controls.slice(controls.lastIndexOf('-panel-') + '-panel-'.length);
  }

  // Principal picker

  // Types in the picker's search input; the popup opens with the matching principals.
  async filterPrincipals(placeholder, text) {
    try {
      await this.waitForElementDisplayed(this.css.pickerInput(placeholder));
      await this.typeTextInInput(this.css.pickerInput(placeholder), text);
      await this.waitForElementDisplayed(this.css.pickerPopup);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - '${placeholder}' picker, filtering by '${text}'`,
        'err_principal_picker_filter',
        err,
      );
    }
  }

  async clickOnPickerToggle(placeholder) {
    try {
      await this.waitForElementDisplayed(this.css.pickerToggle(placeholder));
      await this.clickOnElement(this.css.pickerToggle(placeholder));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - '${placeholder}' picker toggle`,
        'err_principal_picker_toggle',
        err,
      );
    }
  }

  // Display names of the options in the opened popup.
  async getPickerOptions() {
    await this.waitForElementDisplayed(this.css.pickerPopup);
    const options = await this.getDisplayedElements(this.css.pickerOptions);
    const names = [];
    for (const option of options) {
      names.push(await option.$(this.css.principalDisplayName).getText());
    }
    return names;
  }

  // 'Searching…', 'Nothing matches the search', 'The search could not be run' - or undefined.
  async getPickerMessage() {
    const messages = await this.getDisplayedElements(this.css.pickerEmptyMessage);
    return messages.length === 0 ? undefined : await messages[0].getText();
  }

  // Ticks the option with the display name in the opened popup (staged until Apply is clicked).
  async clickOnPickerOption(displayName) {
    try {
      await this.waitForElementDisplayed(this.css.pickerOptions);
      const options = await this.getDisplayedElements(this.css.pickerOptions);
      for (const option of options) {
        const name = await option.$(this.css.principalDisplayName).getText();
        if (name === displayName) {
          await option.click();
          return await this.pause(200);
        }
      }
      throw new Error(`no option with the display name '${displayName}'`);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - picker option '${displayName}'`,
        'err_principal_picker_option',
        err,
      );
    }
  }

  async clickOnPickerOptionByKey(key) {
    try {
      await this.waitForElementDisplayed(this.css.pickerOptionByKey(key));
      await this.clickOnElement(this.css.pickerOptionByKey(key));
      return await this.pause(200);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - picker option '${key}'`,
        'err_principal_picker_option',
        err,
      );
    }
  }

  // Applies the staged ticks: the picked principals appear in the list under the picker.
  async clickOnPickerApply(placeholder) {
    try {
      await this.waitForElementDisplayed(this.css.pickerApply(placeholder));
      await this.clickOnElement(this.css.pickerApply(placeholder));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - '${placeholder}' picker Apply button`,
        'err_principal_picker_apply',
        err,
      );
    }
  }

  // Filter → tick the option → Apply.
  async addPrincipal(placeholder, displayName) {
    await this.filterPrincipals(placeholder, displayName);
    await this.clickOnPickerOption(displayName);
    await this.clickOnPickerApply(placeholder);
  }

  // Display names of the principals picked in this step.
  async getPickedPrincipals() {
    const rows = await this.getDisplayedElements(this.css.pickedRows(this.step));
    const names = [];
    for (const row of rows) {
      names.push(await row.$(this.css.principalDisplayName).getText());
    }
    return names;
  }

  async waitForPrincipalPicked(displayName, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.pickedRemoveButton(this.step, displayName), ms);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - '${displayName}' should be picked`,
        'err_principal_picked',
        err,
      );
    }
  }

  // Clicks on the Remove icon of the picked principal.
  async removePickedPrincipal(displayName) {
    try {
      const button = this.css.pickedRemoveButton(this.step, displayName);
      await this.waitForElementDisplayed(button);
      await this.clickOnElement(button);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - removing the picked '${displayName}'`,
        'err_principal_remove',
        err,
      );
    }
  }

  // The step's red notice, e.g. 'The members could not be loaded and are not shown here' - or
  // undefined.
  async getFailedNotice() {
    const notices = await this.getDisplayedElements(this.css.failedNotice(this.step));
    return notices.length === 0 ? undefined : await notices[0].getText();
  }
}

module.exports = StepDialog;
module.exports.buildStepDialogCss = buildStepDialogCss;
