/**
 * Created on 01.10.2026.
 *
 * The Groups section: a browse screen with a toolbar (New, Delete), a search field, the list header
 * (Select all, Sort by, Refresh) and the list of groups, one row per group with its display name, its
 * name and, on the right, the display name of its ID provider.
 */
const SectionPage = require('../section.page');
const appConst = require('../../libs/app_const');

// Locators are CSS, resolved inside the Groups section's shadow root (see SectionPage).
const PAGE = "[data-component='GroupsPage']";
const TOOLBAR = `${PAGE} [data-component='BrowseToolbar'][aria-label='Actions']`;
const LIST = `${PAGE} [data-component='BrowseList']`;
const ROW = `${LIST} [data-component='BrowseListRow']`;

const css = {
  container: PAGE,
  toolbar: TOOLBAR,
  toolbarButtons: `${TOOLBAR} button[data-component='Toolbar.Item']`,
  toolbarButton: (label) =>
    `${TOOLBAR} button[data-component='Toolbar.Item'][aria-label='${label}']`,
  // Search (BrowseScreen)
  searchInput: `${PAGE} [data-component='BrowseSearch'] input[data-component='SearchField.Input']`,
  // List header (BrowseListHeader)
  listHeader: `${PAGE} [data-component='BrowseListHeader']`,
  selectAllCheckbox: `${PAGE} [data-component='BrowseListHeader'] [data-component='Checkbox'] input`,
  selectAllCheckboxLabel: `${PAGE} [data-component='BrowseListHeader'] [data-component='Checkbox'] label`,
  refreshButton: `${PAGE} [data-component='BrowseListHeader'] button[aria-label='Refresh']`,
  // The sort trigger's title/aria-label follow the current order, so it is located by its component
  // name; the open menu is rendered in AppRoot.PortalLayer, still inside the section's shadow root.
  sortButton: `${PAGE} button[data-component='BrowseSort']`,
  sortMenu: "[data-component='BrowseSort.Menu'][role='menu']",
  sortMenuItems: "[data-component='BrowseSort.Menu'][role='menu'] [role='menuitemradio']",
  // List: the rows live in a TreeList (role 'tree'); a row's id ends with '-item-<key>', the key
  // being the group's principal key, e.g. 'group:system:editors'.
  list: `${LIST} [role='tree']`,
  listMessage: `${PAGE} [data-component='BrowseListMessage']`,
  rows: ROW,
  rowByKey: (key) => `${ROW}[id$='-item-${key}']`,
  rowCheckbox: (key) => `${ROW}[id$='-item-${key}'] [data-component='Checkbox'] input`,
  rowCheckboxLabel: (key) => `${ROW}[id$='-item-${key}'] [data-component='Checkbox'] label`,
  rowDisplayName: "[data-component='ItemLabel'] span.font-semibold",
  rowName: "[data-component='ItemLabel'] small",
  rowIdProvider: "[data-component='TreeList.RowRight'] span",
};

// A group's principal key, the way the rows are identified; `idProvider` defaults to 'system'.
const groupKey = (name, idProvider = 'system') => `group:${idProvider}:${name}`;

class GroupsPage extends SectionPage {
  constructor() {
    super(appConst.SECTION_ID.GROUPS);
  }

  static groupKey(name, idProvider) {
    return groupKey(name, idProvider);
  }

  static get css() {
    return css;
  }

  get container() {
    return css.container;
  }

  get toolbar() {
    return css.toolbar;
  }

  get newButton() {
    return css.toolbarButton('New');
  }

  get deleteButton() {
    return css.toolbarButton('Delete');
  }

  get searchInput() {
    return css.searchInput;
  }

  get selectAllCheckbox() {
    return css.selectAllCheckbox;
  }

  get refreshButton() {
    return css.refreshButton;
  }

  get sortButton() {
    return css.sortButton;
  }

  get sortMenu() {
    return css.sortMenu;
  }

  get list() {
    return css.list;
  }

  // Page

  async waitForLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.container, ms);
      await this.waitForElementDisplayed(css.toolbar, ms);
    } catch (err) {
      await this.handleError('Groups page was not loaded', 'err_groups_page', err);
    }
  }

  async waitForToolbarLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.toolbar, ms);
    } catch (err) {
      await this.handleError('Groups page - toolbar was not loaded', 'err_groups_toolbar', err);
    }
  }

  // Returns aria-labels of the buttons currently rendered in the toolbar, in display order.
  async getToolbarButtonLabels() {
    const buttons = await this.findElements(css.toolbarButtons);
    return await Promise.all(buttons.map((el) => el.getAttribute('aria-label')));
  }

  // Waits for the toolbar's 'role' attribute (accessibility check).
  async waitForBrowseToolbarRoleAttribute(expectedRole) {
    await this.waitForAttributeValue(css.toolbar, 'role', expectedRole);
  }

  // New

  async clickOnNewButton() {
    try {
      await this.waitForElementEnabled(this.newButton);
      await this.clickOnElement(this.newButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Groups page - error after clicking on New button',
        'err_new_btn',
        err,
      );
    }
  }

  async waitForNewButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.newButton, ms);
    } catch (err) {
      await this.handleError('Groups page - New button should be displayed', 'err_new_btn', err);
    }
  }

  async waitForNewButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementEnabled(this.newButton, ms);
    } catch (err) {
      await this.handleError('Groups page - New button should be enabled', 'err_new_btn', err);
    }
  }

  async waitForNewButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisabled(this.newButton, ms);
    } catch (err) {
      await this.handleError('Groups page - New button should be disabled', 'err_new_btn', err);
    }
  }

  isNewButtonEnabled() {
    return this.isElementEnabled(this.newButton);
  }

  isNewButtonDisplayed() {
    return this.isElementDisplayed(this.newButton);
  }

  // Delete

  async clickOnDeleteButton() {
    try {
      await this.waitForElementEnabled(this.deleteButton);
      await this.clickOnElement(this.deleteButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Groups page - error after clicking on Delete button',
        'err_delete_btn',
        err,
      );
    }
  }

  async waitForDeleteButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.deleteButton, ms);
    } catch (err) {
      await this.handleError(
        'Groups page - Delete button should be displayed',
        'err_delete_btn',
        err,
      );
    }
  }

  async waitForDeleteButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementEnabled(this.deleteButton, ms);
    } catch (err) {
      await this.handleError(
        'Groups page - Delete button should be enabled',
        'err_delete_btn',
        err,
      );
    }
  }

  async waitForDeleteButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisabled(this.deleteButton, ms);
    } catch (err) {
      await this.handleError(
        'Groups page - Delete button should be disabled',
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

  // Refresh

  async clickOnRefreshButton() {
    try {
      await this.waitForElementEnabled(this.refreshButton);
      await this.clickOnElement(this.refreshButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Groups page - error after clicking on Refresh button',
        'err_refresh_btn',
        err,
      );
    }
  }

  async waitForRefreshButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.refreshButton, ms);
    } catch (err) {
      await this.handleError(
        'Groups page - Refresh button should be displayed',
        'err_refresh_btn',
        err,
      );
    }
  }

  async waitForRefreshButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementEnabled(this.refreshButton, ms);
    } catch (err) {
      await this.handleError(
        'Groups page - Refresh button should be enabled',
        'err_refresh_btn',
        err,
      );
    }
  }

  async waitForRefreshButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisabled(this.refreshButton, ms);
    } catch (err) {
      await this.handleError(
        'Groups page - Refresh button should be disabled',
        'err_refresh_btn',
        err,
      );
    }
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
      await this.waitForElementDisplayed(css.searchInput);
      await this.typeTextInInput(css.searchInput, text);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        'Groups page - error after typing in the search input',
        'err_search_input',
        err,
      );
    }
  }

  async clearSearchInput() {
    try {
      await this.clearInputText(css.searchInput);
    } catch (err) {
      await this.handleError(
        'Groups page - error after clearing the search input',
        'err_search_input',
        err,
      );
    }
  }

  getTextInSearchInput() {
    return this.getTextInInput(css.searchInput);
  }

  isSearchInputDisplayed() {
    return this.isElementDisplayed(css.searchInput);
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
        'Groups page - error after clicking on Sort by button',
        'err_sort_btn',
        err,
      );
    }
  }

  async waitForSortButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.sortButton, ms);
    } catch (err) {
      await this.handleError(
        'Groups page - Sort by button should be displayed',
        'err_sort_btn',
        err,
      );
    }
  }

  async waitForSortButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementEnabled(this.sortButton, ms);
    } catch (err) {
      await this.handleError('Groups page - Sort by button should be enabled', 'err_sort_btn', err);
    }
  }

  async waitForSortButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisabled(this.sortButton, ms);
    } catch (err) {
      await this.handleError(
        'Groups page - Sort by button should be disabled',
        'err_sort_btn',
        err,
      );
    }
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
        `Groups page - expected sort order '${expectedItem}' is not selected`,
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
      await this.waitForElementDisplayed(css.sortMenu, ms);
    } catch (err) {
      await this.handleError('Groups page - Sort menu should be opened', 'err_sort_menu', err);
    }
  }

  async waitForSortMenuClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(css.sortMenu, ms);
    } catch (err) {
      await this.handleError('Groups page - Sort menu should be closed', 'err_sort_menu', err);
    }
  }

  isSortMenuDisplayed() {
    return this.isElementDisplayed(css.sortMenu);
  }

  // Returns the labels of the items in the open Sort menu, in display order: the four of
  // appConst.SORT_MENU_ITEM (by display name and by ID provider, each way).
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
    throw new Error('Groups page - no item is checked in the Sort menu');
  }

  // Clicks the item with the given label (appConst.SORT_MENU_ITEM.*) in the open Sort menu.
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
        `Groups page - error after clicking on the Sort menu item '${itemName}'`,
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
      await this.waitForElementDisplayed(css.selectAllCheckboxLabel);
      await this.clickOnElement(css.selectAllCheckboxLabel);
      return await this.pause(300);
    } catch (err) {
      await this.handleError('Groups page - Select all checkbox', 'err_select_all_checkbox', err);
    }
  }

  async isSelectAllCheckboxSelected() {
    const checked = await this.getAttribute(css.selectAllCheckbox, 'aria-checked');
    return checked === 'true';
  }

  isSelectAllCheckboxDisplayed() {
    return this.isElementDisplayed(css.selectAllCheckboxLabel);
  }

  // List

  async waitForListLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.list, ms);
    } catch (err) {
      await this.handleError('Groups list was not loaded', 'err_groups_list', err);
    }
  }

  // 'No groups' - shown instead of the list while it is empty - or undefined.
  async getListMessage() {
    const messages = await this.getDisplayedElements(css.listMessage);
    return messages.length === 0 ? undefined : await messages[0].getText();
  }

  // Display names of the groups listed, in display order.
  async getGroupDisplayNames() {
    const rows = await this.getDisplayedElements(css.rows);
    const names = [];
    for (const row of rows) {
      names.push(await row.$(css.rowDisplayName).getText());
    }
    return names;
  }

  // Names (the line under the display name) of the groups listed, in display order.
  async getGroupNames() {
    const rows = await this.getDisplayedElements(css.rows);
    const names = [];
    for (const row of rows) {
      names.push(await row.$(css.rowName).getText());
    }
    return names;
  }

  // The ID provider shown on the right of the row, e.g. 'System Id Provider' - or undefined.
  async getGroupIdProvider(key) {
    await this.waitForRowDisplayed(key);
    const row = await this.findElement(css.rowByKey(key));
    const cells = await row.$$(css.rowIdProvider);
    return cells.length === 0 ? undefined : await cells[0].getText();
  }

  async waitForRowDisplayed(key, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.rowByKey(key), ms);
    } catch (err) {
      await this.handleError(
        `Groups page - the row '${key}' should be displayed`,
        'err_group_row',
        err,
      );
    }
  }

  async waitForRowNotDisplayed(key, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(css.rowByKey(key), ms);
    } catch (err) {
      await this.handleError(
        `Groups page - the row '${key}' should not be displayed`,
        'err_group_row',
        err,
      );
    }
  }

  isRowDisplayed(key) {
    return this.isElementDisplayed(css.rowByKey(key));
  }

  // Clicks on the row (by the group's principal key): the group is selected and its details open.
  async clickOnRowByKey(key) {
    try {
      await this.waitForRowDisplayed(key);
      await this.clickOnElement(css.rowByKey(key));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `Groups page - error after clicking on the row '${key}'`,
        'err_group_row',
        err,
      );
    }
  }

  // Ticks the row's checkbox (by the group's principal key): the group joins the selection.
  async clickOnCheckboxByKey(key) {
    try {
      await this.waitForElementDisplayed(css.rowCheckboxLabel(key));
      await this.clickOnElement(css.rowCheckboxLabel(key));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `Groups page - checkbox of the row '${key}'`,
        'err_group_checkbox',
        err,
      );
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
        `Groups page - the row '${key}' should be selected`,
        'err_group_row',
        err,
      );
    }
  }

  // Flows

  // Ticks the group and clicks on Delete; the confirmation dialog opens.
  async selectAndClickOnDelete(key) {
    await this.clickOnCheckboxByKey(key);
    await this.waitForDeleteButtonEnabled();
    return await this.clickOnDeleteButton();
  }
}

module.exports = GroupsPage;
