/**
 * Created on 07.10.2026.
 *
 * The ID provider combobox of the editors (the 'ID provider' step of a new user and of a new
 * group): a combobox - a search input ('Select an ID provider'), a toggle that drops the list down,
 * and a popup with one option per provider showing its icon, display name and key. An option is
 * picked either by typing in the input, which filters the list, and clicking the match, or by
 * opening the list with the toggle and clicking the option.
 *
 * One instance per dialog: the constructor takes the dialog's container (the editor's
 * `css.container`) and its section, and every locator is scoped to it; the popup is portalled beside
 * the dialog, so it is not.
 */
const SectionPage = require('./section.page');
const appConst = require('../libs/app_const');
const { COMBOBOX, ITEM_LABEL } = require('../libs/elements');

function buildCss(container) {
  // The step's panel holds the label, the selector and the validation message under it.
  const PANEL = `${container} [data-registry-id='idProvider']`;
  const SCOPE = `${PANEL} [data-component='IdProviderSelector']`;
  const PICKED = `${SCOPE} [data-component='IdProviderSelector.Picked']`;
  return {
    scope: SCOPE,
    input: `${SCOPE} ${COMBOBOX.INPUT}`,
    toggle: `${SCOPE} ${COMBOBOX.TOGGLE}`,
    // The picked provider, shown under the input as an ItemLabel: its display name and its key.
    picked: PICKED,
    pickedDisplayName: `${PICKED} ${ITEM_LABEL.DISPLAY_NAME}`,
    pickedKey: `${PICKED} ${ITEM_LABEL.NAME}`,
    // A button inside the picked block, when the build gives it one (none in the current build).
    pickedRemoveButton: `${PICKED} button`,
    validationMessages: `${PANEL} p.text-error`,
    // The popup is portalled beside the dialog: no scope.
    popup: COMBOBOX.POPUP,
    options: COMBOBOX.OPTIONS,
    optionByKey: COMBOBOX.optionByValue,
    // The option the list marks as selected (aria-selected) - the picked provider, while open.
    selectedOption: COMBOBOX.SELECTED_OPTION,
    optionDisplayName: ITEM_LABEL.DISPLAY_NAME,
    optionKey: ITEM_LABEL.NAME,
    // 'Nothing matches the search', 'The search could not be run' - the popup's message
    popupMessage: COMBOBOX.POPUP_MESSAGE,
  };
}

class IdProviderCombobox extends SectionPage {
  // `container` is the CSS of the dialog the selector sits in (an editor's `css.container`).
  constructor({ sectionId, container }) {
    super(sectionId);
    this.css = buildCss(container);
  }

  get input() {
    return this.css.input;
  }

  get toggle() {
    return this.css.toggle;
  }

  // Selector

  async waitForDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.input, ms);
    } catch (err) {
      await this.handleError(
        'ID provider combobox should be displayed',
        'err_id_provider_selector',
        err,
      );
    }
  }

  isDisplayed() {
    return this.isElementDisplayed(this.css.input);
  }

  isEnabled() {
    return this.isElementEnabled(this.css.input);
  }

  // The display name of the picked provider, shown under the input - or undefined while none is.
  async getSelectedOption() {
    const names = await this.getDisplayedElements(this.css.pickedDisplayName);
    return names.length === 0 ? undefined : await names[0].getText();
  }

  // The key of the picked provider, shown under its name - or undefined while none is.
  async getSelectedOptionKey() {
    const keys = await this.getDisplayedElements(this.css.pickedKey);
    return keys.length === 0 ? undefined : await keys[0].getText();
  }

  async isOptionSelected() {
    return (await this.getSelectedOption()) !== undefined;
  }

  async waitForSelectedOption(displayName, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.getSelectedOption()) === displayName,
        { timeout: ms, timeoutMsg: `'${displayName}' should be the picked ID provider` },
      );
    } catch (err) {
      await this.handleError(
        `ID provider combobox - '${displayName}' should be picked`,
        'err_id_provider_selected',
        err,
      );
    }
  }

  // 'Select an ID provider'
  getPlaceholder() {
    return this.getAttribute(this.css.input, 'placeholder');
  }

  // Filter input

  // Types in the input: the popup opens with the providers whose name or key match.
  async typeTextInFilterInput(text) {
    try {
      await this.waitForElementDisplayed(this.css.input);
      await this.typeTextInInput(this.css.input, text);
      await this.waitForElementDisplayed(this.css.popup);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `ID provider combobox - typing '${text}' in the filter input`,
        'err_id_provider_filter',
        err,
      );
    }
  }

  clearFilterInput() {
    return this.clearInputText(this.css.input);
  }

  getTextInFilterInput() {
    return this.getTextInInput(this.css.input);
  }

  // Dropdown

  // Clicks the toggle: the popup opens with every provider, or closes when it was open.
  async clickOnDropdownHandle() {
    try {
      await this.waitForElementDisplayed(this.css.toggle);
      await this.clickOnElement(this.css.toggle);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'ID provider combobox - the dropdown handle',
        'err_id_provider_toggle',
        err,
      );
    }
  }

  async openDropdown() {
    if (!(await this.isPopupDisplayed())) {
      await this.clickOnDropdownHandle();
    }
    return await this.waitForPopupOpened();
  }

  isPopupDisplayed() {
    return this.isElementDisplayed(this.css.popup);
  }

  async waitForPopupOpened(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.popup, ms);
    } catch (err) {
      await this.handleError(
        'ID provider combobox - the popup should be opened',
        'err_id_provider_popup',
        err,
      );
    }
  }

  async waitForPopupClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.popup, ms);
    } catch (err) {
      await this.handleError(
        'ID provider combobox - the popup should be closed',
        'err_id_provider_popup',
        err,
      );
    }
  }

  // Options

  // The options shown in the opened popup as [{ displayName, key }], in display order.
  async getOptions() {
    await this.waitForElementDisplayed(this.css.popup);
    const options = await this.getDisplayedElements(this.css.options);
    const result = [];
    for (const option of options) {
      const keys = await option.$$(this.css.optionKey);
      result.push({
        displayName: await option.$(this.css.optionDisplayName).getText(),
        key: keys.length === 0 ? await option.getAttribute('data-value') : await keys[0].getText(),
      });
    }
    return result;
  }

  // Display names of the options shown, in display order.
  async getOptionDisplayNames() {
    return (await this.getOptions()).map(({ displayName }) => displayName);
  }

  // The display name of the option the opened list marks as selected - or undefined.
  async getSelectedOptionInList() {
    const options = await this.getDisplayedElements(this.css.selectedOption);
    return options.length === 0
      ? undefined
      : await options[0].$(this.css.optionDisplayName).getText();
  }

  // 'Nothing matches the search' and the like - or undefined while options are shown.
  async getPopupMessage() {
    const messages = await this.getDisplayedElements(this.css.popupMessage);
    return messages.length === 0 ? undefined : await messages[0].getText();
  }

  // Clicks the option with the display name in the opened popup; the popup closes on pick.
  async clickOnOption(displayName) {
    try {
      await this.waitForElementDisplayed(this.css.options);
      const options = await this.getDisplayedElements(this.css.options);
      for (const option of options) {
        if ((await option.$(this.css.optionDisplayName).getText()) === displayName) {
          await option.click();
          await this.waitForPopupClosed();
          return await this.pause(300);
        }
      }
      throw new Error(`no option with the display name '${displayName}'`);
    } catch (err) {
      await this.handleError(
        `ID provider combobox - option '${displayName}'`,
        'err_id_provider_option',
        err,
      );
    }
  }

  // Clicks the option with the provider's key, e.g. 'system'.
  async clickOnOptionByKey(key) {
    try {
      await this.waitForElementDisplayed(this.css.optionByKey(key));
      await this.clickOnElement(this.css.optionByKey(key));
      await this.waitForPopupClosed();
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `ID provider combobox - option '${key}'`,
        'err_id_provider_option',
        err,
      );
    }
  }

  // Removing the picked provider - the current build shows no button for it; picking another
  // provider replaces the pick.

  isRemoveButtonDisplayed() {
    return this.isElementDisplayed(this.css.pickedRemoveButton);
  }

  async clickOnRemoveButton() {
    try {
      await this.waitForElementDisplayed(this.css.pickedRemoveButton);
      await this.clickOnElement(this.css.pickedRemoveButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'ID provider combobox - the Remove button of the picked provider',
        'err_id_provider_remove',
        err,
      );
    }
  }

  // Texts of the validation messages under the selector, e.g. 'Select an ID provider'.
  getValidationMessages() {
    return this.getTextInDisplayedElements(this.css.validationMessages);
  }

  // Flows

  // Way 1: filter by the display name, then click the match.
  async filterAndSelectOption(displayName) {
    await this.typeTextInFilterInput(displayName);
    return await this.clickOnOption(displayName);
  }

  // Way 2: drop the list down, then click the option.
  async selectOption(displayName) {
    await this.openDropdown();
    return await this.clickOnOption(displayName);
  }

  async selectOptionByKey(key) {
    await this.openDropdown();
    return await this.clickOnOptionByKey(key);
  }
}

module.exports = IdProviderCombobox;
