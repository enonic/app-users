/**
 * Created on 30.09.2026.
 *
 * 'ID provider' step of the user editor: the first step of a new user, one selector with the
 * providers to create the user in. Not shown for a service account (its provider is the system
 * store) or when an existing user is edited (the provider is then read-only on the General step).
 * With no provider to choose, the step shows a notice with a link to the ID Providers section
 * instead.
 */
const UserEditorStepDialog = require('./user.editor.step.dialog');
const appConst = require('../../../libs/app_const');

const DIALOG = UserEditorStepDialog.css.container;
const TRIGGER =
  `${DIALOG} [data-component='Selector.Trigger']` +
  "[aria-labelledby='user-editor-id-provider-label']";

const css = {
  selectorTrigger: TRIGGER,
  selectorValue: `${TRIGGER} [data-component='Selector.Value']`,
  // The popup is portalled beside the dialog, not inside it: no DIALOG prefix.
  options: "[data-component='SelectorPopup'] [data-component='Selector.Item']",
  optionByKey: (key) =>
    `[data-component='SelectorPopup'] [data-component='Selector.Item'][data-value='${key}']`,
  validationMessages: `${DIALOG} [data-registry-id='idProvider'] p.text-error`,
  noProvidersNotice: `${DIALOG} [data-registry-id='idProvider'] p a`,
};

class UserEditorIdProviderStepDialog extends UserEditorStepDialog {
  get step() {
    return UserEditorStepDialog.STEP.ID_PROVIDER;
  }

  get selectorTrigger() {
    return css.selectorTrigger;
  }

  // The provider shown in the closed selector, e.g. 'system', or the placeholder
  // 'Select an ID provider' while none is picked.
  async getSelectedIdProvider() {
    await this.waitForElementDisplayed(css.selectorValue);
    return await this.getText(css.selectorValue);
  }

  isIdProviderSelectorDisplayed() {
    return this.isElementDisplayed(css.selectorTrigger);
  }

  isIdProviderSelectorEnabled() {
    return this.isElementEnabled(css.selectorTrigger);
  }

  async clickOnIdProviderSelector() {
    try {
      await this.waitForElementDisplayed(css.selectorTrigger);
      await this.clickOnElement(css.selectorTrigger);
      await this.waitForElementDisplayed(css.options);
      return await this.pause(200);
    } catch (err) {
      await this.handleError(
        'New user dialog - ID provider selector',
        'err_id_provider_selector',
        err,
      );
    }
  }

  // Display names of the providers offered in the opened selector.
  async getIdProviderOptions() {
    await this.waitForElementDisplayed(css.options);
    return await this.getTextInDisplayedElements(css.options);
  }

  // Opens the selector and picks the provider by its display name. An option carries only the
  // provider's key (`data-value`), so the text of each option is compared.
  async selectIdProvider(displayName) {
    try {
      await this.clickOnIdProviderSelector();
      const options = await this.getDisplayedElements(css.options);
      for (const option of options) {
        if ((await option.getText()) === displayName) {
          await option.click();
          return await this.pause(300);
        }
      }
      throw new Error(`no option with the display name '${displayName}'`);
    } catch (err) {
      await this.handleError(
        `New user dialog - ID provider '${displayName}' was not selected`,
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
        `New user dialog - ID provider '${key}' was not selected`,
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
      UserEditorStepDialog.css.stepPanel(UserEditorStepDialog.STEP.GENERAL),
      appConst.TIMEOUT.MEDIUM,
    );
  }

  // Picks the provider by its display name and moves on to General.
  async selectIdProviderAndClickOnNext(displayName) {
    await this.selectIdProvider(displayName);
    return await this.clickOnNextAndWaitForGeneralStep();
  }
}

module.exports = UserEditorIdProviderStepDialog;
