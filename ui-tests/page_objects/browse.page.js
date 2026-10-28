/**
 * Created on 02.10.2026.
 *
 * Base class of the five browse screens (Users, Service Accounts, Groups, Roles, ID Providers):
 * the same toolbar (New, Delete), search box with its filter dropdown, list header (Select all,
 * Sort by, Refresh) and list of rows, differing only in the page's data-component, the section the
 * shadow root belongs to, the fields the filter offers and what a row shows on its right. A
 * section's page object passes those in and adds what is its own (the Edit button of Users, the
 * key format of its rows, a pick in its own filter field).
 *
 * Right-clicking a row opens the same actions as a context menu, so the toolbar's rules are asserted
 * once here and read back from both.
 *
 * Locators are CSS, resolved inside the section's shadow root (see SectionPage). A row's id ends
 * with '-item-<key>', the key being the item's own key (a principal key for users, groups and roles,
 * the provider key for ID providers); rows are also found by what they show, since CSS cannot match
 * text.
 */
const SectionPage = require('./section.page');
const appConst = require('../libs/app_const');
const { COMBOBOX } = require('../libs/elements');

const CONTEXT_MENU = "[data-component='BrowseListContextMenu'][role='menu']";

// The browse toolbar carries its own name in place of the library's 'Toolbar.Container'
// (app-users#2764); the buttons keep 'Toolbar.Item', which Slot puts on the button element itself.
function buildCss(pageComponent) {
  const PAGE = `[data-component='${pageComponent}']`;
  const TOOLBAR = `${PAGE} [data-component='BrowseToolbar'][aria-label='Actions']`;
  const HEADER = `${PAGE} [data-component='BrowseListHeader']`;
  const LIST = `${PAGE} [data-component='BrowseList']`;
  const ROW = `${LIST} [data-component='BrowseListRow']`;
  const SEARCH = `${PAGE} [data-component='FilterInput']`;
  return {
    container: PAGE,
    toolbar: TOOLBAR,
    toolbarButtons: `${TOOLBAR} button[data-component='Toolbar.Item']`,
    toolbarButton: (label) =>
      `${TOOLBAR} button[data-component='Toolbar.Item'][aria-label='${label}']`,
    // Search: the kit's FilterInput (BrowseScreen). Text narrows the list only once Enter has made
    // it a tag; the tags are the terms in force, the input empties on each.
    search: SEARCH,
    searchInput: `${SEARCH} input[data-component='Combobox.Input']`,
    searchTerms: `${SEARCH} [data-component='Tag'] [data-component='Tag.Label']`,
    searchTermRemoveButton: (text) =>
      `${SEARCH} [data-component='Tag.Remove'][aria-label='Remove ${text}']`,
    searchClearButton: `${SEARCH} button[aria-label='Clear the filter']`,
    // The dropdown of the search box (the FilterInput's Combobox.Popup), portalled into
    // AppRoot.PortalLayer like the Sort menu: no page prefix. Its options are Listbox.Items whose
    // 'data-value' is 'field:<id>' while the fields are offered and 'value:<id>' once a field has
    // been entered - its values, each with the number of rows it would leave, disabled while that
    // number is 0 and the value is not picked.
    filterPopup: COMBOBOX.POPUP,
    filterFieldOption: (id) =>
      `${COMBOBOX.POPUP} [data-component='Listbox.Item'][data-value='field:${id}']`,
    filterValueOptions: `${COMBOBOX.POPUP} [data-component='Listbox.Item'][data-value^='value:']`,
    filterValueOption: (id) =>
      `${COMBOBOX.POPUP} [data-component='Listbox.Item'][data-value='value:${id}']`,
    filterOptionLabel: 'span.truncate',
    filterOptionCount: 'span.tabular-nums',
    // The input once a field has been entered: it invites one of the field's values.
    filterValueInput: `${SEARCH} input[data-component='Combobox.Input'][placeholder='Pick a value']`,
    // List header (BrowseListHeader)
    listHeader: HEADER,
    selectAllCheckbox: `${HEADER} [data-component='Checkbox'] input`,
    selectAllCheckboxLabel: `${HEADER} [data-component='Checkbox'] label`,
    refreshButton: `${HEADER} button[aria-label='Refresh']`,
    // The sort trigger's tooltip follows the current order, so it is located by its component name;
    // the open menu is rendered in AppRoot.PortalLayer, still inside the section's shadow root.
    sortButton: `${PAGE} button[data-component='BrowseSort']`,
    sortMenu: "[data-component='BrowseSort.Menu'][role='menu']",
    sortMenuItems: "[data-component='BrowseSort.Menu'][role='menu'] [role='menuitemradio']",
    // List: the rows live in a TreeList (role 'tree')
    list: `${LIST} [role='tree']`,
    listMessage: `${PAGE} [data-component='BrowseListMessage']`,
    rows: ROW,
    rowByKey: (key) => `${ROW}[id$='-item-${key}']`,
    rowCheckbox: (key) => `${ROW}[id$='-item-${key}'] [data-component='Checkbox'] input`,
    rowCheckboxLabel: (key) => `${ROW}[id$='-item-${key}'] [data-component='Checkbox'] label`,
    // Inside a row: the bold display name, the name under it, the right-hand column (meta)
    rowDisplayName: "[data-component='ItemLabel'] span.font-semibold",
    rowName: "[data-component='ItemLabel'] small",
    rowMeta: "[data-component='TreeList.RowRight'] span",
    rowCheckboxLabelInRow: "[data-component='Checkbox'] label",
    // The row menu (BrowseListContextMenu): the toolbar's own actions, offered over the row that was
    // right-clicked. Like the Sort menu it is portalled into AppRoot.PortalLayer, still inside the
    // section's shadow root, so it carries no page prefix either.
    contextMenu: CONTEXT_MENU,
    contextMenuItems: `${CONTEXT_MENU} [data-component='ContextMenu.Item']`,
  };
}

class BrowsePage extends SectionPage {
  // `pageName` prefixes the error messages, e.g. 'Users page'.
  constructor({ sectionId, pageComponent, pageName }) {
    super(sectionId);
    this.pageName = pageName;
    this.css = buildCss(pageComponent);
  }

  get container() {
    return this.css.container;
  }

  get toolbar() {
    return this.css.toolbar;
  }

  get newButton() {
    return this.css.toolbarButton('New');
  }

  get deleteButton() {
    return this.css.toolbarButton('Delete');
  }

  get searchInput() {
    return this.css.searchInput;
  }

  get selectAllCheckbox() {
    return this.css.selectAllCheckbox;
  }

  get refreshButton() {
    return this.css.refreshButton;
  }

  get sortButton() {
    return this.css.sortButton;
  }

  get sortMenu() {
    return this.css.sortMenu;
  }

  get list() {
    return this.css.list;
  }

  // Page

  async waitForLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.container, ms);
      await this.waitForElementDisplayed(this.css.toolbar, ms);
    } catch (err) {
      await this.handleError(`${this.pageName} was not loaded`, 'err_browse_page', err);
    }
  }

  async waitForToolbarLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.toolbar, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - toolbar was not loaded`,
        'err_browse_toolbar',
        err,
      );
    }
  }

  // Returns aria-labels of the buttons currently rendered in the toolbar, in display order.
  async getToolbarButtonLabels() {
    const buttons = await this.findElements(this.css.toolbarButtons);
    return await Promise.all(buttons.map((el) => el.getAttribute('aria-label')));
  }

  // Waits for the toolbar's 'role' attribute (accessibility check).
  async waitForBrowseToolbarRoleAttribute(expectedRole) {
    await this.waitForAttributeValue(this.css.toolbar, 'role', expectedRole);
  }

  // Buttons - the same six methods for each: see newButton, deleteButton, refreshButton, sortButton.

  async clickOnButton(selector, label, screenshot) {
    try {
      await this.waitForElementEnabled(selector);
      await this.clickOnElement(selector);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on ${label} button`,
        screenshot,
        err,
      );
    }
  }

  async waitForButtonDisplayed(selector, label, screenshot, ms) {
    try {
      await this.waitForElementDisplayed(selector, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - ${label} button should be displayed`,
        screenshot,
        err,
      );
    }
  }

  async waitForButtonEnabled(selector, label, screenshot, ms) {
    try {
      await this.waitForElementEnabled(selector, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - ${label} button should be enabled`,
        screenshot,
        err,
      );
    }
  }

  async waitForButtonDisabled(selector, label, screenshot, ms) {
    try {
      await this.waitForElementDisabled(selector, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - ${label} button should be disabled`,
        screenshot,
        err,
      );
    }
  }

  // New

  clickOnNewButton() {
    return this.clickOnButton(this.newButton, 'New', 'err_new_btn');
  }

  waitForNewButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonDisplayed(this.newButton, 'New', 'err_new_btn', ms);
  }

  waitForNewButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonEnabled(this.newButton, 'New', 'err_new_btn', ms);
  }

  waitForNewButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonDisabled(this.newButton, 'New', 'err_new_btn', ms);
  }

  isNewButtonEnabled() {
    return this.isElementEnabled(this.newButton);
  }

  isNewButtonDisplayed() {
    return this.isElementDisplayed(this.newButton);
  }

  // Delete

  clickOnDeleteButton() {
    return this.clickOnButton(this.deleteButton, 'Delete', 'err_delete_btn');
  }

  waitForDeleteButtonDisplayed(ms = appConst.TIMEOUT.SHORT) {
    return this.waitForButtonDisplayed(this.deleteButton, 'Delete', 'err_delete_btn', ms);
  }

  waitForDeleteButtonEnabled(ms = appConst.TIMEOUT.SHORT) {
    return this.waitForButtonEnabled(this.deleteButton, 'Delete', 'err_delete_btn', ms);
  }

  waitForDeleteButtonDisabled(ms = appConst.TIMEOUT.SHORT) {
    return this.waitForButtonDisabled(this.deleteButton, 'Delete', 'err_delete_btn', ms);
  }

  isDeleteButtonEnabled() {
    return this.isElementEnabled(this.deleteButton);
  }

  isDeleteButtonDisplayed() {
    return this.isElementDisplayed(this.deleteButton);
  }

  // Refresh

  clickOnRefreshButton() {
    return this.clickOnButton(this.refreshButton, 'Refresh', 'err_refresh_btn');
  }

  waitForRefreshButtonDisplayed(ms = appConst.TIMEOUT.SHORT) {
    return this.waitForButtonDisplayed(this.refreshButton, 'Refresh', 'err_refresh_btn', ms);
  }

  waitForRefreshButtonEnabled(ms = appConst.TIMEOUT.SHORT) {
    return this.waitForButtonEnabled(this.refreshButton, 'Refresh', 'err_refresh_btn', ms);
  }

  waitForRefreshButtonDisabled(ms = appConst.TIMEOUT.SHORT) {
    return this.waitForButtonDisabled(this.refreshButton, 'Refresh', 'err_refresh_btn', ms);
  }

  isRefreshButtonEnabled() {
    return this.isElementEnabled(this.refreshButton);
  }

  isRefreshButtonDisplayed() {
    return this.isElementDisplayed(this.refreshButton);
  }

  // Search

  // Types without committing: the list stays as it is until addSearchTerm's Enter.
  async typeTextInSearchInput(text) {
    try {
      await this.waitForElementDisplayed(this.css.searchInput);
      await this.typeTextInInput(this.css.searchInput, text);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after typing in the search input`,
        'err_search_input',
        err,
      );
    }
  }

  async clearSearchInput() {
    try {
      await this.clearInputText(this.css.searchInput);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clearing the search input`,
        'err_search_input',
        err,
      );
    }
  }

  getTextInSearchInput() {
    return this.getTextInInput(this.css.searchInput);
  }

  // Types the text and presses Enter: it becomes a tag and the list is narrowed by it.
  async addSearchTerm(text) {
    try {
      await this.typeTextInSearchInput(text);
      await this.pressEnterKey();
      await this.waitForElementDisplayed(this.css.searchTermRemoveButton(text));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after adding the search term '${text}'`,
        'err_search_term',
        err,
      );
    }
  }

  // Labels of the terms in force, in the order they were added; a field term reads as its value.
  getSearchTerms() {
    return this.getTextInElements(this.css.searchTerms);
  }

  async removeSearchTerm(text) {
    try {
      await this.clickOnElement(this.css.searchTermRemoveButton(text));
      await this.waitForElementNotDisplayed(this.css.searchTermRemoveButton(text));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after removing the search term '${text}'`,
        'err_search_term',
        err,
      );
    }
  }

  // The cross at the right end of the box, shown while a term is in force: every term goes.
  async clickOnClearSearchButton() {
    try {
      await this.clickOnElement(this.css.searchClearButton);
      await this.waitForElementNotDisplayed(this.css.searchClearButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clearing the search`,
        'err_search_clear',
        err,
      );
    }
  }

  isSearchInputDisplayed() {
    return this.isElementDisplayed(this.css.searchInput);
  }

  // Filter dropdown

  // A click in the search input opens the dropdown on its first stage, the fields (not a focus:
  // the focus Escape returns to the input must not reopen it).
  async openFilterDropdown() {
    try {
      await this.waitForElementDisplayed(this.css.searchInput);
      await this.clickOnElement(this.css.searchInput);
      await this.waitForElementDisplayed(this.css.filterPopup);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after opening the filter dropdown`,
        'err_filter_dropdown',
        err,
      );
    }
  }

  // Enters the field with the id ('idProvider'): its option is clicked and the dropdown moves on
  // to the field's values, the input now inviting one ('Pick a value').
  async openFilterFieldValues(fieldId) {
    try {
      if (!(await this.isElementDisplayed(this.css.filterPopup))) {
        await this.openFilterDropdown();
      }
      await this.clickOnElement(this.css.filterFieldOption(fieldId));
      await this.waitForElementDisplayed(this.css.filterValueInput);
      await this.waitForElementDisplayed(this.css.filterPopup);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after entering the filter field '${fieldId}'`,
        'err_filter_field',
        err,
      );
    }
  }

  // The values the entered field offers as [{ id, label, count, disabled, selected }], in display
  // order: `count` is the number of rows the value would leave (undefined without one), `disabled`
  // whether the option is greyed out - a value with no rows and not picked is.
  async getFilterValues() {
    await this.waitForElementDisplayed(this.css.filterValueOptions);
    const options = await this.getDisplayedElements(this.css.filterValueOptions);
    const values = [];
    for (const option of options) {
      const counts = await option.$$(this.css.filterOptionCount);
      values.push({
        id: (await option.getAttribute('data-value')).slice('value:'.length),
        label: await option.$(this.css.filterOptionLabel).getText(),
        count:
          counts.length === 0
            ? undefined
            : Number((await counts[0].getText()).replace(/[()\s]/g, '')),
        disabled: (await option.getAttribute('aria-disabled')) === 'true',
        selected: (await option.getAttribute('aria-selected')) === 'true',
      });
    }
    return values;
  }

  // Picks the value with the id ('system', a provider key) of the entered field: it becomes a term
  // whose tag reads the value and whose Remove button names '<field>: <value>', and the list is
  // narrowed by it. A pick by click closes the dropdown (the values stay open across keyboard picks
  // only), so it is not waited for either way. `label` is what the tag's Remove button names.
  async clickOnFilterValue(id, label) {
    try {
      await this.waitForElementDisplayed(this.css.filterValueOption(id));
      await this.clickOnElement(this.css.filterValueOption(id));
      await this.waitForElementDisplayed(this.css.searchTermRemoveButton(label));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after picking the filter value '${id}'`,
        'err_filter_value',
        err,
      );
    }
  }

  // Escape steps out of the entered field, a second one closes the dropdown.
  async closeFilterDropdown() {
    try {
      if (await this.isElementDisplayed(this.css.filterValueInput)) {
        await this.pressEscKey();
      }
      if (await this.isElementDisplayed(this.css.filterPopup)) {
        await this.pressEscKey();
      }
      await this.waitForElementNotDisplayed(this.css.filterPopup);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after closing the filter dropdown`,
        'err_filter_dropdown',
        err,
      );
    }
  }

  isFilterDropdownDisplayed() {
    return this.isElementDisplayed(this.css.filterPopup);
  }

  // Waits until no field is entered any more: the input invites a search again, not a value.
  // 'Clear the filter' and Escape both step out of the field without closing the dropdown.
  async waitForFilterFieldLeft(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.filterValueInput, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the filter field should have been left`,
        'err_filter_field',
        err,
      );
    }
  }

  // Sort by

  async clickOnSortButton() {
    try {
      await this.waitForElementEnabled(this.sortButton);
      await this.clickOnElement(this.sortButton);
      await this.waitForElementDisplayed(this.css.sortMenu);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on Sort by button`,
        'err_sort_btn',
        err,
      );
    }
  }

  waitForSortButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonDisplayed(this.sortButton, 'Sort by', 'err_sort_btn', ms);
  }

  waitForSortButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonEnabled(this.sortButton, 'Sort by', 'err_sort_btn', ms);
  }

  waitForSortButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonDisabled(this.sortButton, 'Sort by', 'err_sort_btn', ms);
  }

  isSortButtonEnabled() {
    return this.isElementEnabled(this.sortButton);
  }

  isSortButtonDisplayed() {
    return this.isElementDisplayed(this.sortButton);
  }

  // Returns the current sort order without opening the menu: the trigger's tooltip, kept in the
  // sr-only node its aria-describedby points to, is the label of the picked item
  // (appConst.SORT_MENU_ITEM.*), or 'Sort by' while nothing matches an option.
  async getSelectedSortOrder() {
    await this.waitForElementDisplayed(this.sortButton);
    const tooltipId = await this.getAttribute(this.sortButton, 'aria-describedby');
    if (tooltipId == null) {
      return null;
    }
    const tooltip = await this.findElement(`[id='${tooltipId}']`);
    return await tooltip.getProperty('textContent');
  }

  async waitForSelectedSortOrder(expectedItem) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.getSelectedSortOrder()) === expectedItem,
        { timeout: appConst.TIMEOUT.MEDIUM, timeoutMsg: `sort order is not '${expectedItem}'` },
      );
    } catch (err) {
      await this.handleError(
        `${this.pageName} - expected sort order '${expectedItem}' is not selected`,
        'err_sort_order',
        err,
      );
    }
  }

  // The field shown on the trigger itself, e.g. 'Display name'.
  async getSortButtonLabel() {
    await this.waitForElementDisplayed(this.sortButton);
    return await this.getText(this.sortButton);
  }

  // 'true' while the order differs from the default one (the trigger is then lit).
  async isSortButtonActive() {
    const active = await this.getAttribute(this.sortButton, 'data-active');
    return active === 'true';
  }

  async waitForSortMenuOpened(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.sortMenu, ms);
    } catch (err) {
      await this.handleError(`${this.pageName} - Sort menu should be opened`, 'err_sort_menu', err);
    }
  }

  async waitForSortMenuClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.sortMenu, ms);
    } catch (err) {
      await this.handleError(`${this.pageName} - Sort menu should be closed`, 'err_sort_menu', err);
    }
  }

  isSortMenuDisplayed() {
    return this.isElementDisplayed(this.css.sortMenu);
  }

  // Returns the labels of the items in the open Sort menu, in display order (appConst.SORT_MENU_ITEM):
  // Users, Service Accounts and Groups offer four, Roles and ID Providers the two by display name.
  async getSortMenuItems() {
    await this.waitForElementDisplayed(this.css.sortMenu);
    return await this.getTextInElements(this.css.sortMenuItems);
  }

  // Returns the label of the checked item in the open Sort menu.
  async getSelectedSortMenuItem() {
    await this.waitForElementDisplayed(this.css.sortMenu);
    const items = await this.findElements(this.css.sortMenuItems);
    for (const item of items) {
      if ((await item.getAttribute('aria-checked')) === 'true') {
        return await item.getText();
      }
    }
    throw new Error(`${this.pageName} - no item is checked in the Sort menu`);
  }

  // Clicks the item with the given label (appConst.SORT_MENU_ITEM.*) in the open Sort menu.
  // The menu closes on pick.
  async clickOnSortMenuItem(itemName) {
    try {
      await this.waitForElementDisplayed(this.css.sortMenu);
      const items = await this.findElements(this.css.sortMenuItems);
      for (const item of items) {
        if ((await item.getText()).trim() === itemName) {
          await item.click();
          await this.waitForSortMenuClosed();
          return await this.pause(300);
        }
      }
      throw new Error(`item '${itemName}' was not found in the Sort menu`);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on the Sort menu item '${itemName}'`,
        'err_sort_menu_item',
        err,
      );
    }
  }

  // Opens the Sort menu and picks the item.
  async selectSortOrder(itemName) {
    await this.clickOnSortButton();
    return await this.clickOnSortMenuItem(itemName);
  }

  // Closes the open menu without picking.
  async closeSortMenu() {
    await this.pressEscKey();
    return await this.waitForSortMenuClosed();
  }

  // Select all

  async clickOnSelectAllCheckbox() {
    try {
      await this.waitForElementDisplayed(this.css.selectAllCheckboxLabel);
      await this.clickOnElement(this.css.selectAllCheckboxLabel);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - Select all checkbox`,
        'err_select_all_checkbox',
        err,
      );
    }
  }

  async isSelectAllCheckboxSelected() {
    const checked = await this.getAttribute(this.css.selectAllCheckbox, 'aria-checked');
    return checked === 'true';
  }

  isSelectAllCheckboxDisplayed() {
    return this.isElementDisplayed(this.css.selectAllCheckboxLabel);
  }

  // List

  async waitForListLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.list, ms);
    } catch (err) {
      await this.handleError(`${this.pageName} - the list was not loaded`, 'err_browse_list', err);
    }
  }

  // 'No users', 'No groups', ... - shown instead of the list while it is empty - or undefined.
  async getListMessage() {
    const messages = await this.getDisplayedElements(this.css.listMessage);
    return messages.length === 0 ? undefined : await messages[0].getText();
  }

  // Display names of the rows, in display order.
  async getRowDisplayNames() {
    const rows = await this.getDisplayedElements(this.css.rows);
    const names = [];
    for (const row of rows) {
      names.push(await row.$(this.css.rowDisplayName).getText());
    }
    return names;
  }

  // Names (the line under the display name) of the rows, in display order.
  async getRowNames() {
    const rows = await this.getDisplayedElements(this.css.rows);
    const names = [];
    for (const row of rows) {
      names.push(await row.$(this.css.rowName).getText());
    }
    return names;
  }

  // The right-hand column of a row element (its ID provider, its application) - or undefined.
  async getRowMetaOf(row) {
    const cells = await row.$$(this.css.rowMeta);
    return cells.length === 0 ? undefined : await cells[0].getText();
  }

  // Rows by key: the row's id ends with '-item-<key>'.

  async getRowMeta(key) {
    await this.waitForRowDisplayed(key);
    return await this.getRowMetaOf(await this.findElement(this.css.rowByKey(key)));
  }

  async waitForRowDisplayed(key, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.rowByKey(key), ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the row '${key}' should be displayed`,
        'err_browse_row',
        err,
      );
    }
  }

  async waitForRowNotDisplayed(key, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.rowByKey(key), ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the row '${key}' should not be displayed`,
        'err_browse_row',
        err,
      );
    }
  }

  isRowDisplayed(key) {
    return this.isElementDisplayed(this.css.rowByKey(key));
  }

  // Clicks on the row: the item is selected and its details open on the right.
  async clickOnRowByKey(key) {
    try {
      await this.waitForRowDisplayed(key);
      await this.clickOnElement(this.css.rowByKey(key));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on the row '${key}'`,
        'err_browse_row',
        err,
      );
    }
  }

  // Ticks the row's checkbox: the item joins the selection, the toolbar follows.
  async clickOnCheckboxByKey(key) {
    try {
      await this.waitForElementDisplayed(this.css.rowCheckboxLabel(key));
      await this.clickOnElement(this.css.rowCheckboxLabel(key));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - checkbox of the row '${key}'`,
        'err_browse_checkbox',
        err,
      );
    }
  }

  async isRowChecked(key) {
    const checked = await this.getAttribute(this.css.rowCheckbox(key), 'aria-checked');
    return checked === 'true';
  }

  // A row the operator may not act on keeps its checkbox, greyed in place rather than left out: the
  // platform's own roles and the system users are the case.
  isRowCheckboxEnabled(key) {
    return this.isElementEnabled(this.css.rowCheckbox(key));
  }

  // The row painted as selected: ticked, or the row the user clicked on while nothing is ticked -
  // which is what BrowseListRow calls `highlighted` and renders as data-tone='inverse'.
  //
  // ! Not aria-selected: TreeList.Row sets that from the ticks alone, so a clicked but unticked row
  // ! reads false there. isRowChecked is the one that answers for the checkbox.
  async isRowHighlighted(key) {
    const tone = await this.getAttribute(this.css.rowByKey(key), 'data-tone');
    return tone === 'inverse';
  }

  async waitForRowHighlighted(key, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForAttributeValue(this.css.rowByKey(key), 'data-tone', 'inverse', ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the row '${key}' should be painted as selected`,
        'err_browse_row',
        err,
      );
    }
  }

  // Ticks the row and clicks on Delete; the confirmation dialog opens.
  async selectAndClickOnDelete(key) {
    await this.clickOnCheckboxByKey(key);
    await this.waitForDeleteButtonEnabled();
    return await this.clickOnDeleteButton();
  }

  // Rows by what they show. CSS cannot match text, so the rows are scanned: the text is compared
  // with the display name (the bold line) or the name (the small line under it).

  async findRowByText(selector, text) {
    const rows = await this.getDisplayedElements(this.css.rows);
    for (const row of rows) {
      if ((await row.$(selector).getText()) === text) {
        return row;
      }
    }
    return undefined;
  }

  findRowByDisplayName(displayName) {
    return this.findRowByText(this.css.rowDisplayName, displayName);
  }

  findRowByName(name) {
    return this.findRowByText(this.css.rowName, name);
  }

  // Waits until a row with the display name is listed and returns it.
  async waitForRowByDisplayNameDisplayed(displayName, ms = appConst.TIMEOUT.MEDIUM) {
    let row;
    try {
      await this.getBrowser().waitUntil(
        async () => {
          row = await this.findRowByDisplayName(displayName);
          return row !== undefined;
        },
        { timeout: ms, timeoutMsg: `no row with the display name '${displayName}'` },
      );
      return row;
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the row '${displayName}' should be displayed`,
        'err_browse_row',
        err,
      );
    }
  }

  // Waits until a row with the name (the line under the display name) is listed and returns it.
  async waitForRowByNameDisplayed(name, ms = appConst.TIMEOUT.MEDIUM) {
    let row;
    try {
      await this.getBrowser().waitUntil(
        async () => {
          row = await this.findRowByName(name);
          return row !== undefined;
        },
        { timeout: ms, timeoutMsg: `no row with the name '${name}'` },
      );
      return row;
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the row '${name}' should be displayed`,
        'err_browse_row',
        err,
      );
    }
  }

  async waitForRowByDisplayNameNotDisplayed(displayName, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.findRowByDisplayName(displayName)) === undefined,
        { timeout: ms, timeoutMsg: `the row '${displayName}' is still displayed` },
      );
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the row '${displayName}' should not be displayed`,
        'err_browse_row',
        err,
      );
    }
  }

  async isRowByDisplayNameDisplayed(displayName) {
    return (await this.findRowByDisplayName(displayName)) !== undefined;
  }

  // Clicks on the row: the item is selected and its details open on the right.
  async clickOnRowByDisplayName(displayName) {
    try {
      const row = await this.waitForRowByDisplayNameDisplayed(displayName);
      await row.click();
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on the row '${displayName}'`,
        'err_browse_row',
        err,
      );
    }
  }

  // Ticks the row's checkbox: the item joins the selection, the toolbar follows.
  async clickOnCheckboxByDisplayName(displayName) {
    try {
      const row = await this.waitForRowByDisplayNameDisplayed(displayName);
      await row.$(this.css.rowCheckboxLabelInRow).click();
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - checkbox of the row '${displayName}'`,
        'err_browse_checkbox',
        err,
      );
    }
  }

  // The name shown under the display name.
  async getRowNameByDisplayName(displayName) {
    const row = await this.waitForRowByDisplayNameDisplayed(displayName);
    return await row.$(this.css.rowName).getText();
  }

  // The right-hand column of the row - or undefined.
  async getRowMetaByDisplayName(displayName) {
    const row = await this.waitForRowByDisplayNameDisplayed(displayName);
    return await this.getRowMetaOf(row);
  }

  // The row's id, '...-item-<key>': what the rows are keyed by.
  async getRowIdByDisplayName(displayName) {
    const row = await this.waitForRowByDisplayNameDisplayed(displayName);
    return await row.getAttribute('id');
  }

  // Ticks the row with the display name and clicks on Delete; the confirmation dialog opens.
  async selectByDisplayNameAndClickOnDelete(displayName) {
    await this.clickOnCheckboxByDisplayName(displayName);
    await this.waitForDeleteButtonEnabled();
    return await this.clickOnDeleteButton();
  }

  // Context menu - the toolbar's actions over one row. The right click retargets the row before the
  // menu opens, so what it offers is what the toolbar would offer for that row.

  get contextMenu() {
    return this.css.contextMenu;
  }

  // Right-clicks the row with the display name and waits for its menu. A right click fires
  // 'contextmenu' alone, so the row is retargeted without being ticked.
  async openContextMenu(displayName) {
    try {
      const row = await this.waitForRowByDisplayNameDisplayed(displayName);
      await row.click({ button: 'right' });
      await this.waitForElementDisplayed(this.css.contextMenu);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the context menu of the row '${displayName}'`,
        'err_browse_context_menu',
        err,
      );
    }
  }

  isContextMenuDisplayed() {
    return this.isElementDisplayed(this.css.contextMenu);
  }

  async waitForContextMenuOpened(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.contextMenu, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the context menu should be opened`,
        'err_browse_context_menu',
        err,
      );
    }
  }

  async waitForContextMenuClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.contextMenu, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the context menu should be closed`,
        'err_browse_context_menu',
        err,
      );
    }
  }

  // The items of the open menu as [{ label, enabled }], in display order. A menu item is a div, not
  // a button, so a disabled one says so with aria-disabled and nothing else: isEnabled() answers
  // true for every one of them. Labels are trimmed, which is what every lookup here compares
  // against.
  async getContextMenuItems() {
    await this.waitForElementDisplayed(this.css.contextMenu);
    const items = await this.getDisplayedElements(this.css.contextMenuItems);
    const result = [];
    for (const item of items) {
      result.push({
        label: (await item.getText()).trim(),
        enabled: (await item.getAttribute('aria-disabled')) !== 'true',
      });
    }
    return result;
  }

  // Labels of the items in the open menu, in display order.
  async getContextMenuItemLabels() {
    return (await this.getContextMenuItems()).map(({ label }) => label);
  }

  async isContextMenuItemEnabled(label) {
    const item = (await this.getContextMenuItems()).find((entry) => entry.label === label);
    if (item === undefined) {
      throw new Error(`${this.pageName} - no item '${label}' in the context menu`);
    }
    return item.enabled;
  }

  // Clicks the item with the label in the open menu, which closes on pick.
  async clickOnContextMenuItem(label) {
    try {
      await this.waitForElementDisplayed(this.css.contextMenu);
      const items = await this.getDisplayedElements(this.css.contextMenuItems);
      for (const item of items) {
        if ((await item.getText()).trim() !== label) {
          continue;
        }
        // ! A menu item is a div, so a disabled one has no click to refuse: it swallows it, leaves
        // ! the menu open and lets this method answer as though the action had run. The state is
        // ! read here rather than left to the click, the way the toolbar's buttons go through
        // ! waitForElementEnabled.
        if ((await item.getAttribute('aria-disabled')) === 'true') {
          throw new Error(`item '${label}' is disabled`);
        }
        await item.click();
        // The menu closing is what says the click landed.
        await this.waitForContextMenuClosed();
        return await this.pause(300);
      }
      throw new Error(`item '${label}' was not found in the context menu`);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on the context menu item '${label}'`,
        'err_browse_context_menu_item',
        err,
      );
    }
  }

  // Closes the open menu without picking.
  async closeContextMenu() {
    await this.pressEscKey();
    return await this.waitForContextMenuClosed();
  }
}

module.exports = BrowsePage;
