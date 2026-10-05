/**
 * Created on 02.10.2026.
 *
 * Base class of the five browse screens (Users, Service Accounts, Groups, Roles, ID Providers):
 * the same toolbar (New, Delete), search field, list header (Select all, Sort by, Refresh) and
 * list of rows, differing only in the page's data-component, the section the shadow root belongs
 * to and what a row shows on its right. A section's page object passes those in and adds what is
 * its own (the Edit button and the filter of Users, the key format of its rows).
 *
 * Locators are CSS, resolved inside the section's shadow root (see SectionPage). A row's id ends
 * with '-item-<key>', the key being the item's own key (a principal key for users, groups and roles,
 * the provider key for ID providers); rows are also found by what they show, since CSS cannot match
 * text.
 */
const SectionPage = require('./section.page');
const appConst = require('../libs/app_const');

// The browse toolbar carries its own name in place of the library's 'Toolbar.Container'
// (app-users#2764); the buttons keep 'Toolbar.Item', which Slot puts on the button element itself.
function buildCss(pageComponent) {
  const PAGE = `[data-component='${pageComponent}']`;
  const TOOLBAR = `${PAGE} [data-component='BrowseToolbar'][aria-label='Actions']`;
  const HEADER = `${PAGE} [data-component='BrowseListHeader']`;
  const LIST = `${PAGE} [data-component='BrowseList']`;
  const ROW = `${LIST} [data-component='BrowseListRow']`;
  return {
    container: PAGE,
    toolbar: TOOLBAR,
    toolbarButtons: `${TOOLBAR} button[data-component='Toolbar.Item']`,
    toolbarButton: (label) =>
      `${TOOLBAR} button[data-component='Toolbar.Item'][aria-label='${label}']`,
    // Search (BrowseScreen)
    searchInput: `${PAGE} [data-component='BrowseSearch'] input[data-component='SearchField.Input']`,
    // List header (BrowseListHeader)
    listHeader: HEADER,
    selectAllCheckbox: `${HEADER} [data-component='Checkbox'] input`,
    selectAllCheckboxLabel: `${HEADER} [data-component='Checkbox'] label`,
    refreshButton: `${HEADER} button[aria-label='Refresh']`,
    // The sort trigger's title/aria-label follow the current order, so it is located by its component
    // name; the open menu is rendered in AppRoot.PortalLayer, still inside the section's shadow root.
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

  waitForDeleteButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonDisplayed(this.deleteButton, 'Delete', 'err_delete_btn', ms);
  }

  waitForDeleteButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonEnabled(this.deleteButton, 'Delete', 'err_delete_btn', ms);
  }

  waitForDeleteButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
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

  waitForRefreshButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonDisplayed(this.refreshButton, 'Refresh', 'err_refresh_btn', ms);
  }

  waitForRefreshButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonEnabled(this.refreshButton, 'Refresh', 'err_refresh_btn', ms);
  }

  waitForRefreshButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonDisabled(this.refreshButton, 'Refresh', 'err_refresh_btn', ms);
  }

  isRefreshButtonEnabled() {
    return this.isElementEnabled(this.refreshButton);
  }

  isRefreshButtonDisplayed() {
    return this.isElementDisplayed(this.refreshButton);
  }

  // Search

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

  isSearchInputDisplayed() {
    return this.isElementDisplayed(this.css.searchInput);
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

  // Returns the current sort order without opening the menu: the trigger's 'title' is the label of
  // the picked item (appConst.SORT_MENU_ITEM.*), or 'Sort by' while nothing matches an option.
  async getSelectedSortOrder() {
    await this.waitForElementDisplayed(this.sortButton);
    return await this.getAttribute(this.sortButton, 'title');
  }

  async waitForSelectedSortOrder(expectedItem) {
    try {
      await this.waitForAttributeValue(this.sortButton, 'title', expectedItem);
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

  // The row the user clicked on (aria-selected), not a ticked checkbox.
  async isRowSelected(key) {
    const selected = await this.getAttribute(this.css.rowByKey(key), 'aria-selected');
    return selected === 'true';
  }

  async waitForRowSelected(key, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForAttributeValue(this.css.rowByKey(key), 'aria-selected', 'true');
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the row '${key}' should be selected`,
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
}

module.exports = BrowsePage;
