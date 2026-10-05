/**
 * Created on 25.09.2026.
 *
 * Base class of the user editor's steps: ID provider → General → Credentials → Roles → Groups
 * → Summary. A service account skips the ID provider step (its provider is the system store), and
 * an existing user is edited without it: the provider is then read-only on General.
 * One child class per step (user.editor.<step>.step.dialog.js) adds the step's own controls; this
 * class owns what every step shares — the dialog frame, its titles, the footer (Previous / Next /
 * step dots) and the principal picker the Roles and Groups steps are built on.
 *
 * The dialog is portalled inside the section's shadow root, so every locator is CSS resolved through
 * SectionPage (see section.page.js). Only the current step's panel is visible, the others are rendered
 * with the `hidden` attribute; `waitForLoaded()` therefore waits for the step's own panel.
 */
const SectionPage = require('../../section.page');
const appConst = require('../../../libs/app_const');

const DIALOG = "[data-component='UserEditorDialog'][data-state='open']";

const STEP = Object.freeze({
  ID_PROVIDER: 'idProvider',
  GENERAL: 'general',
  CREDENTIALS: 'credentials',
  ROLES: 'roles',
  GROUPS: 'groups',
  SUMMARY: 'summary',
});

const css = {
  container: DIALOG,
  title: `${DIALOG} [data-component='Dialog.Title']`,
  stepTitle: `${DIALOG} [data-component='StepDialogHeader'] h2 + span`,
  closeButton: `${DIALOG} [data-component='Dialog.DefaultClose']`,
  // Footer (wizard view)
  nextButton: `${DIALOG} [data-component='Stepper.Next']`,
  // The footer's primary button on any step: Stepper.Next on the way through, and on the last
  // step a plain Button labelled 'Create' or 'Save' that Dialog.StepIndicator renders instead.
  // One selector per shape: a deep selector must not be a comma-separated list.
  footerPrimaryButtons: [
    `${DIALOG} [data-component='Dialog.StepIndicator'] [data-component='Stepper.Next']`,
    `${DIALOG} [data-component='Dialog.StepIndicator'] button[aria-label='Create']`,
    `${DIALOG} [data-component='Dialog.StepIndicator'] button[aria-label='Save']`,
  ],
  previousButton: `${DIALOG} [data-component='Stepper.Previous']`,
  // A dot is a tab that controls its step's panel ('...-panel-<step>'); located by the step rather
  // than by its 'Go to step N' label, which shifts when the ID provider step is skipped.
  stepDot: (step) =>
    `${DIALOG} [data-component='Stepper.Dots'] button[role='tab']` +
    `[aria-controls$='-panel-${step}']`,
  selectedStepDot: `${DIALOG} [data-component='Stepper.Dots'] button[role='tab'][aria-selected='true']`,
  stepPanel: (step) =>
    `${DIALOG} [data-component='Dialog.StepContent'][data-registry-id='${step}']:not([hidden])`,
  // Principal picker (Roles and Groups steps): a combobox above a list of the picked principals.
  // The picker is told apart by the placeholder of its search input ('Search roles', 'Search groups').
  pickerInput: (placeholder) =>
    `${DIALOG} [data-component='Combobox.Input'][placeholder='${placeholder}']`,
  pickerToggle: (placeholder) =>
    `${DIALOG} [data-component='Combobox.Search']:has(input[placeholder='${placeholder}']) [data-component='Combobox.Toggle']`,
  pickerApply: (placeholder) =>
    `${DIALOG} [data-component='Combobox.Search']:has(input[placeholder='${placeholder}']) [data-component='Combobox.Apply']`,
  // The popup is portalled beside the dialog, not inside it: no DIALOG prefix.
  pickerPopup: "[data-component='Combobox.Popup']",
  pickerOptions: "[data-component='Combobox.Popup'] [data-component='Listbox.Item']",
  pickerOptionByKey: (key) =>
    `[data-component='Combobox.Popup'] [data-component='Listbox.Item'][data-value='${key}']`,
  pickerEmptyMessage: "[data-component='Combobox.Popup'] p",
  // The display name inside an option or a picked row
  principalDisplayName: "[data-component='ItemLabel'] span.font-semibold",
  pickedRows: (step) => `${DIALOG} [data-registry-id='${step}'] [data-component='GridList.Row']`,
  pickedRemoveButton: (step, displayName) =>
    `${DIALOG} [data-registry-id='${step}'] [data-component='GridList.Row'] button[aria-label='Remove ${displayName}']`,
};

class UserEditorStepDialog extends SectionPage {
  // The same dialog serves the Service Accounts section; pass its SECTION_ID for that copy.
  constructor(sectionId = appConst.SECTION_ID.USERS) {
    super(sectionId);
  }

  static get STEP() {
    return STEP;
  }

  static get css() {
    return css;
  }

  // The step this page object stands for, one of STEP.*; every child overrides it.
  get step() {
    throw new Error('step is not defined for ' + this.constructor.name);
  }

  get container() {
    return css.container;
  }

  get stepPanel() {
    return css.stepPanel(this.step);
  }

  get nextButton() {
    return css.nextButton;
  }

  get previousButton() {
    return css.previousButton;
  }

  get closeButton() {
    return css.closeButton;
  }

  // Dialog

  // The dialog is open and this step's panel is the visible one.
  async waitForLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.container, ms);
      await this.waitForElementDisplayed(this.stepPanel, ms);
    } catch (err) {
      await this.handleError(
        `User editor dialog - '${this.step}' step was not loaded`,
        `err_user_editor_${this.step}`,
        err,
      );
    }
  }

  async waitForDialogLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.container, ms);
    } catch (err) {
      await this.handleError('User editor dialog was not loaded', 'err_user_editor_dialog', err);
    }
  }

  async waitForClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(css.container, ms);
    } catch (err) {
      await this.handleError('User editor dialog should be closed', 'err_user_editor_closed', err);
    }
  }

  isDialogDisplayed() {
    return this.isElementDisplayed(css.container);
  }

  isStepDisplayed() {
    return this.isElementDisplayed(this.stepPanel);
  }

  // Title of the dialog: 'New user' / 'Edit user'
  async getTitle() {
    await this.waitForElementDisplayed(css.title);
    return await this.getText(css.title);
  }

  // Title of the current step: 'General', 'Credentials', ...
  async getStepTitle() {
    await this.waitForElementDisplayed(css.stepTitle);
    return await this.getText(css.stepTitle);
  }

  async clickOnCloseButton() {
    try {
      await this.waitForElementDisplayed(css.closeButton);
      await this.clickOnElement(css.closeButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('User editor dialog - Close button', 'err_user_editor_close_btn', err);
    }
  }

  // Footer

  async clickOnNextButton() {
    try {
      await this.waitForNextButtonEnabled();
      await this.clickOnElement(css.nextButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('User editor dialog - Next button', 'err_user_editor_next_btn', err);
    }
  }

  async clickOnPreviousButton() {
    try {
      await this.waitForElementEnabled(css.previousButton);
      await this.clickOnElement(css.previousButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'User editor dialog - Previous button',
        'err_user_editor_prev_btn',
        err,
      );
    }
  }

  async waitForNextButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementEnabled(css.nextButton, ms);
    } catch (err) {
      await this.handleError(
        'User editor dialog - Next button should be enabled',
        'err_next_btn',
        err,
      );
    }
  }

  async waitForNextButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisabled(css.nextButton, ms);
    } catch (err) {
      await this.handleError(
        'User editor dialog - Next button should be disabled',
        'err_next_btn',
        err,
      );
    }
  }

  isNextButtonEnabled() {
    return this.isElementEnabled(css.nextButton);
  }

  isPreviousButtonEnabled() {
    return this.isElementEnabled(css.previousButton);
  }

  // 'Next' on the way through; 'Create' (new user) or 'Save' (existing user) on the last step.
  async getNextButtonLabel() {
    for (const selector of css.footerPrimaryButtons) {
      if (await this.isElementDisplayed(selector)) {
        return await this.getAttribute(selector, 'aria-label');
      }
    }
    throw new Error('the footer has no Next, Create or Save button');
  }

  // Dots in the footer, one per step; `step` is one of STEP.*.
  async clickOnStepDot(step) {
    try {
      await this.waitForElementEnabled(css.stepDot(step));
      await this.clickOnElement(css.stepDot(step));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `User editor dialog - '${step}' step dot`,
        'err_user_editor_step_dot',
        err,
      );
    }
  }

  isStepDotEnabled(step) {
    return this.isElementEnabled(css.stepDot(step));
  }

  // The step whose dot is selected, one of STEP.*.
  async getSelectedStep() {
    await this.waitForElementDisplayed(css.selectedStepDot);
    const controls = await this.getAttribute(css.selectedStepDot, 'aria-controls');
    return controls.slice(controls.lastIndexOf('-panel-') + '-panel-'.length);
  }

  // Principal picker (Roles and Groups steps)

  // Types in the picker's search input; the popup opens with the matching principals.
  async filterPrincipals(placeholder, text) {
    try {
      await this.waitForElementDisplayed(css.pickerInput(placeholder));
      await this.typeTextInInput(css.pickerInput(placeholder), text);
      await this.waitForElementDisplayed(css.pickerPopup);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `User editor dialog - '${placeholder}' picker, filtering by '${text}'`,
        'err_principal_picker_filter',
        err,
      );
    }
  }

  async clickOnPickerToggle(placeholder) {
    try {
      await this.waitForElementDisplayed(css.pickerToggle(placeholder));
      await this.clickOnElement(css.pickerToggle(placeholder));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `User editor dialog - '${placeholder}' picker toggle`,
        'err_principal_picker_toggle',
        err,
      );
    }
  }

  // Display names of the options in the opened popup.
  async getPickerOptions() {
    await this.waitForElementDisplayed(css.pickerPopup);
    const options = await this.getDisplayedElements(css.pickerOptions);
    const names = [];
    for (const option of options) {
      names.push(await option.$(css.principalDisplayName).getText());
    }
    return names;
  }

  // 'Searching…', 'Nothing matches the search', 'The search could not be run' - or undefined.
  async getPickerMessage() {
    const messages = await this.getDisplayedElements(css.pickerEmptyMessage);
    return messages.length === 0 ? undefined : await messages[0].getText();
  }

  // Ticks the option with the display name in the opened popup (staged until Apply is clicked).
  async clickOnPickerOption(displayName) {
    try {
      await this.waitForElementDisplayed(css.pickerOptions);
      const options = await this.getDisplayedElements(css.pickerOptions);
      for (const option of options) {
        const name = await option.$(css.principalDisplayName).getText();
        if (name === displayName) {
          await option.click();
          return await this.pause(200);
        }
      }
      throw new Error(`no option with the display name '${displayName}'`);
    } catch (err) {
      await this.handleError(
        `User editor dialog - picker option '${displayName}'`,
        'err_principal_picker_option',
        err,
      );
    }
  }

  async clickOnPickerOptionByKey(key) {
    try {
      await this.waitForElementDisplayed(css.pickerOptionByKey(key));
      await this.clickOnElement(css.pickerOptionByKey(key));
      return await this.pause(200);
    } catch (err) {
      await this.handleError(
        `User editor dialog - picker option '${key}'`,
        'err_principal_picker_option',
        err,
      );
    }
  }

  // Applies the staged ticks: the picked principals appear in the list under the picker.
  async clickOnPickerApply(placeholder) {
    try {
      await this.waitForElementDisplayed(css.pickerApply(placeholder));
      await this.clickOnElement(css.pickerApply(placeholder));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `User editor dialog - '${placeholder}' picker Apply button`,
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
    const rows = await this.getDisplayedElements(css.pickedRows(this.step));
    const names = [];
    for (const row of rows) {
      names.push(await row.$(css.principalDisplayName).getText());
    }
    return names;
  }

  async waitForPrincipalPicked(displayName, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.pickedRemoveButton(this.step, displayName), ms);
    } catch (err) {
      await this.handleError(
        `User editor dialog - '${displayName}' should be picked`,
        'err_principal_picked',
        err,
      );
    }
  }

  // Clicks on the Remove icon of the picked principal.
  async removePickedPrincipal(displayName) {
    try {
      const button = css.pickedRemoveButton(this.step, displayName);
      await this.waitForElementDisplayed(button);
      await this.clickOnElement(button);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `User editor dialog - removing the picked '${displayName}'`,
        'err_principal_remove',
        err,
      );
    }
  }
}

module.exports = UserEditorStepDialog;
module.exports.STEP = STEP;
