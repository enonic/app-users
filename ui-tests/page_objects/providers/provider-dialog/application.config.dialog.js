/**
 * Created on 26.10.2026.
 *
 * '<Application> configuration' dialog (features/idprovider-editor/ui/ConfigDialog), opened by the
 * pencil of the bound application on the ID provider editor's General step. A modal over the
 * editor: the application's own configuration form (FormRenderer) - input fields, checkboxes,
 * combo boxes, principal selectors, item sets - and in the footer Cancel and the primary Apply.
 * One dialog serves every application; what differs is the form. This class is the dialog itself,
 * and a subclass per test application names that application's fields:
 * AdfsIdProviderConfigDialog (adfs.provider.config.dialog.js) and Auth0IdProviderConfigDialog
 * (auth0.provider.config.dialog.js).
 *
 * Apply is enabled as soon as the form has loaded, filled in or not: it hands the configuration to
 * the editor, whose Create or Save writes it with the rest of the provider. The General step's red
 * icon ('The application configuration has required fields to fill in') goes once the applied
 * configuration satisfies the form. Cancel, the cross and Escape throw the edits away, asking first
 * when something was typed.
 *
 * The inputs are located by the aria-label the form gives each one - its label without the
 * asterisk ('Domain', 'Client ID', 'Client secret' in the ADFS test application). An item set
 * ('Proxy' in the Auth0 test application) is located by the title of its header; its Add button
 * appends an occurrence, a collapsible block holding the set's own inputs, labelled by its first
 * input's value.
 */
const SectionPage = require('../../section.page');
const PrincipalCombobox = require('../../principal.combobox');
const appConst = require('../../../libs/app_const');

const DIALOG = "[data-component='ConfigDialog'][data-state='open']";
const BODY = `${DIALOG} [data-component='ActionDialog.Body']`;
const FOOTER = `${DIALOG} [data-component='ActionDialog.Footer']`;

const css = {
  container: DIALOG,
  title: `${DIALOG} [data-component='Dialog.Title']`,
  closeButton: `${DIALOG} [data-component='Dialog.DefaultClose']`,
  form: `${BODY} [data-component='FormRenderer']`,
  loadingMessage: `${BODY} p.text-subtle`,
  failedMessage: `${BODY} p[role='alert']`,
  inputByLabel: (label) => `${BODY} [data-component='Input'] input[aria-label='${label}']`,
  // A PrincipalSelector input of the form: the editors' principal picker (principal.combobox.js),
  // every kind of principal from every ID provider, the provider's key beside each.
  principalSelector: `${BODY} [data-component='PrincipalSelectorInput']`,
  // 'This field is required' under a field - an input's own, a selector's FieldError or an
  // occurrence's. The text node sits in the div beside the icon.
  validationMessages: `${BODY} div.text-error`,
  // Item sets: one block per set with its title in the header, an Add button, and an
  // ItemSetOccurrenceView per occurrence - a header button labelled by the occurrence, over the
  // set's inputs.
  itemSets: `${BODY} [data-component='ItemSetView']`,
  itemSetTitle: "[data-component='SetHeader'] span.font-semibold",
  itemSetAddButton: "button[aria-label='Add']",
  itemSetOccurrenceLabel: "[data-component='ItemSetOccurrenceView'] button span.truncate",
  cancelButton: `${FOOTER} button[aria-label='Cancel']`,
  applyButton: `${FOOTER} [data-component='ActionDialog.Action']`,
  question: `${DIALOG} [data-component='ActionDialog.Question']`,
  questionText: `${DIALOG} [data-component='ActionDialog.Question'] [role='alert']`,
  keepButton: `${DIALOG} [data-component='ActionDialog.Question'] button[aria-label='Keep editing']`,
  discardButton: `${DIALOG} [data-component='ActionDialog.Question'] button[aria-label='Confirm']`,
};

// The placeholder of every PrincipalSelector input (phrase principal.selector.placeholder).
const PRINCIPAL_SELECTOR_PLACEHOLDER = 'Search users, groups and roles';

class ApplicationConfigDialog extends SectionPage {
  constructor(sectionId = appConst.SECTION_ID.ID_PROVIDERS) {
    super(sectionId);
  }

  get container() {
    return css.container;
  }

  get applyButton() {
    return css.applyButton;
  }

  // Dialog

  // The dialog is open and the configuration form has been read: the form is rendered and Apply,
  // disabled until then, is enabled. Opening the dialog starts the read, so the title is on screen
  // before the form is.
  async waitForLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.container, ms);
      await this.waitForElementDisplayed(css.form, ms);
      await this.waitForElementEnabled(css.applyButton, ms);
    } catch (err) {
      await this.handleError(
        'Application configuration dialog was not loaded',
        'err_config_dialog',
        err,
      );
    }
  }

  async waitForClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(css.container, ms);
    } catch (err) {
      await this.handleError(
        'Application configuration dialog should be closed',
        'err_config_dialog_closed',
        err,
      );
    }
  }

  isDialogDisplayed() {
    return this.isElementDisplayed(css.container);
  }

  // '<Application> configuration', e.g. 'Test ADFS ID Provider configuration'
  async getTitle() {
    await this.waitForElementDisplayed(css.title);
    return await this.getText(css.title);
  }

  // 'The configuration form could not be loaded' - or undefined.
  async getFailedMessage() {
    const messages = await this.getDisplayedElements(css.failedMessage);
    return messages.length === 0 ? undefined : await messages[0].getText();
  }

  // Inputs, by the label of the field

  isInputDisplayed(label) {
    return this.isElementDisplayed(css.inputByLabel(label));
  }

  async typeInInput(label, text) {
    try {
      await this.waitForElementDisplayed(css.inputByLabel(label));
      await this.typeTextInInput(css.inputByLabel(label), text);
    } catch (err) {
      await this.handleError(
        `Application configuration dialog - '${label}' input`,
        'err_config_input',
        err,
      );
    }
  }

  getInputValue(label) {
    return this.getTextInInput(css.inputByLabel(label));
  }

  clearInputByLabel(label) {
    return this.clearInputText(css.inputByLabel(label));
  }

  // The values of the inputs as { '<label>': '<value>' }.
  async getInputValues(labels) {
    const values = {};
    for (const label of labels) {
      values[label] = await this.getInputValue(label);
    }
    return values;
  }

  // Texts of the messages shown under the fields, e.g. 'This field is required'. Only the fields
  // that were touched report, unless the configuration applied before already broke the form: then
  // every broken field reports from the first frame.
  getValidationMessages() {
    return this.getTextInDisplayedElements(css.validationMessages);
  }

  async waitForValidationMessage(expected, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.getValidationMessages()).includes(expected),
        { timeout: ms, timeoutMsg: `the message '${expected}' should be shown` },
      );
    } catch (err) {
      await this.handleError(
        `Application configuration dialog - the message '${expected}'`,
        'err_config_validation',
        err,
      );
    }
  }

  // Item sets, by the title of the set

  // The ItemSetView element with the title - or undefined.
  async getItemSet(title) {
    const sets = await this.getDisplayedElements(css.itemSets);
    for (const set of sets) {
      if ((await set.$(css.itemSetTitle).getText()) === title) {
        return set;
      }
    }
    return undefined;
  }

  async isItemSetDisplayed(title) {
    return (await this.getItemSet(title)) !== undefined;
  }

  // Appends an occurrence to the set: a block with the set's inputs, empty.
  async clickOnItemSetAddButton(title) {
    try {
      const set = await this.getItemSet(title);
      if (set === undefined) {
        throw new Error(`no item set titled '${title}'`);
      }
      const button = await set.$(css.itemSetAddButton);
      await button.waitForClickable({ timeout: appConst.TIMEOUT.MEDIUM });
      await button.click();
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `Application configuration dialog - the Add button of '${title}'`,
        'err_config_item_set_add',
        err,
      );
    }
  }

  // The labels of the set's occurrences, in display order - the value of the occurrence's first
  // input once it has one.
  async getItemSetOccurrenceLabels(title) {
    const set = await this.getItemSet(title);
    if (set === undefined) {
      return [];
    }
    const labels = [];
    for (const label of await set.$$(css.itemSetOccurrenceLabel)) {
      labels.push(await label.getText());
    }
    return labels;
  }

  async getItemSetOccurrenceCount(title) {
    return (await this.getItemSetOccurrenceLabels(title)).length;
  }

  // Waits for the set to hold the number of occurrences: the Add click renders the block a frame
  // later.
  async waitForItemSetOccurrenceCount(title, count, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.getItemSetOccurrenceCount(title)) === count,
        { timeout: ms, timeoutMsg: `'${title}' should hold ${count} occurrence(s)` },
      );
    } catch (err) {
      await this.handleError(
        `Application configuration dialog - '${title}' should hold ${count} occurrence(s)`,
        'err_config_item_set_count',
        err,
      );
    }
  }

  // Principal selectors

  // The picker of the form's PrincipalSelector input. One per form in the test applications: the
  // Groups of 'Test ADFS ID Provider'; 'Test Auth0 ID Provider' has none.
  principalSelector() {
    return new PrincipalCombobox({
      sectionId: this.sectionId,
      container: css.container,
      placeholder: PRINCIPAL_SELECTOR_PLACEHOLDER,
      panel: css.principalSelector,
    });
  }

  // Footer

  isApplyButtonDisplayed() {
    return this.isElementDisplayed(css.applyButton);
  }

  isApplyButtonEnabled() {
    return this.isElementEnabled(css.applyButton);
  }

  async waitForApplyButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementEnabled(css.applyButton, ms);
    } catch (err) {
      await this.handleError(
        'Application configuration dialog - Apply button should be enabled',
        'err_config_apply_btn',
        err,
      );
    }
  }

  // Apply: the configuration is handed to the editor and the dialog closes, unasked.
  async clickOnApplyButton() {
    try {
      await this.waitForElementEnabled(css.applyButton);
      await this.clickOnElement(css.applyButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Application configuration dialog - Apply button',
        'err_config_apply_btn',
        err,
      );
    }
  }

  async clickOnApplyButtonAndWaitForClosed(ms = appConst.TIMEOUT.MEDIUM) {
    await this.clickOnApplyButton();
    await this.waitForClosed(ms);
  }

  async clickOnCancelButton() {
    try {
      await this.waitForElementDisplayed(css.cancelButton);
      await this.clickOnElement(css.cancelButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Application configuration dialog - Cancel button',
        'err_config_cancel_btn',
        err,
      );
    }
  }

  // Cancel on a clean form: the dialog closes without a question.
  async clickOnCancelButtonAndWaitForClosed(ms = appConst.TIMEOUT.MEDIUM) {
    await this.clickOnCancelButton();
    await this.waitForClosed(ms);
  }

  async clickOnCloseButton() {
    try {
      await this.waitForElementDisplayed(css.closeButton);
      await this.clickOnElement(css.closeButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Application configuration dialog - Close button',
        'err_config_close_btn',
        err,
      );
    }
  }

  // The close question - the footer asks before a dirty form is dropped

  isCloseQuestionDisplayed() {
    return this.isElementDisplayed(css.question);
  }

  async getCloseQuestion() {
    await this.waitForElementDisplayed(css.questionText);
    return await this.getText(css.questionText);
  }

  async waitForCloseQuestionDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.question, ms);
    } catch (err) {
      await this.handleError(
        'Application configuration dialog - the close question should be shown',
        'err_config_close_question',
        err,
      );
    }
  }

  async clickOnKeepButton() {
    try {
      await this.waitForElementDisplayed(css.keepButton);
      await this.clickOnElement(css.keepButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        "Application configuration dialog - 'Keep editing' button",
        'err_config_keep_btn',
        err,
      );
    }
  }

  async clickOnDiscardButton() {
    try {
      await this.waitForElementDisplayed(css.discardButton);
      await this.clickOnElement(css.discardButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Application configuration dialog - Confirm button',
        'err_config_discard_btn',
        err,
      );
    }
  }

  // Flows

  // Types a value into each input: `values` is { '<label>': '<text>' }.
  async typeInInputs(values) {
    for (const [label, text] of Object.entries(values)) {
      await this.typeInInput(label, text);
    }
  }

  // Types the values and applies them: the dialog closes.
  async typeInInputsAndApply(values) {
    await this.waitForLoaded();
    await this.typeInInputs(values);
    await this.clickOnApplyButtonAndWaitForClosed();
  }
}

module.exports = ApplicationConfigDialog;
