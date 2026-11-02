/**
 * Created on 01.10.2026.
 *
 * The ID Providers section: a browse screen with a toolbar (New, Delete), a search field, the list
 * header (Select all, Sort by, Refresh) and the list of providers, one row per provider with its
 * display name, its key and, on the right, the display name of its application. The browse screen
 * itself is BrowsePage (browse.page.js); this class binds it to the section and adds the
 * 'Application' field of the filter. The rows are keyed by the provider's key as is ('system'), so
 * the row methods take that key.
 */
const BrowsePage = require('../browse.page');
const appConst = require('../../libs/app_const');

// The one field the filter offers (pages/id-providers/model/id-providers.filter.ts): the
// applications the providers are bound to, by key, labelled by display name, and last the one
// entry for the providers bound to none ('Bound to no application') - each counting the providers
// the search would leave in it. Its label is the phrase idProviders.filter.application.
const FILTER_FIELD = Object.freeze({ APPLICATION: 'application' });
const APPLICATION_FIELD_LABEL = 'Application';
const UNBOUND_VALUE = 'unbound';
const UNBOUND_LABEL = 'Bound to no application';

class IdProvidersPage extends BrowsePage {
  constructor() {
    super({
      sectionId: appConst.SECTION_ID.ID_PROVIDERS,
      pageComponent: 'IdProvidersPage',
      pageName: 'ID Providers page',
    });
  }

  static get FILTER_FIELD() {
    return FILTER_FIELD;
  }

  // The id and the label of the value for the providers bound to no application.
  static get UNBOUND_VALUE() {
    return UNBOUND_VALUE;
  }

  static get UNBOUND_LABEL() {
    return UNBOUND_LABEL;
  }

  // What the Remove button of a picked application's tag names: 'Application: <display name>'.
  // The tag itself reads the display name alone.
  static applicationTerm(displayName) {
    return `${APPLICATION_FIELD_LABEL}: ${displayName}`;
  }

  // Filter: the 'Application' field

  // Whether the dropdown, open on its first stage, offers 'Application'.
  isApplicationFilterFieldOffered() {
    return this.isFilterFieldOffered(FILTER_FIELD.APPLICATION);
  }

  // Enters the 'Application' field of the filter: its values are shown (getFilterValues).
  openApplicationFilterValues() {
    return this.openFilterFieldValues(FILTER_FIELD.APPLICATION);
  }

  // Narrows the list to the providers of the application: the field is entered, the application
  // picked by its key, the dropdown closed. `displayName` is the application's, which the term's
  // tag reads.
  async filterByApplication(key, displayName) {
    await this.openApplicationFilterValues();
    await this.clickOnFilterValue(key, IdProvidersPage.applicationTerm(displayName));
    return await this.closeFilterDropdown();
  }

  // Display names of the providers listed, in display order.
  getProviderDisplayNames() {
    return this.getRowDisplayNames();
  }

  // Keys (the line under the display name) of the providers listed, in display order.
  getProviderNames() {
    return this.getRowNames();
  }

  // The application shown on the right of the row, e.g. 'Standard ID Provider' - or undefined.
  getProviderApplication(key) {
    return this.getRowMeta(key);
  }

  getProviderApplicationByDisplayName(displayName) {
    return this.getRowMetaByDisplayName(displayName);
  }

  // The key-based row methods under the names the first version of this class gave them.
  clickOnRowByName(key) {
    return this.clickOnRowByKey(key);
  }

  clickOnCheckboxByName(key) {
    return this.clickOnCheckboxByKey(key);
  }
}

module.exports = IdProvidersPage;
