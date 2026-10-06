/**
 * Created on 02.10.2026.
 *
 * The Service Accounts section: a browse screen with a toolbar (New, Delete), a search field, the
 * list header (Select all, Sort by, Refresh) and the list of service accounts, one row per account
 * with its display name and its name. Every account lives in the system ID provider, so the rows
 * carry no ID provider column. Everything is inherited from BrowsePage (browse.page.js); this class
 * binds it to the section and names the rows' key.
 */
const BrowsePage = require('../browse.page');
const appConst = require('../../libs/app_const');

// A service account's principal key, the way the rows are identified, e.g. 'user:system:api-user'.
const serviceAccountKey = (name) => `user:system:${name}`;

class ServiceAccountsPage extends BrowsePage {
  constructor() {
    super({
      sectionId: appConst.SECTION_ID.SERVICE_ACCOUNTS,
      pageComponent: 'ServiceAccountsPage',
      pageName: 'Service Accounts page',
    });
  }

  static serviceAccountKey(name) {
    return serviceAccountKey(name);
  }

  // Display names of the service accounts listed, in display order.
  getServiceAccountDisplayNames() {
    return this.getRowDisplayNames();
  }

  // Names (the line under the display name) of the service accounts listed, in display order.
  getServiceAccountNames() {
    return this.getRowNames();
  }

  getServiceAccountNameByDisplayName(displayName) {
    return this.getRowNameByDisplayName(displayName);
  }
}

module.exports = ServiceAccountsPage;
