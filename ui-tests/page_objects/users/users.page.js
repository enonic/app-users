/**
 * Created on 24.09.2026
 *
 * The Users section: a browse screen with a toolbar (New, Edit, Delete), a search field, the list
 * header (Select all, Sort by, Refresh) and the list of users, one row per user with its display
 * name, its name and, on the right, the display name of its ID provider. The browse screen itself is
 * BrowsePage (browse.page.js); this class adds the Edit button, the 'ID provider' field of the
 * filter and the key the rows are identified by.
 */
const BrowsePage = require('../browse.page');
const appConst = require('../../libs/app_const');

// A user's principal key, the way the rows are identified; `idProvider` defaults to 'system'.
const userKey = (name, idProvider = 'system') => `user:${idProvider}:${name}`;

// The one field the filter offers (pages/users/model/users.filter.ts): the ID providers by key, the
// system one left out, each counting the users the search would leave in it. Its label is the
// phrase users.filter.idProvider.
const FILTER_FIELD = Object.freeze({ ID_PROVIDER: 'idProvider' });
const ID_PROVIDER_FIELD_LABEL = 'ID provider';

class UsersPage extends BrowsePage {
  constructor() {
    super({
      sectionId: appConst.SECTION_ID.USERS,
      pageComponent: 'UsersPage',
      pageName: 'Users page',
    });
  }

  static userKey(name, idProvider) {
    return userKey(name, idProvider);
  }

  static get FILTER_FIELD() {
    return FILTER_FIELD;
  }

  // What the Remove button of a picked provider's tag names: 'ID provider: <display name>'. The tag
  // itself reads the display name alone.
  static idProviderTerm(displayName) {
    return `${ID_PROVIDER_FIELD_LABEL}: ${displayName}`;
  }

  get editButton() {
    return this.css.toolbarButton('Edit');
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

  // Filter: the 'ID provider' field

  // Enters the 'ID provider' field of the filter: its values are shown (getFilterValues).
  openIdProviderFilterValues() {
    return this.openFilterFieldValues(FILTER_FIELD.ID_PROVIDER);
  }

  // Narrows the list to the provider: the field is entered, the provider picked by its key, the
  // dropdown closed. `displayName` is the provider's, which the term's tag reads.
  async filterByIdProvider(key, displayName) {
    await this.openIdProviderFilterValues();
    await this.clickOnFilterValue(key, UsersPage.idProviderTerm(displayName));
    return await this.closeFilterDropdown();
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
