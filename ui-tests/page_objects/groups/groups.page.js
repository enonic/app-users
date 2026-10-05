/**
 * Created on 01.10.2026.
 *
 * The Groups section: a browse screen with a toolbar (New, Delete), a search field, the list header
 * (Select all, Sort by, Refresh) and the list of groups, one row per group with its display name, its
 * name and, on the right, the display name of its ID provider. The browse screen itself is BrowsePage
 * (browse.page.js); this class binds it to the section and names the rows' key.
 */
const BrowsePage = require('../browse.page');
const appConst = require('../../libs/app_const');

// A group's principal key, the way the rows are identified; `idProvider` defaults to 'system'.
const groupKey = (name, idProvider = 'system') => `group:${idProvider}:${name}`;

class GroupsPage extends BrowsePage {
  constructor() {
    super({
      sectionId: appConst.SECTION_ID.GROUPS,
      pageComponent: 'GroupsPage',
      pageName: 'Groups page',
    });
  }

  static groupKey(name, idProvider) {
    return groupKey(name, idProvider);
  }

  // Display names of the groups listed, in display order.
  getGroupDisplayNames() {
    return this.getRowDisplayNames();
  }

  // Names (the line under the display name) of the groups listed, in display order.
  getGroupNames() {
    return this.getRowNames();
  }

  // The ID provider shown on the right of the row, e.g. 'System Id Provider' - or undefined.
  getGroupIdProvider(key) {
    return this.getRowMeta(key);
  }

  getGroupNameByDisplayName(displayName) {
    return this.getRowNameByDisplayName(displayName);
  }

  getGroupIdProviderByDisplayName(displayName) {
    return this.getRowMetaByDisplayName(displayName);
  }
}

module.exports = GroupsPage;
