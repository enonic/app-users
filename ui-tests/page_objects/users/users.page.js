/**
 * Created on 24.09.2026
 */
const SectionPage = require('../section.page');
const appConst = require('../../libs/app_const');
// Locators are CSS, resolved inside the Users section's shadow root (see SectionPage).
// The browse toolbar carries its own name in place of the library's 'Toolbar.Container'
// (app-users#2764); the buttons keep 'Toolbar.Item', which Slot puts on the button element itself.
const TOOLBAR = "[data-component='BrowseToolbar'][aria-label='Actions']";

const css = {
  container: "[data-component='UsersPage']",
  toolbar: TOOLBAR,
  toolbarButtons: `${TOOLBAR} button[data-component='Toolbar.Item']`,
  toolbarButton: (label) =>
    `${TOOLBAR} button[data-component='Toolbar.Item'][aria-label='${label}']`,
  // The rows live in a TreeList: role 'tree', not 'listbox'.
  list: "[data-component='UsersPage'] [data-component='BrowseList'] [role='tree']",
  listRows: "[data-component='UsersPage'] [data-component='BrowseListRow']",
  // A row's id ends with '-item-<key>', the key being the user's principal key ('user:system:bob').
  rowByKey: (key) =>
    `[data-component='UsersPage'] [data-component='BrowseListRow'][id$='-item-${key}']`,
  rowCheckboxLabel: (key) =>
    `[data-component='UsersPage'] [data-component='BrowseListRow'][id$='-item-${key}'] [data-component='Checkbox'] label`,
  rowCheckbox: (key) =>
    `[data-component='UsersPage'] [data-component='BrowseListRow'][id$='-item-${key}'] [data-component='Checkbox'] input`,
  rowDisplayName: "[data-component='ItemLabel'] span.font-semibold",
  rowName: "[data-component='ItemLabel'] small",
  rowIdProvider: "[data-component='TreeList.RowRight'] span",
  listMessage: "[data-component='UsersPage'] [data-component='BrowseListMessage']",
  // The search field (BrowseScreen) and the list header controls (BrowseListHeader).
  searchInput:
    "[data-component='UsersPage'] [data-component='BrowseSearch'] " +
    "input[data-component='SearchField.Input']",
  listHeader: "[data-component='UsersPage'] [data-component='BrowseListHeader']",
  listHeaderButton: (label) =>
    `[data-component='UsersPage'] [data-component='BrowseListHeader'] ` +
    `button[aria-label='${label}']`,
  // The filter trigger is not rendered yet: BrowseListHeader keeps its slot commented out until
  // the filter component lands (TODO there). Located like the sort trigger, by its component name.
  filterButton: "[data-component='UsersPage'] button[data-component='BrowseFilter']",
  filterMenu: "[data-component='BrowseFilter.Menu'][role='menu']",
  // The trigger's title/aria-label follow the current order, so it is located by its component
  // name; the open menu is rendered in AppRoot.PortalLayer, still inside the section's shadow root.
  sortButton: "[data-component='UsersPage'] button[data-component='BrowseSort']",
  sortMenu: "[data-component='BrowseSort.Menu'][role='menu']",
  sortMenuItems: "[data-component='BrowseSort.Menu'][role='menu'] [role='menuitemradio']",
};

// A user's principal key, the way the rows are identified; `idProvider` defaults to 'system'.
const userKey = (name, idProvider = 'system') => `user:${idProvider}:${name}`;

class UsersPage extends SectionPage {
  constructor() {
    super(appConst.SECTION_ID.USERS);
  }

  static get css() {
    return css;
  }

  static userKey(name, idProvider) {
    return userKey(name, idProvider);
  }

  get newButton() {
    return css.toolbarButton('New');
  }

  get editButton() {
    return css.toolbarButton('Edit');
  }

  get deleteButton() {
    return css.toolbarButton('Delete');
  }

  get searchInput() {
    return css.searchInput;
  }

  get refreshButton() {
    return css.listHeaderButton('Refresh');
  }

  get filterListButton() {
    return css.filterButton;
  }

  get sortButton() {
    return css.sortButton;
  }

  // Search
  async typeTextInSearchInput(text) {
    try {
      await this.waitForElementDisplayed(this.searchInput);
      await this.typeTextInInput(this.searchInput, text);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Users page - error after typing in the search input',
        'err_search_input',
        err,
      );
    }
  }

  async clearSearchInput() {
    try {
      await this.clearInputText(this.searchInput);
    } catch (err) {
      await this.handleError(
        'Users page - error after clearing the search input',
        'err_search_input',
        err,
      );
    }
  }

  getTextInSearchInput() {
    return this.getTextInInput(this.searchInput);
  }

  // Refresh
  async clickOnRefreshButton() {
    try {
      await this.waitForElementEnabled(this.refreshButton);
      await this.clickOnElement(this.refreshButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Users page - error after clicking on Refresh button',
        'err_refresh_btn',
        err,
      );
    }
  }

  // Filter list (the button is absent from the current build, see css.filterButton)
  async clickOnFilterListButton() {
    try {
      await this.waitForElementEnabled(this.filterListButton);
      await this.clickOnElement(this.filterListButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Users page - error after clicking on Filter list button',
        'err_filter_list_btn',
        err,
      );
    }
  }

  async waitForFilterListButtonEnabled() {
    try {
      await this.waitForElementEnabled(this.filterListButton);
    } catch (err) {
      await this.handleError(
        'Users page - Filter list button should be enabled',
        'err_filter_list_btn',
        err,
      );
    }
  }

  async waitForFilterListButtonDisabled() {
    try {
      await this.waitForElementDisabled(this.filterListButton);
    } catch (err) {
      await this.handleError(
        'Users page - Filter list button should be disabled',
        'err_filter_list_btn',
        err,
      );
    }
  }

  isFilterListButtonEnabled() {
    return this.isElementEnabled(this.filterListButton);
  }

  // Sort by
  async clickOnSortButton() {
    try {
      await this.waitForElementEnabled(this.sortButton);
      await this.clickOnElement(this.sortButton);
      await this.waitForElementDisplayed(css.sortMenu);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Users page - error after clicking on Sort by button',
        'err_sort_btn',
        err,
      );
    }
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
        `Users page - expected sort order '${expectedItem}' is not selected`,
        'err_sort_order',
        err,
      );
    }
  }

  async waitForSortMenuClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(css.sortMenu, ms);
    } catch (err) {
      await this.handleError('Users page - Sort menu should be closed', 'err_sort_menu', err);
    }
  }

  // Returns the labels of the items in the open Sort menu, in display order.
  async getSortMenuItems() {
    await this.waitForElementDisplayed(css.sortMenu);
    return await this.getTextInElements(css.sortMenuItems);
  }

  // Returns the label of the checked item in the open Sort menu.
  async getSelectedSortMenuItem() {
    await this.waitForElementDisplayed(css.sortMenu);
    const items = await this.findElements(css.sortMenuItems);
    for (const item of items) {
      if ((await item.getAttribute('aria-checked')) === 'true') {
        return await item.getText();
      }
    }
    throw new Error('Users page - no item is checked in the Sort menu');
  }

  // Clicks the item with the given label (e.g. 'Display name (A–Z)') in the open Sort menu.
  // The menu closes on pick.
  async clickOnSortMenuItem(itemName) {
    try {
      await this.waitForElementDisplayed(css.sortMenu);
      const items = await this.findElements(css.sortMenuItems);
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
        `Users page - error after clicking on the Sort menu item '${itemName}'`,
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

  async waitForLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.container, ms);
      await this.waitForElementDisplayed(css.toolbar, ms);
    } catch (err) {
      await this.handleError('Users page was not loaded', 'err_users_page', err);
    }
  }

  async waitForToolbarLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.toolbar, ms);
    } catch (err) {
      await this.handleError('Users page - toolbar was not loaded', 'err_users_toolbar', err);
    }
  }

  // Returns aria-labels of the buttons currently rendered in the toolbar, in display order.
  async getToolbarButtonLabels() {
    const buttons = await this.findElements(css.toolbarButtons);
    return await Promise.all(buttons.map((el) => el.getAttribute('aria-label')));
  }

  // New
  async clickOnNewButton() {
    try {
      await this.waitForElementEnabled(this.newButton);
      await this.clickOnElement(this.newButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('Users page - error after clicking on New button', 'err_new_btn', err);
    }
  }

  async waitForNewButtonEnabled() {
    try {
      await this.waitForElementEnabled(this.newButton);
    } catch (err) {
      await this.handleError('Users page - New button should be enabled', 'err_new_btn', err);
    }
  }

  async waitForNewButtonDisabled() {
    try {
      await this.waitForElementDisabled(this.newButton);
    } catch (err) {
      await this.handleError('Users page - New button should be disabled', 'err_new_btn', err);
    }
  }

  isNewButtonEnabled() {
    return this.isElementEnabled(this.newButton);
  }

  isNewButtonDisplayed() {
    return this.isElementDisplayed(this.newButton);
  }

  // Edit
  async clickOnEditButton() {
    try {
      await this.waitForElementEnabled(this.editButton);
      await this.clickOnElement(this.editButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Users page - error after clicking on Edit button',
        'err_edit_btn',
        err,
      );
    }
  }

  async waitForEditButtonEnabled() {
    try {
      await this.waitForElementEnabled(this.editButton);
    } catch (err) {
      await this.handleError('Users page - Edit button should be enabled', 'err_edit_btn', err);
    }
  }

  async waitForEditButtonDisabled() {
    try {
      await this.waitForElementDisabled(this.editButton);
    } catch (err) {
      await this.handleError('Users page - Edit button should be disabled', 'err_edit_btn', err);
    }
  }

  isEditButtonEnabled() {
    return this.isElementEnabled(this.editButton);
  }

  isEditButtonDisplayed() {
    return this.isElementDisplayed(this.editButton);
  }

  // Delete
  async clickOnDeleteButton() {
    try {
      await this.waitForElementEnabled(this.deleteButton);
      await this.clickOnElement(this.deleteButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Users page - error after clicking on Delete button',
        'err_delete_btn',
        err,
      );
    }
  }

  async waitForDeleteButtonEnabled() {
    try {
      await this.waitForElementEnabled(this.deleteButton);
    } catch (err) {
      await this.handleError('Users page - Delete button should be enabled', 'err_delete_btn', err);
    }
  }

  async waitForDeleteButtonDisabled() {
    try {
      await this.waitForElementDisabled(this.deleteButton);
    } catch (err) {
      await this.handleError(
        'Users page - Delete button should be disabled',
        'err_delete_btn',
        err,
      );
    }
  }

  isDeleteButtonEnabled() {
    return this.isElementEnabled(this.deleteButton);
  }

  isDeleteButtonDisplayed() {
    return this.isElementDisplayed(this.deleteButton);
  }

  // Waits for the toolbar's 'role' attribute (accessibility check).
  async waitForBrowseToolbarRoleAttribute(expectedRole) {
    await this.waitForAttributeValue(css.toolbar, 'role', expectedRole);
  }

  async waitForUsersListLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.list, ms);
    } catch (err) {
      await this.handleError('Users list was not loaded', 'err_users_list', err);
    }
  }

  // 'No users' - shown instead of the list while it is empty - or undefined.
  async getListMessage() {
    const messages = await this.getDisplayedElements(css.listMessage);
    return messages.length === 0 ? undefined : await messages[0].getText();
  }

  // Display names of the users listed, in display order.
  async getUserDisplayNames() {
    const rows = await this.getDisplayedElements(css.listRows);
    const names = [];
    for (const row of rows) {
      names.push(await row.$(css.rowDisplayName).getText());
    }
    return names;
  }

  // Names (the line under the display name) of the users listed, in display order.
  async getUserNames() {
    const rows = await this.getDisplayedElements(css.listRows);
    const names = [];
    for (const row of rows) {
      names.push(await row.$(css.rowName).getText());
    }
    return names;
  }

  // The ID provider shown on the right of the row, e.g. 'System Id Provider' - or undefined.
  async getUserIdProvider(key) {
    await this.waitForRowDisplayed(key);
    const row = await this.findElement(css.rowByKey(key));
    return await this.getRowIdProvider(row);
  }

  async getRowIdProvider(row) {
    const cells = await row.$(css.rowIdProvider);
    return cells.length === 0 ? undefined : await cells[0].getText();
  }

  // Rows by what they show. CSS cannot match text, so the rows are scanned: `text` is compared with
  // the display name (the bold line) or the name (the small line under it).

  async findRowByText(selector, text) {
    const rows = await this.getDisplayedElements(css.listRows);
    for (const row of rows) {
      if ((await row.$(selector).getText()) === text) {
        return row;
      }
    }
    return undefined;
  }

  findRowByDisplayName(displayName) {
    return this.findRowByText(css.rowDisplayName, displayName);
  }

  findRowByName(name) {
    return this.findRowByText(css.rowName, name);
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
        `Users page - the row '${displayName}' should be displayed`,
        'err_find_user',
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
        `Users page - the row '${name}' should be displayed`,
        'err_find_user',
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
        `Users page - the row '${displayName}' should not be displayed`,
        'err_find_user',
        err,
      );
    }
  }

  async isRowByDisplayNameDisplayed(displayName) {
    return (await this.findRowByDisplayName(displayName)) !== undefined;
  }

  // Clicks on the row: the user is selected and its details open on the right.
  async clickOnRowByDisplayName(displayName) {
    try {
      const row = await this.waitForRowByDisplayNameDisplayed(displayName);
      await row.click();
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `Users page - error after clicking on the row '${displayName}'`,
        'err_user_row',
        err,
      );
    }
  }

  // Ticks the row's checkbox: the user joins the selection, the toolbar follows.
  async clickOnCheckboxByDisplayName(displayName) {
    try {
      const row = await this.waitForRowByDisplayNameDisplayed(displayName);
      await row.$("[data-component='Checkbox'] label").click();
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `Users page - checkbox of the row '${displayName}'`,
        'err_user_checkbox',
        err,
      );
    }
  }

  // The name shown under the display name, e.g. 'user654480'.
  async getUserNameByDisplayName(displayName) {
    const row = await this.waitForRowByDisplayNameDisplayed(displayName);
    return await row.$(css.rowName).getText();
  }

  // The ID provider shown on the right of the row - or undefined.
  async getUserIdProviderByDisplayName(displayName) {
    const row = await this.waitForRowByDisplayNameDisplayed(displayName);
    return await this.getRowIdProvider(row);
  }

  // The row's id, '...-item-<key>': what the rows are keyed by, for UsersPage.userKey to be checked
  // against a real one.
  async getRowIdByDisplayName(displayName) {
    const row = await this.waitForRowByDisplayNameDisplayed(displayName);
    return await row.getAttribute('id');
  }

  // Rows are addressed by the user's principal key: UsersPage.userKey(name[, idProvider]).
  async waitForRowDisplayed(key, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.rowByKey(key), ms);
    } catch (err) {
      await this.handleError(
        `Users page - the row '${key}' should be displayed`,
        'err_user_row',
        err,
      );
    }
  }

  async waitForRowNotDisplayed(key, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(css.rowByKey(key), ms);
    } catch (err) {
      await this.handleError(
        `Users page - the row '${key}' should not be displayed`,
        'err_user_row',
        err,
      );
    }
  }

  isRowDisplayed(key) {
    return this.isElementDisplayed(css.rowByKey(key));
  }

  // Clicks on the row: the user is selected and its details open on the right.
  async clickOnRowByKey(key) {
    try {
      await this.waitForRowDisplayed(key);
      await this.clickOnElement(css.rowByKey(key));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `Users page - error after clicking on the row '${key}'`,
        'err_user_row',
        err,
      );
    }
  }

  // Ticks the row's checkbox: the user joins the selection, the toolbar follows.
  async clickOnCheckboxByKey(key) {
    try {
      await this.waitForElementDisplayed(css.rowCheckboxLabel(key));
      await this.clickOnElement(css.rowCheckboxLabel(key));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(`Users page - checkbox of the row '${key}'`, 'err_user_checkbox', err);
    }
  }

  async isRowChecked(key) {
    const checked = await this.getAttribute(css.rowCheckbox(key), 'aria-checked');
    return checked === 'true';
  }

  // The row the user clicked on (aria-selected), not a ticked checkbox.
  async isRowSelected(key) {
    const selected = await this.getAttribute(css.rowByKey(key), 'aria-selected');
    return selected === 'true';
  }

  async waitForRowSelected(key, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForAttributeValue(css.rowByKey(key), 'aria-selected', 'true');
    } catch (err) {
      await this.handleError(
        `Users page - the row '${key}' should be selected`,
        'err_user_row',
        err,
      );
    }
  }

  // Ticks the user and clicks on Delete; the confirmation dialog opens.
  async selectAndClickOnDelete(key) {
    await this.clickOnCheckboxByKey(key);
    await this.waitForDeleteButtonEnabled();
    return await this.clickOnDeleteButton();
  }
}

module.exports = UsersPage;
