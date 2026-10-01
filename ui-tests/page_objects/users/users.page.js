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

class UsersPage extends SectionPage {
  constructor() {
    super(appConst.SECTION_ID.USERS);
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

  // ---------------------------------------------------------------------------------------------
  // TODO: methods below are carried over from app-users (lib-admin-ui) and are not adapted yet:
  // their locators and helpers (lib, xpath.rowByName, PrincipalFilterPanel, ...) do not exist here.
  // ---------------------------------------------------------------------------------------------
  async clickOnRowByName(name) {
    try {
      let nameXpath = xpath.rowByName(name);
      await this.waitForElementDisplayed(nameXpath, appConst.mediumTimeout);
      await this.clickOnElement(nameXpath);
      return await this.pause(500);
    } catch (err) {
      let screenshot = await this.saveScreenshotUniqueName('err_find_item');
      throw Error(`Item was not found. screenshot:${screenshot} ` + err);
    }
  }

  clickOnSearchButton() {
    return this.clickOnElement(this.searchButton);
  }

  async clickOnEditButton() {
    await this.waitForEditButtonEnabled();
    return await this.clickOnElement(this.editButton);
  }

  async waitForDeleteButtonDisabled() {
    try {
      return await this.waitForElementDisabled(this.deleteButton, appConst.mediumTimeout);
    } catch (err) {
      let screenshot = await this.saveScreenshotUniqueName('err_delete_btn');
      throw new Error(`Delete button should be disabled! screenshot: ${screenshot}` + err);
    }
  }

  isEditButtonEnabled() {
    return this.waitForElementEnabled(this.editButton, appConst.mediumTimeout);
  }

  waitForEditButtonDisabled() {
    return this.waitForElementDisabled(this.editButton, appConst.mediumTimeout);
  }

  async waitForRowByNameVisible(name) {
    try {
      let nameXpath = xpath.rowByName(name);
      await this.waitForElementDisplayed(nameXpath, appConst.mediumTimeout);
    } catch (err) {
      let screenshot = await this.saveScreenshotUniqueName('err_find_item');
      throw Error('Row was not found: screenshot' + screenshot + '  ' + err);
    }
  }

  hotKeyNew() {
    return this.browser.status().then((status) => {
      console.log('browser status:' + status);
      return this.browser.keys(['Alt', 'n']);
    });
  }

  hotKeyEdit() {
    return this.browser.keys(['Control', 'e']);
  }

  hotKeyDelete() {
    return this.browser.status().then((status) => {
      return this.browser.keys(['Control', 'Delete']);
    });
  }

  //Click on existing Tab-Item and navigates to the opened wizard:
  async clickOnTabBarItem(displayName) {
    let tabItem = xpath.itemTabByDisplayName(displayName);
    await this.waitForElementDisplayed(tabItem, appConst.mediumTimeout);
    return await this.clickOnElement(tabItem);
  }

  async rightClickOnRowByDisplayName(displayName) {
    try {
      const selector = xpath.rowByDisplayName(displayName);
      await this.waitForElementDisplayed(selector, appConst.mediumTimeout);
      return await this.doRightClick(selector);
    } catch (err) {
      let screenshot = await this.saveScreenshotUniqueName('err_right_click');
      throw Error(`Error occurred during right click on the row, screenshot: ${screenshot} ` + err);
    }
  }

  async clickOnSelectionControllerCheckbox() {
    try {
      await this.clickOnElement(this.selectionControllerCheckBox);
      return await this.pause(300);
    } catch (err) {
      await this.saveScreenshot('err_click_on_selection_controller');
      throw new Error('error when click on selection_controller ' + err);
    }
  }

  async isRowHighlighted(displayName) {
    let locator = lib.TREE_GRID.listItemByDisplayName(displayName);
    await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
    let attribute = await this.getAttribute(locator, 'class');
    return attribute.includes('selected') && !attribute.includes('checked');
  }

  async findAndSelectItem(name) {
    await this.typeNameInFilterPanel(name);
    await this.waitForRowByNameVisible(name);
    await this.clickOnRowByName(name);
    return await this.pause(500);
  }

  async typeNameInFilterPanel(name) {
    let filterPanel = new PrincipalFilterPanel();
    await this.clickOnSearchButton();
    await filterPanel.waitForOpened();
    await filterPanel.typeSearchText(name);
    await this.pause(300);
    await this.waitForSpinnerNotVisible();
  }

  async waitForRowByDisplayNameVisible(displayName) {
    try {
      let nameXpath = xpath.rowByDisplayName(displayName);
      await this.waitForElementDisplayed(nameXpath, appConst.mediumTimeout);
    } catch (err) {
      let screenshot = await this.saveScreenshotUniqueName('err_user_item');
      throw new Error(`Row with the name  is not visible in , Screenshot: ${screenshot} ` + err);
    }
  }
}

module.exports = UsersPage;
