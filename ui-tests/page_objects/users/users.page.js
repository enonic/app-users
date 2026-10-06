/**
 * Created on 24.09.2026
 *
 * The Users section: a browse screen with a toolbar (New, Edit, Delete), a search field, the list
 * header (Select all, Sort by, Refresh) and the list of users, one row per user with its display
 * name, its name and, on the right, the display name of its ID provider. The browse screen itself is
 * BrowsePage (browse.page.js); this class adds the Edit button, the ID provider filter and the key
 * the rows are identified by.
 */
const BrowsePage = require('../browse.page');
const appConst = require('../../libs/app_const');

// A user's principal key, the way the rows are identified; `idProvider` defaults to 'system'.
const userKey = (name, idProvider = 'system') => `user:${idProvider}:${name}`;

class UsersPage extends BrowsePage {
  constructor() {
    super({
      sectionId: appConst.SECTION_ID.USERS,
      pageComponent: 'UsersPage',
      pageName: 'Users page',
    });
    // The filter trigger is not rendered yet: BrowseListHeader keeps its slot commented out until
    // the filter component lands (TODO there). Located like the sort trigger, by its component name.
    this.css.filterButton = `${this.css.container} button[data-component='BrowseFilter']`;
    this.css.filterMenu = "[data-component='BrowseFilter.Menu'][role='menu']";
  }

  static userKey(name, idProvider) {
    return userKey(name, idProvider);
  }

  get editButton() {
    return this.css.toolbarButton('Edit');
  }

  get filterListButton() {
    return this.css.filterButton;
  }

  // Edit

  clickOnEditButton() {
    return this.clickOnButton(this.editButton, 'Edit', 'err_edit_btn');
  }

  waitForEditButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonDisplayed(this.editButton, 'Edit', 'err_edit_btn', ms);
  }

  waitForEditButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonEnabled(this.editButton, 'Edit', 'err_edit_btn', ms);
  }

  waitForEditButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonDisabled(this.editButton, 'Edit', 'err_edit_btn', ms);
  }

  isEditButtonEnabled() {
    return this.isElementEnabled(this.editButton);
  }

  isEditButtonDisplayed() {
    return this.isElementDisplayed(this.editButton);
  }

  // Filter list (the button is absent from the current build, see the constructor)

  clickOnFilterListButton() {
    return this.clickOnButton(this.filterListButton, 'Filter list', 'err_filter_list_btn');
  }

  waitForFilterListButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonEnabled(
      this.filterListButton,
      'Filter list',
      'err_filter_list_btn',
      ms,
    );
  }

  waitForFilterListButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonDisabled(
      this.filterListButton,
      'Filter list',
      'err_filter_list_btn',
      ms,
    );
  }

  isFilterListButtonEnabled() {
    return this.isElementEnabled(this.filterListButton);
  }

  // List

  waitForUsersListLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForListLoaded(ms);
  }

  // Display names of the users listed, in display order.
  getUserDisplayNames() {
    return this.getRowDisplayNames();
  }

  // Names (the line under the display name) of the users listed, in display order.
  getUserNames() {
    return this.getRowNames();
  }

  // The ID provider shown on the right of the row, e.g. 'System Id Provider' - or undefined.
  getUserIdProvider(key) {
    return this.getRowMeta(key);
  }

  getUserNameByDisplayName(displayName) {
    return this.getRowNameByDisplayName(displayName);
  }

  getUserIdProviderByDisplayName(displayName) {
    return this.getRowMetaByDisplayName(displayName);
  }
}

module.exports = UsersPage;
