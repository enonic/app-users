/**
 * Created on 01.10.2026.
 *
 * The ID Providers section: a browse screen with a toolbar (New, Delete), a search field, the list
 * header (Select all, Sort by, Refresh) and the list of providers, one row per provider with its
 * display name, its key and, on the right, the display name of its application.
 */
const SectionPage = require('../section.page');
const appConst = require('../../libs/app_const');

// Locators are CSS, resolved inside the ID Providers section's shadow root (see SectionPage).
const PAGE = "[data-component='IdProvidersPage']";
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
  // List: the rows live in a TreeList (role 'tree'); a row's id ends with '-item-<key>'.
  list: `${LIST} [role='tree']`,
  listMessage: `${PAGE} [data-component='BrowseListMessage']`,
  rows: ROW,
  rowByName: (name) => `${ROW}[id$='-item-${name}']`,
  rowCheckbox: (name) => `${ROW}[id$='-item-${name}'] [data-component='Checkbox'] input`,
  rowCheckboxLabel: (name) => `${ROW}[id$='-item-${name}'] [data-component='Checkbox'] label`,
  rowDisplayName: "[data-component='ItemLabel'] span.font-semibold",
  rowName: "[data-component='ItemLabel'] small",
  rowApplication: "[data-component='TreeList.RowRight'] span",
};

class IdProvidersPage extends SectionPage {
  constructor() {
    super(appConst.SECTION_ID.ID_PROVIDERS);
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
      await this.handleError('ID Providers page was not loaded', 'err_id_providers_page', err);
    }
  }

  async waitForToolbarLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.toolbar, ms);
    } catch (err) {
      await this.handleError(
        'ID Providers page - toolbar was not loaded',
        'err_id_providers_toolbar',
        err,
      );
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
        'ID Providers page - error after clicking on New button',
        'err_new_btn',
        err,
      );
    }
  }

  async waitForNewButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.newButton, ms);
    } catch (err) {
      await this.handleError(
        'ID Providers page - New button should be displayed',
        'err_new_btn',
        err,
      );
    }
  }

  async waitForNewButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementEnabled(this.newButton, ms);
    } catch (err) {
      await this.handleError(
        'ID Providers page - New button should be enabled',
        'err_new_btn',
        err,
      );
    }
  }

  async waitForNewButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisabled(this.newButton, ms);
    } catch (err) {
      await this.handleError(
        'ID Providers page - New button should be disabled',
        'err_new_btn',
        err,
      );
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
        'ID Providers page - error after clicking on Delete button',
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
        'ID Providers page - Delete button should be displayed',
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
        'ID Providers page - Delete button should be enabled',
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
        'ID Providers page - Delete button should be disabled',
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
        'ID Providers page - error after clicking on Refresh button',
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
        'ID Providers page - Refresh button should be displayed',
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
        'ID Providers page - Refresh button should be enabled',
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
        'ID Providers page - Refresh button should be disabled',
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
        'ID Providers page - error after typing in the search input',
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
        'ID Providers page - error after clearing the search input',
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
        'ID Providers page - error after clicking on Sort by button',
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
        'ID Providers page - Sort by button should be displayed',
        'err_sort_btn',
        err,
      );
    }
  }

  async waitForSortButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementEnabled(this.sortButton, ms);
    } catch (err) {
      await this.handleError(
        'ID Providers page - Sort by button should be enabled',
        'err_sort_btn',
        err,
      );
    }
  }

  async waitForSortButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisabled(this.sortButton, ms);
    } catch (err) {
      await this.handleError(
        'ID Providers page - Sort by button should be disabled',
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
        `ID Providers page - expected sort order '${expectedItem}' is not selected`,
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
      await this.handleError(
        'ID Providers page - Sort menu should be opened',
        'err_sort_menu',
        err,
      );
    }
  }

  async waitForSortMenuClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(css.sortMenu, ms);
    } catch (err) {
      await this.handleError(
        'ID Providers page - Sort menu should be closed',
        'err_sort_menu',
        err,
      );
    }
  }

  isSortMenuDisplayed() {
    return this.isElementDisplayed(css.sortMenu);
  }

  // Returns the labels of the items in the open Sort menu, in display order. Providers offer the
  // two by display name only (appConst.SORT_MENU_ITEM.DISPLAY_NAME_ASC / DISPLAY_NAME_DESC).
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
    throw new Error('ID Providers page - no item is checked in the Sort menu');
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
        `ID Providers page - error after clicking on the Sort menu item '${itemName}'`,
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
      await this.handleError(
        'ID Providers page - Select all checkbox',
        'err_select_all_checkbox',
        err,
      );
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
      await this.handleError('ID Providers list was not loaded', 'err_id_providers_list', err);
    }
  }

  // 'No ID providers' - shown instead of the list while it is empty - or undefined.
  async getListMessage() {
    const messages = await this.getDisplayedElements(css.listMessage);
    return messages.length === 0 ? undefined : await messages[0].getText();
  }

  // Display names of the providers listed, in display order.
  async getProviderDisplayNames() {
    const rows = await this.getDisplayedElements(css.rows);
    const names = [];
    for (const row of rows) {
      names.push(await row.$(css.rowDisplayName).getText());
    }
    return names;
  }

  // Keys (the 'name' under the display name) of the providers listed, in display order.
  async getProviderNames() {
    const rows = await this.getDisplayedElements(css.rows);
    const names = [];
    for (const row of rows) {
      names.push(await row.$(css.rowName).getText());
    }
    return names;
  }

  // The application shown on the right of the row, e.g. 'Standard ID Provider' - or undefined.
  async getProviderApplication(name) {
    await this.waitForRowDisplayed(name);
    const row = await this.findElement(css.rowByName(name));
    const cells = await row.$$(css.rowApplication);
    return cells.length === 0 ? undefined : await cells[0].getText();
  }

  async waitForRowDisplayed(name, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(css.rowByName(name), ms);
    } catch (err) {
      await this.handleError(
        `ID Providers page - the row '${name}' should be displayed`,
        'err_id_provider_row',
        err,
      );
    }
  }

  async waitForRowNotDisplayed(name, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(css.rowByName(name), ms);
    } catch (err) {
      await this.handleError(
        `ID Providers page - the row '${name}' should not be displayed`,
        'err_id_provider_row',
        err,
      );
    }
  }

  isRowDisplayed(name) {
    return this.isElementDisplayed(css.rowByName(name));
  }

  // Clicks on the row: the provider is selected and its details open on the right.
  async clickOnRowByName(name) {
    try {
      await this.waitForRowDisplayed(name);
      await this.clickOnElement(css.rowByName(name));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `ID Providers page - error after clicking on the row '${name}'`,
        'err_id_provider_row',
        err,
      );
    }
  }

  // Ticks the row's checkbox: the provider joins the selection, the toolbar follows.
  async clickOnCheckboxByName(name) {
    try {
      await this.waitForElementDisplayed(css.rowCheckboxLabel(name));
      await this.clickOnElement(css.rowCheckboxLabel(name));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `ID Providers page - checkbox of the row '${name}'`,
        'err_id_provider_checkbox',
        err,
      );
    }
  }

  async isRowChecked(name) {
    const checked = await this.getAttribute(css.rowCheckbox(name), 'aria-checked');
    return checked === 'true';
  }

  // The row the user clicked on (aria-selected), not a ticked checkbox.
  async isRowSelected(name) {
    const selected = await this.getAttribute(css.rowByName(name), 'aria-selected');
    return selected === 'true';
  }

  async waitForRowSelected(name, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForAttributeValue(css.rowByName(name), 'aria-selected', 'true');
    } catch (err) {
      await this.handleError(
        `ID Providers page - the row '${name}' should be selected`,
        'err_id_provider_row',
        err,
      );
    }
  }

  // Flows

  // Ticks the provider and clicks on Delete; the confirmation dialog opens.
  async selectAndClickOnDelete(name) {
    await this.clickOnCheckboxByName(name);
    await this.waitForDeleteButtonEnabled();
    return await this.clickOnDeleteButton();
  }
}

module.exports = IdProvidersPage;
