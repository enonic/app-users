/**
 * Created on 01.10.2026.
 *
 * The ID Providers section: a browse screen with a toolbar (New, Delete), a search field, the list
 * header (Select all, Sort by, Refresh) and the list of providers, one row per provider with its
 * display name, its key and, on the right, the display name of its application. The browse screen
 * itself is BrowsePage (browse.page.js); this class binds it to the section. The rows are keyed by
 * the provider's key as is ('system'), so the row methods take that key.
 */
const BrowsePage = require('../browse.page');
const appConst = require('../../libs/app_const');

class IdProvidersPage extends BrowsePage {
  constructor() {
    super({
      sectionId: appConst.SECTION_ID.ID_PROVIDERS,
      pageComponent: 'IdProvidersPage',
      pageName: 'ID Providers page',
    });
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
