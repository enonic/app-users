/**
 * Created on 30.09.2026.
 *
 * 'ID provider' step of the user editor: the first step of a new user, the ID provider combobox
 * (idprovider.combobox.js) with the providers to create the user in. Not shown for a service
 * account (its provider is the system store) or when an existing user is edited (the provider is
 * then read-only on the General step). With no provider to choose, the step shows a notice with a
 * link to the ID Providers section instead.
 */
const UserEditorStepDialog = require('./user.editor.step.dialog');
const IdProviderCombobox = require('../../idprovider.combobox');
const appConst = require('../../../libs/app_const');

const DIALOG = UserEditorStepDialog.css.container;

const css = {
  noProvidersNotice: `${DIALOG} [data-registry-id='idProvider'] p a`,
};

class UserEditorIdProviderStepDialog extends UserEditorStepDialog {
  constructor(sectionId = appConst.SECTION_ID.USERS) {
    super(sectionId);
    this.combobox = new IdProviderCombobox({ sectionId, container: DIALOG });
  }

  get step() {
    return UserEditorStepDialog.STEP.ID_PROVIDER;
  }

  // The combobox

  // The provider picked, e.g. 'System Id Provider' - or undefined while none is.
  getSelectedIdProvider() {
    return this.combobox.getSelectedOption();
  }

  waitForSelectedIdProvider(displayName) {
    return this.combobox.waitForSelectedOption(displayName);
  }

  isIdProviderSelectorDisplayed() {
    return this.combobox.isDisplayed();
  }

  isIdProviderSelectorEnabled() {
    return this.combobox.isEnabled();
  }

  // Drops the list of providers down.
  clickOnIdProviderSelector() {
    return this.combobox.openDropdown();
  }

  // Display names of the providers offered in the opened list.
  getIdProviderOptions() {
    return this.combobox.getOptionDisplayNames();
  }

  typeInIdProviderFilterInput(text) {
    return this.combobox.typeTextInFilterInput(text);
  }

  clickOnIdProviderOption(displayName) {
    return this.combobox.clickOnOption(displayName);
  }

  // Way 1: drops the list down and clicks the provider.
  selectIdProvider(displayName) {
    return this.combobox.selectOption(displayName);
  }

  // Way 2: filters by the display name and clicks the match.
  doFilterAndSelectIdProviderByDisplayName(displayName) {
    return this.combobox.filterAndSelectOption(displayName);
  }

  // By the provider's key, e.g. 'system'.
  selectIdProviderByKey(key) {
    return this.combobox.selectOptionByKey(key);
  }

  clickOnRemoveIdProviderButton() {
    return this.combobox.clickOnRemoveButton();
  }

  // Texts of the validation messages shown under the combobox, e.g. 'Select an ID provider'.
  getValidationMessages() {
    return this.combobox.getValidationMessages();
  }

  // The 'no ID providers' notice replaces the selector when there is none to choose from.
  isNoProvidersNoticeDisplayed() {
    return this.isElementDisplayed(css.noProvidersNotice);
  }

  // Flows

  // Moves on to General, keeping the provider already picked.
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
