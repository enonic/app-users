/**
 * Created on 01.10.2026.
 *
 * The Roles section: a browse screen with a toolbar (New, Delete), a search field, the list header
 * (Select all, Sort by, Refresh) and the list of roles, one row per role with its display name and
 * its name. A role lives in the system store, so the rows carry no ID provider column. The browse
 * screen itself is BrowsePage (browse.page.js); this class binds it to the section and names the
 * rows' key.
 */
const BrowsePage = require('../browse.page');
const appConst = require('../../libs/app_const');

// A role's principal key, the way the rows are identified, e.g. roleKey('system.admin').
const roleKey = (name) => `role:${name}`;

class RolesPage extends BrowsePage {
  constructor() {
    super({
      sectionId: appConst.SECTION_ID.ROLES,
      pageComponent: 'RolesPage',
      pageName: 'Roles page',
    });
  }

  static roleKey(name) {
    return roleKey(name);
  }

  // Display names of the roles listed, in display order.
  getRoleDisplayNames() {
    return this.getRowDisplayNames();
  }

  // Names (the line under the display name) of the roles listed, in display order.
  getRoleNames() {
    return this.getRowNames();
  }

  getRoleNameByDisplayName(displayName) {
    return this.getRowNameByDisplayName(displayName);
  }
}

module.exports = RolesPage;
