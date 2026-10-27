/**
 * Created on 01.10.2026.
 *
 * 'General' step of the ID provider editor: Display name, ID, Description and the Application
 * selector. The first step, so it is what opens after New (or Edit) has been clicked. The selector
 * is a search field ('Select an application') that narrows the list by display name or key; the
 * bound application is listed under it as a row with its key, a pencil button ('Edit the application configuration', when the application has a config
 * form) and a Remove button. When an existing provider is edited the ID input is read-only.
 */
const IdProviderEditorStepDialog = require('./provider.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const DIALOG = IdProviderEditorStepDialog.css.container;
const PANEL = `${DIALOG} [data-registry-id='general']`;
const APPLICATION_SELECTOR = `${DIALOG} [data-component='ApplicationSelector']`;

const css = {
  displayNameInput: `${DIALOG} input#id-provider-editor-display-name`,
  idInput: `${DIALOG} input#id-provider-editor-id`,
  descriptionTextArea: `${DIALOG} textarea#id-provider-editor-description`,
  validationMessages: `${PANEL} div.text-error`,
  // A dot is legal in an ID but makes an ambiguous vhost key, so it is warned about rather than
  // refused: its own line under the input, outside the error messages.
  idWarning: `${PANEL} div#id-provider-editor-id-warning`,
  // Application
  applicationSearchInput: `${APPLICATION_SELECTOR} [data-component='Combobox.Input']`,
  applicationToggle: `${APPLICATION_SELECTOR} [data-component='Combobox.Toggle']`,
  // The popup is portalled beside the dialog, not inside it: no DIALOG prefix.
  applicationOptions: "[data-component='Combobox.Popup'] [data-component='Listbox.Item']",
  applicationOptionByKey: (key) =>
    `[data-component='Combobox.Popup'] [data-component='Listbox.Item'][data-value='${key}']`,
  // The display name inside an option: the key is shown under it.
  applicationOptionName: "[data-component='ItemLabel'] span.font-semibold",
  // The bound application: one row under the selector (id '<key>-bound').
  applicationRow: `${PANEL} [data-component='GridList.Row'][id$='-bound']`,
  applicationName:
    `${PANEL} [data-component='GridList.Row'][id$='-bound'] ` +
    "[data-component='ItemLabel'] span.truncate",
  applicationConfigButton:
    `${PANEL} [data-component='GridList.Row'][id$='-bound'] ` +
    "button[aria-label='Edit the application configuration']",
  applicationRemoveButton: `${PANEL} [data-component='GridList.Row'][id$='-bound'] button[aria-label='Remove']`,
  applicationConfigIssueIcon: `${PANEL} [data-component='GridList.Row'][id$='-bound'] [role='img']`,
};

class IdProviderEditorGeneralStepDialog extends IdProviderEditorStepDialog {
  get step() {
    return IdProviderEditorStepDialog.STEP.GENERAL;
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

  get applicationSelectorTrigger() {
    return css.applicationSearchInput;
  }

  // Inputs

  async typeInDisplayNameInput(displayName) {
    try {
      await this.waitForElementDisplayed(css.displayNameInput);
      await this.typeTextInInput(css.displayNameInput, displayName);
    } catch (err) {
      await this.handleError(
        'New ID provider dialog - Display name input',
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
      await this.handleError('New ID provider dialog - ID input', 'err_id_input', err);
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
      await this.handleError(
        'New ID provider dialog - Description',
        'err_description_textarea',
        err,
      );
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

  // 'Avoid dots: the ID is used as a key in the virtual host configuration' - or undefined. A
  // warning, not an error: it never holds Next back, and an error under the field outranks it.
  async getIdWarning() {
    const warnings = await this.getDisplayedElements(css.idWarning);
    return warnings.length === 0 ? undefined : await warnings[0].getText();
  }

  isIdWarningDisplayed() {
    return this.isElementDisplayed(css.idWarning);
  }

  // Application selector

  isApplicationSelectorDisplayed() {
    return this.isElementDisplayed(css.applicationSearchInput);
  }

  // Disabled while the application is fixed (an existing provider whose application may not change).
  isApplicationSelectorEnabled() {
    return this.isElementEnabled(css.applicationSearchInput);
  }

  // Opens the popup with the toggle: a click on the input alone does not open it.
  async clickOnApplicationSelector() {
    try {
      await this.waitForElementDisplayed(css.applicationToggle);
      await this.clickOnElement(css.applicationToggle);
      await this.waitForElementDisplayed(css.applicationOptions);
      return await this.pause(200);
    } catch (err) {
      await this.handleError(
        'New ID provider dialog - Application selector',
        'err_application_selector',
        err,
      );
    }
  }

  // Types into the search, which opens the popup and narrows it by display name or key.
  async typeInApplicationSearch(text) {
    try {
      await this.waitForElementDisplayed(css.applicationSearchInput);
      await this.typeTextInInput(css.applicationSearchInput, text);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'New ID provider dialog - Application search',
        'err_application_search',
        err,
      );
    }
  }

  // Display names of the applications offered in the opened selector.
  async getApplicationOptions() {
    await this.waitForElementDisplayed(css.applicationOptions);
    return await this.getTextInDisplayedElements(
      `${css.applicationOptions} ${css.applicationOptionName}`,
    );
  }

  // Opens the selector and picks the application by its display name. An option carries only the
  // key (`data-value`), so the display name of each option is compared. Picking again replaces the
  // bound application.
  async selectApplication(displayName) {
    try {
      await this.clickOnApplicationSelector();
      const options = await this.getDisplayedElements(css.applicationOptions);
      for (const option of options) {
        if ((await option.$(css.applicationOptionName).getText()) === displayName) {
          await option.click();
          await this.waitForElementDisplayed(css.applicationRow);
          return await this.pause(300);
        }
      }
      throw new Error(`no option with the display name '${displayName}'`);
    } catch (err) {
      await this.handleError(
        `New ID provider dialog - application '${displayName}' was not selected`,
        'err_select_application',
        err,
      );
    }
  }

  // Opens the selector and picks the application by its key, e.g. 'com.enonic.app.standardidprovider'.
  async selectApplicationByKey(key) {
    try {
      await this.clickOnApplicationSelector();
      await this.waitForElementDisplayed(css.applicationOptionByKey(key));
      await this.clickOnElement(css.applicationOptionByKey(key));
      await this.waitForElementDisplayed(css.applicationRow);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `New ID provider dialog - application '${key}' was not selected`,
        'err_select_application',
        err,
      );
    }
  }

  // The bound application

  isApplicationRowDisplayed() {
    return this.isElementDisplayed(css.applicationRow);
  }

  async waitForApplicationRowDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.applicationRow, ms);
    } catch (err) {
      await this.handleError(
        'New ID provider dialog - the bound application row should be displayed',
        'err_application_row',
        err,
      );
    }
  }

  async waitForApplicationRowNotDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(css.applicationRow, ms);
    } catch (err) {
      await this.handleError(
        'New ID provider dialog - the bound application row should not be displayed',
        'err_application_row',
        err,
      );
    }
  }

  // Display name of the bound application - or undefined when none is bound. The first line only:
  // ItemLabel wraps the name and the configuration icon in one span, so the icon's tooltip text
  // joins the cell on a line of its own whenever that icon is there.
  async getSelectedApplication() {
    const names = await this.getDisplayedElements(css.applicationName);
    return names.length === 0 ? undefined : (await names[0].getText()).split('\n')[0];
  }

  // Only when the application has a configuration form.
  isApplicationConfigButtonDisplayed() {
    return this.isElementDisplayed(css.applicationConfigButton);
  }

  // Opens the '<application> configuration' dialog.
  async clickOnApplicationConfigButton() {
    try {
      await this.waitForElementDisplayed(css.applicationConfigButton);
      await this.clickOnElement(css.applicationConfigButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'New ID provider dialog - Edit the application configuration button',
        'err_application_config_btn',
        err,
      );
    }
  }

  // The warning icon beside the name: 'The application configuration has required fields to fill in'.
  isApplicationConfigIssueDisplayed() {
    return this.isElementDisplayed(css.applicationConfigIssueIcon);
  }

  // What that icon says - its label is the tooltip's text - or undefined when no icon is shown.
  async getApplicationConfigIssue() {
    const icons = await this.getDisplayedElements(css.applicationConfigIssueIcon);
    return icons.length === 0 ? undefined : await icons[0].getAttribute('aria-label');
  }

  // Waits for the icon to say it. Binding an application only starts the read of its configuration
  // form, and a form still loading has nothing to report: the row is there a while before the icon
  // is, so a read right after the pick finds none.
  async waitForApplicationConfigIssue(expected, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.getApplicationConfigIssue()) === expected,
        { timeout: ms, timeoutMsg: `the configuration icon should say '${expected}'` },
      );
    } catch (err) {
      await this.handleError(
        `New ID provider dialog - the configuration icon should say '${expected}'`,
        'err_application_config_issue',
        err,
      );
    }
  }

  // Waits for the icon to go: the configuration applied in the dialog satisfies the form, or the
  // application was removed.
  async waitForApplicationConfigIssueGone(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(css.applicationConfigIssueIcon, ms);
    } catch (err) {
      await this.handleError(
        'New ID provider dialog - the configuration icon should be gone',
        'err_application_config_issue_gone',
        err,
      );
    }
  }

  async clickOnRemoveApplicationButton() {
    try {
      await this.waitForElementEnabled(css.applicationRemoveButton);
      await this.clickOnElement(css.applicationRemoveButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'New ID provider dialog - Remove application button',
        'err_application_remove_btn',
        err,
      );
    }
  }

  isRemoveApplicationButtonEnabled() {
    return this.isElementEnabled(css.applicationRemoveButton);
  }

  // Flows

  // Fills the step. `provider` = { displayName, id?, description?, application? } - `application`
  // is a display name.
  async typeData(provider) {
    await this.typeInDisplayNameInput(provider.displayName);
    if (provider.id !== undefined) {
      await this.setIdIfDiffers(provider.id);
    }
    if (provider.description !== undefined) {
      await this.typeInDescriptionTextArea(provider.description);
    }
    if (provider.application !== undefined) {
      await this.selectApplication(provider.application);
    }
  }

  // Fills the step and moves on to Permissions.
  async typeDataAndClickOnNext(provider) {
    await this.typeData(provider);
    await this.clickOnNextButton();
    await this.waitForElementDisplayed(
      IdProviderEditorStepDialog.css.stepPanel(IdProviderEditorStepDialog.STEP.PERMISSIONS),
      appConst.TIMEOUT.MEDIUM,
    );
  }
}

module.exports = IdProviderEditorGeneralStepDialog;
