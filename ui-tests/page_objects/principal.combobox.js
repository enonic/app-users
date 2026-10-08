/**
 * Created on 08.10.2026.
 *
 * The principal picker of the editors (entities/principal/ui/PrincipalPicker): the multi-select
 * combobox the Roles, Groups, Members, Users and Permissions steps are built on. A search input
 * ('Search roles', 'Search groups', ...) with an Apply button and a toggle; a popup listing one
 * option per principal - icon, display name, name under it, a checkbox on the right - and, under
 * the input, one row per picked principal with a Remove button.
 *
 * A pick is staged: ticking options in the popup changes nothing until Apply is clicked. Two ways:
 *
 *   doFilterOptionsAndClickApply(names)  - type each name, tick its match, then Apply once
 *   doSelectOptionsFromDropdown(names)   - drop the whole list down, tick each, then Apply once
 *
 * One instance per picker: the constructor takes the dialog's container (the editor's
 * `css.container`), the step the picker is on and the placeholder of its input, which tells the
 * pickers of one dialog apart. The popup is portalled beside the dialog, so it is not scoped.
 */
const SectionPage = require('./section.page');
const appConst = require('../libs/app_const');
const { COMBOBOX, ITEM_LABEL } = require('../libs/elements');

function buildCss(container, step, placeholder) {
  const PANEL = `${container} [data-registry-id='${step}']`;
  const SEARCH = `${PANEL} ${COMBOBOX.searchByPlaceholder(placeholder)}`;
  const PICKED = `${PANEL} [data-component='GridList.Row'][id$='-picked']`;
  return {
    panel: PANEL,
    input: `${PANEL} ${COMBOBOX.inputByPlaceholder(placeholder)}`,
    toggle: `${SEARCH} ${COMBOBOX.TOGGLE}`,
    applyButton: `${SEARCH} ${COMBOBOX.APPLY}`,
    // The popup is portalled beside the dialog: no scope.
    popup: COMBOBOX.POPUP,
    options: COMBOBOX.OPTIONS,
    optionByKey: COMBOBOX.optionByValue,
    optionDisplayName: ITEM_LABEL.DISPLAY_NAME,
    optionName: ITEM_LABEL.NAME,
    optionCheckbox: "[data-component='Checkbox'] input",
    popupMessage: COMBOBOX.POPUP_MESSAGE,
    // The picked principals, listed under the input; a row's id is '<key>-picked'.
    pickedRows: PICKED,
    pickedRowByKey: (key) => `${PANEL} [data-component='GridList.Row'][id='${key}-picked']`,
    pickedDisplayName: ITEM_LABEL.DISPLAY_NAME,
    pickedName: ITEM_LABEL.NAME,
    // The ID provider of a picked principal, the muted span in its own cell (shown by the pickers
    // that span providers: groups, members, permissions).
    pickedIdProvider: "[data-component='GridList.Cell'] > span.text-subtle",
    pickedRemoveButton: (displayName) => `${PICKED} button[aria-label='Remove ${displayName}']`,
    // A step's red notice ('The memberships could not be loaded…')
    failedNotice: `${PANEL} p.text-error`,
  };
}

class PrincipalCombobox extends SectionPage {
  constructor({ sectionId, container, step, placeholder }) {
    super(sectionId);
    this.placeholder = placeholder;
    this.css = buildCss(container, step, placeholder);
  }

  get input() {
    return this.css.input;
  }

  // Filter input

  // Types in the input: the popup opens with the principals whose name or key match.
  async typeTextInFilterInput(text) {
    try {
      await this.waitForElementDisplayed(this.css.input);
      await this.typeTextInInput(this.css.input, text);
      await this.waitForElementDisplayed(this.css.popup);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `'${this.placeholder}' picker - typing '${text}' in the filter input`,
        'err_principal_picker_filter',
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

  isFilterInputDisplayed() {
    return this.isElementDisplayed(this.css.input);
  }

  // Dropdown

  // Clicks the toggle: the popup opens with every principal, or closes when it was open.
  async clickOnDropdownHandle() {
    try {
      await this.waitForElementDisplayed(this.css.toggle);
      await this.clickOnElement(this.css.toggle);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `'${this.placeholder}' picker - the dropdown handle`,
        'err_principal_picker_toggle',
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
        `'${this.placeholder}' picker - the popup should be opened`,
        'err_principal_picker_popup',
        err,
      );
    }
  }

  async waitForPopupClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.popup, ms);
    } catch (err) {
      await this.handleError(
        `'${this.placeholder}' picker - the popup should be closed`,
        'err_principal_picker_popup',
        err,
      );
    }
  }

  // Options

  // The options shown in the opened popup as [{ displayName, name, key, checked, disabled }], in
  // display order. `name` is the line under the display name, `key` the principal key.
  async getOptions() {
    await this.waitForElementDisplayed(this.css.popup);
    const options = await this.getDisplayedElements(this.css.options);
    const result = [];
    for (const option of options) {
      const checkboxes = await option.$$(this.css.optionCheckbox);
      result.push({
        displayName: await option.$(this.css.optionDisplayName).getText(),
        name: await option.$(this.css.optionName).getText(),
        key: await option.getAttribute('data-value'),
        checked:
          checkboxes.length > 0 && (await checkboxes[0].getAttribute('aria-checked')) === 'true',
        disabled: (await option.getAttribute('aria-disabled')) === 'true',
      });
    }
    return result;
  }

  // Display names of the options shown, in display order.
  async getOptionsDisplayName() {
    return (await this.getOptions()).map(({ displayName }) => displayName);
  }

  // Names (the line under the display name) of the options shown, in display order.
  async getOptionsName() {
    return (await this.getOptions()).map(({ name }) => name);
  }

  // Whether the option with the display name is ticked (staged) in the opened popup.
  async isOptionChecked(displayName) {
    const option = (await this.getOptions()).find((item) => item.displayName === displayName);
    if (option === undefined) {
      throw new Error(`'${this.placeholder}' picker - no option '${displayName}' is shown`);
    }
    return option.checked;
  }

  // 'Searching…', 'Nothing matches the search', 'The search could not be run' - or undefined.
  async getPopupMessage() {
    const messages = await this.getDisplayedElements(this.css.popupMessage);
    return messages.length === 0 ? undefined : await messages[0].getText();
  }

  // Ticks (or unticks) the option with the display name in the opened popup - staged until Apply.
  async clickOnOptionByDisplayName(displayName) {
    try {
      await this.waitForElementDisplayed(this.css.options);
      const options = await this.getDisplayedElements(this.css.options);
      for (const option of options) {
        if ((await option.$(this.css.optionDisplayName).getText()) === displayName) {
          await option.click();
          return await this.pause(200);
        }
      }
      throw new Error(`no option with the display name '${displayName}'`);
    } catch (err) {
      await this.handleError(
        `'${this.placeholder}' picker - option '${displayName}'`,
        'err_principal_picker_option',
        err,
      );
    }
  }

  async clickOnOptionByKey(key) {
    try {
      await this.waitForElementDisplayed(this.css.optionByKey(key));
      await this.clickOnElement(this.css.optionByKey(key));
      return await this.pause(200);
    } catch (err) {
      await this.handleError(
        `'${this.placeholder}' picker - option '${key}'`,
        'err_principal_picker_option',
        err,
      );
    }
  }

  // Apply

  isApplyButtonDisplayed() {
    return this.isElementDisplayed(this.css.applyButton);
  }

  // Applies the staged ticks: the picked principals appear in the list under the input, the popup
  // closes.
  async clickOnApplyButton() {
    try {
      await this.waitForElementDisplayed(this.css.applyButton);
      await this.clickOnElement(this.css.applyButton);
      await this.waitForPopupClosed();
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `'${this.placeholder}' picker - Apply button`,
        'err_principal_picker_apply',
        err,
      );
    }
  }

  // Picked principals

  // The picked principals as [{ displayName, name, idProvider }], in display order; `idProvider`
  // is the right-hand cell, undefined when the picker shows none.
  async getSelectedOptions() {
    const rows = await this.getDisplayedElements(this.css.pickedRows);
    const result = [];
    for (const row of rows) {
      const providers = await row.$$(this.css.pickedIdProvider);
      result.push({
        displayName: await row.$(this.css.pickedDisplayName).getText(),
        name: await row.$(this.css.pickedName).getText(),
        idProvider: providers.length === 0 ? undefined : await providers[0].getText(),
      });
    }
    return result;
  }

  // Display names of the picked principals, in display order.
  async getSelectedOptionsDisplayName() {
    return (await this.getSelectedOptions()).map(({ displayName }) => displayName);
  }

  // Names (the line under the display name) of the picked principals, in display order.
  async getSelectedOptionsName() {
    return (await this.getSelectedOptions()).map(({ name }) => name);
  }

  isOptionSelected(displayName) {
    return this.isElementDisplayed(this.css.pickedRemoveButton(displayName));
  }

  // The ID provider shown beside the picked principal - its key ('system'), not its display name -
  // or undefined when the row shows none.
  async getSelectedOptionIdProvider(displayName) {
    const picked = (await this.getSelectedOptions()).find(
      (item) => item.displayName === displayName,
    );
    if (picked === undefined) {
      throw new Error(`'${this.placeholder}' picker - '${displayName}' is not picked`);
    }
    return picked.idProvider;
  }

  async waitForOptionSelected(displayName, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.pickedRemoveButton(displayName), ms);
    } catch (err) {
      await this.handleError(
        `'${this.placeholder}' picker - '${displayName}' should be picked`,
        'err_principal_picked',
        err,
      );
    }
  }

  async waitForOptionNotSelected(displayName, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.pickedRemoveButton(displayName), ms);
    } catch (err) {
      await this.handleError(
        `'${this.placeholder}' picker - '${displayName}' should not be picked`,
        'err_principal_picked',
        err,
      );
    }
  }

  // Clicks the Remove button of the picked principal. A pinned row (the defaults of an ID
  // provider's permissions) keeps the button disabled, and the click fails.
  async removeSelectedOption(displayName) {
    try {
      const button = this.css.pickedRemoveButton(displayName);
      await this.waitForElementEnabled(button);
      await this.clickOnElement(button);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `'${this.placeholder}' picker - removing the picked '${displayName}'`,
        'err_principal_remove',
        err,
      );
    }
  }

  isRemoveButtonEnabled(displayName) {
    return this.isElementEnabled(this.css.pickedRemoveButton(displayName));
  }

  // 'The memberships could not be loaded…' - the step's red notice - or undefined.
  async getFailedNotice() {
    const notices = await this.getDisplayedElements(this.css.failedNotice);
    return notices.length === 0 ? undefined : await notices[0].getText();
  }

  // Flows

  // Way 1: for each display name, type it and tick the match; then Apply once. One name or a list.
  async doFilterOptionsAndClickApply(displayNames) {
    for (const displayName of [].concat(displayNames)) {
      await this.typeTextInFilterInput(displayName);
      await this.clickOnOptionByDisplayName(displayName);
    }
    return await this.clickOnApplyButton();
  }

  // Way 2: drop the whole list down, tick each display name, then Apply once. One name or a list.
  async doSelectOptionsFromDropdown(displayNames) {
    await this.openDropdown();
    for (const displayName of [].concat(displayNames)) {
      await this.clickOnOptionByDisplayName(displayName);
    }
    return await this.clickOnApplyButton();
  }
}

module.exports = PrincipalCombobox;
