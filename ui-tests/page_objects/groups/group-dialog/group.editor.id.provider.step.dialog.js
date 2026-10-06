/**
 * Created on 01.10.2026.
 *
 * 'ID provider' step of the group editor: the first step of a new group, one selector with the
 * providers to create the group in. Not shown when an existing group is edited (the provider is then
 * read-only on the General step). With no provider to choose, the step shows a notice with a link to
 * the ID Providers section instead.
 */
const GroupEditorStepDialog = require('./group.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const DIALOG = GroupEditorStepDialog.css.container;
const SELECTOR = `${DIALOG} [data-component='IdProviderSelector']`;

const css = {
  // A search field above the picked provider's row, laid out as the principal pickers are.
  searchInput: `${SELECTOR} [data-component='Combobox.Input']`,
  toggle: `${SELECTOR} [data-component='Combobox.Toggle']`,
  pickedName: `${SELECTOR} [data-component='IdProviderSelector.Picked'] [data-component='ItemLabel'] span.font-semibold`,
  // The popup is portalled beside the dialog, not inside it: no DIALOG prefix.
  options: "[data-component='Combobox.Popup'] [data-component='Listbox.Item']",
  optionByKey: (key) =>
    `[data-component='Combobox.Popup'] [data-component='Listbox.Item'][data-value='${key}']`,
  // The display name inside an option: the key is shown under it.
  optionName: "[data-component='ItemLabel'] span.font-semibold",
  validationMessages: `${DIALOG} [data-registry-id='idProvider'] p.text-error`,
  noProvidersNotice: `${DIALOG} [data-registry-id='idProvider'] p a`,
};

class GroupEditorIdProviderStepDialog extends GroupEditorStepDialog {
  get step() {
    return GroupEditorStepDialog.STEP.ID_PROVIDER;
  }

  get selectorTrigger() {
    return css.searchInput;
  }

  // Display name of the picked provider, e.g. 'System Id Provider', or undefined while none is.
  async getSelectedIdProvider() {
    const picked = await this.getDisplayedElements(css.pickedName);
    return picked.length === 0 ? undefined : await picked[0].getText();
  }

  isIdProviderSelectorDisplayed() {
    return this.isElementDisplayed(css.searchInput);
  }

  isIdProviderSelectorEnabled() {
    return this.isElementEnabled(css.searchInput);
  }

  // Opens the popup with the toggle: a click on the input alone does not open it.
  async clickOnIdProviderSelector() {
    try {
      await this.waitForElementDisplayed(css.toggle);
      await this.clickOnElement(css.toggle);
      await this.waitForElementDisplayed(css.options);
      return await this.pause(200);
    } catch (err) {
      await this.handleError(
        'New group dialog - ID provider selector',
        'err_id_provider_selector',
        err,
      );
    }
  }

  // Types into the search, which opens the popup and narrows it by display name or key.
  async typeInIdProviderSearch(text) {
    try {
      await this.waitForElementDisplayed(css.searchInput);
      await this.typeTextInInput(css.searchInput, text);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'New group dialog - ID provider search',
        'err_id_provider_search',
        err,
      );
    }
  }

  // Display names of the providers offered in the opened selector.
  async getIdProviderOptions() {
    await this.waitForElementDisplayed(css.options);
    return await this.getTextInDisplayedElements(`${css.options} ${css.optionName}`);
  }

  // Opens the selector and picks the provider by its display name. An option carries only the
  // provider's key (`data-value`), so the display name of each option is compared.
  async selectIdProvider(displayName) {
    try {
      await this.clickOnIdProviderSelector();
      const options = await this.getDisplayedElements(css.options);
      for (const option of options) {
        if ((await option.$(css.optionName).getText()) === displayName) {
          await option.click();
          return await this.pause(300);
        }
      }
      throw new Error(`no option with the display name '${displayName}'`);
    } catch (err) {
      await this.handleError(
        `New group dialog - ID provider '${displayName}' was not selected`,
        'err_select_id_provider',
        err,
      );
    }
  }

  // Opens the selector and picks the provider by its key, e.g. 'system'.
  async selectIdProviderByKey(key) {
    try {
      await this.clickOnIdProviderSelector();
      await this.waitForElementDisplayed(css.optionByKey(key));
      await this.clickOnElement(css.optionByKey(key));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `New group dialog - ID provider '${key}' was not selected`,
        'err_select_id_provider',
        err,
      );
    }
  }

  // Texts of the validation messages shown under the selector, e.g. 'Select an ID provider'.
  getValidationMessages() {
    return this.getTextInDisplayedElements(css.validationMessages);
  }

  // The 'no ID providers' notice replaces the selector when there is none to choose from.
  isNoProvidersNoticeDisplayed() {
    return this.isElementDisplayed(css.noProvidersNotice);
  }

  // Flows

  // Moves on to General, keeping the provider already shown in the selector.
  async clickOnNextAndWaitForGeneralStep() {
    await this.clickOnNextButton();
    await this.waitForElementDisplayed(
      GroupEditorStepDialog.css.stepPanel(GroupEditorStepDialog.STEP.GENERAL),
      appConst.TIMEOUT.MEDIUM,
    );
  }

  // Picks the provider by its display name and moves on to General.
  async selectIdProviderAndClickOnNext(displayName) {
    await this.selectIdProvider(displayName);
    return await this.clickOnNextAndWaitForGeneralStep();
  }
}

module.exports = GroupEditorIdProviderStepDialog;
