/**
 * Created on 01.10.2026.
 *
 * Base class of the role editor's steps: General → Users → Groups → Summary. A role lives in the
 * system store, so there is no ID provider step. One child class per step
 * (role.editor.<step>.step.dialog.js) adds the step's own controls; this class owns what every step
 * shares — the dialog frame, its titles, the footer (Previous / Next / step dots) and the principal
 * picker the Users and Groups steps are built on.
 *
 * The dialog is portalled inside the section's shadow root, so every locator is CSS resolved through
 * SectionPage (see section.page.js). Only the current step's panel is visible, the others are rendered
 * with the `hidden` attribute; `waitForLoaded()` therefore waits for the step's own panel.
 */
const SectionPage = require('../../section.page');
const appConst = require('../../../libs/app_const');

const DIALOG = "[data-component='RoleEditorDialog'][data-state='open']";

const STEP = Object.freeze({
  GENERAL: 'general',
  USERS: 'users',
  GROUPS: 'groups',
  SUMMARY: 'summary',
});

// The picker is told apart by the placeholder of its search input.
const PICKER = (placeholder) =>
  `${DIALOG} [data-component='Combobox.Search']:has(input[placeholder='${placeholder}'])`;

const css = {
  container: DIALOG,
  title: `${DIALOG} [data-component='Dialog.Title']`,
  stepTitle: `${DIALOG} [data-component='StepDialogHeader'] h2 + span`,
  closeButton: `${DIALOG} [data-component='Dialog.DefaultClose']`,
  // Footer (wizard view)
  nextButton: `${DIALOG} [data-component='Stepper.Next']`,
  previousButton: `${DIALOG} [data-component='Stepper.Previous']`,
  // A dot is a tab that controls its step's panel ('...-panel-<step>'); located by the step, as in
  // the user and group editors, rather than by its 'Go to step N' label.
  stepDot: (step) =>
    `${DIALOG} [data-component='Stepper.Dots'] button[role='tab']` +
    `[aria-controls$='-panel-${step}']`,
  selectedStepDot: `${DIALOG} [data-component='Stepper.Dots'] button[role='tab'][aria-selected='true']`,
  stepPanel: (step) =>
    `${DIALOG} [data-component='Dialog.StepContent'][data-registry-id='${step}']:not([hidden])`,
  // Principal picker (Users and Groups steps): a combobox above a list of the picked principals.
  pickerInput: (placeholder) =>
    `${DIALOG} [data-component='Combobox.Input'][placeholder='${placeholder}']`,
  pickerToggle: (placeholder) => `${PICKER(placeholder)} [data-component='Combobox.Toggle']`,
  pickerApply: (placeholder) => `${PICKER(placeholder)} [data-component='Combobox.Apply']`,
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
    `${DIALOG} [data-registry-id='${step}'] [data-component='GridList.Row'] ` +
    `button[aria-label='Remove ${displayName}']`,
  // 'The members could not be loaded and are not shown here' (Users and Groups steps)
  failedNotice: (step) => `${DIALOG} [data-registry-id='${step}'] p.text-error`,
};

class RoleEditorStepDialog extends SectionPage {
  constructor(sectionId = appConst.SECTION_ID.ROLES) {
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
        `Role editor dialog - '${this.step}' step was not loaded`,
        `err_role_editor_${this.step}`,
        err,
      );
    }
  }

  async waitForDialogLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.container, ms);
    } catch (err) {
      await this.handleError('Role editor dialog was not loaded', 'err_role_editor_dialog', err);
    }
  }

  async waitForClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(css.container, ms);
    } catch (err) {
      await this.handleError('Role editor dialog should be closed', 'err_role_editor_closed', err);
    }
  }

  isDialogDisplayed() {
    return this.isElementDisplayed(css.container);
  }

  isStepDisplayed() {
    return this.isElementDisplayed(this.stepPanel);
  }

  // Title of the dialog: 'New role' / 'Edit role'
  async getTitle() {
    await this.waitForElementDisplayed(css.title);
    return await this.getText(css.title);
  }

  // Title of the current step: 'General', 'Users', 'Groups', 'Summary'
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
      await this.handleError('Role editor dialog - Close button', 'err_role_editor_close_btn', err);
    }
  }

  // Footer

  async clickOnNextButton() {
    try {
      await this.waitForNextButtonEnabled();
      await this.clickOnElement(css.nextButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('Role editor dialog - Next button', 'err_role_editor_next_btn', err);
    }
  }

  async clickOnPreviousButton() {
    try {
      await this.waitForElementEnabled(css.previousButton);
      await this.clickOnElement(css.previousButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Role editor dialog - Previous button',
        'err_role_editor_prev_btn',
        err,
      );
    }
  }

  async waitForNextButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementEnabled(css.nextButton, ms);
    } catch (err) {
      await this.handleError(
        'Role editor dialog - Next button should be enabled',
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
        'Role editor dialog - Next button should be disabled',
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

  isPreviousButtonDisplayed() {
    return this.isElementDisplayed(css.previousButton);
  }

  // 'Next' on the way through; 'Create' (new role) or 'Save' (existing role) on the last step.
  getNextButtonLabel() {
    return this.getAttribute(css.nextButton, 'aria-label');
  }

  // Dots in the footer, one per step; `step` is one of STEP.*.
  async clickOnStepDot(step) {
    try {
      await this.waitForElementEnabled(css.stepDot(step));
      await this.clickOnElement(css.stepDot(step));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `Role editor dialog - '${step}' step dot`,
        'err_role_editor_step_dot',
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

  // Principal picker (Users and Groups steps)

  // Types in the picker's search input; the popup opens with the matching principals.
  async filterPrincipals(placeholder, text) {
    try {
      await this.waitForElementDisplayed(css.pickerInput(placeholder));
      await this.typeTextInInput(css.pickerInput(placeholder), text);
      await this.waitForElementDisplayed(css.pickerPopup);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `Role editor dialog - '${placeholder}' picker, filtering by '${text}'`,
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
        `Role editor dialog - '${placeholder}' picker toggle`,
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
        `Role editor dialog - picker option '${displayName}'`,
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
        `Role editor dialog - picker option '${key}'`,
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
        `Role editor dialog - '${placeholder}' picker Apply button`,
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
        `Role editor dialog - '${displayName}' should be picked`,
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
        `Role editor dialog - removing the picked '${displayName}'`,
        'err_principal_remove',
        err,
      );
    }
  }

  // 'The members could not be loaded and are not shown here' when the read of the role failed
  // (Users and Groups steps) - or undefined.
  async getFailedNotice() {
    const notices = await this.getDisplayedElements(css.failedNotice(this.step));
    return notices.length === 0 ? undefined : await notices[0].getText();
  }
}

module.exports = RoleEditorStepDialog;
