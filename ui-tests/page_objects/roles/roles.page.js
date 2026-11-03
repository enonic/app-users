/**
 * Created on 01.10.2026.
 *
 * The Roles section: a browse screen with a toolbar (New, Delete), a search field, the list header
 * (Select all, Sort by, Refresh) and the list of roles, one row per role with its display name and
 * its name. A role lives in the system store, so the rows carry no ID provider column. The browse
 * screen itself is BrowsePage (browse.page.js); this class binds it to the section, adds the
 * 'Origin' field of the filter and names the rows' key.
 */
const BrowsePage = require('../browse.page');
const appConst = require('../../libs/app_const');

// A role's principal key, the way the rows are identified, e.g. roleKey('system.admin').
const roleKey = (name) => `role:${name}`;

// The one field the filter offers (pages/roles/model/roles.filter.ts): which bucket a role falls
// in - 'system' (the platform's roles), 'custom' (the ones made here) or 'project:<id>' (a project's
// roles, grouped under 'Project roles') - each counting the roles the search would leave in it. Its
// label is the phrase roles.filter.scope.
const FILTER_FIELD = Object.freeze({ ORIGIN: 'scope' });
const ORIGIN_FIELD_LABEL = 'Origin';
const ORIGIN_VALUE = Object.freeze({ SYSTEM: 'system', CUSTOM: 'custom' });
const ORIGIN_LABEL = Object.freeze({ SYSTEM: 'System', CUSTOM: 'Custom' });

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

  static get FILTER_FIELD() {
    return FILTER_FIELD;
  }

  static get ORIGIN_VALUE() {
    return ORIGIN_VALUE;
  }

  static get ORIGIN_LABEL() {
    return ORIGIN_LABEL;
  }

  // What the Remove button of a picked origin's tag names: 'Origin: <label>'. The tag itself reads
  // the label alone.
  static originTerm(label) {
    return `${ORIGIN_FIELD_LABEL}: ${label}`;
  }

  // Whether the name (the line under the display name) is a role of the 'System' origin: the
  // platform's 'system.*' and 'cms.*' roles, a project's 'cms.project.*' not among them
  // (entities/principal/model/principal.keys.ts, isPlatformRole).
  static isSystemRoleName(name) {
    return !name.startsWith('cms.project.') && /^(system|cms)\./.test(name);
  }

  // Filter: the 'Origin' field

  // Whether the dropdown, open on its first stage, offers 'Origin'.
  isOriginFilterFieldOffered() {
    return this.isFilterFieldOffered(FILTER_FIELD.ORIGIN);
  }

  // Enters the 'Origin' field of the filter: its values are shown (getFilterValues).
  openOriginFilterValues() {
    return this.openFilterFieldValues(FILTER_FIELD.ORIGIN);
  }

  // Narrows the list to the origin: the field is entered, the value picked by its id
  // (ORIGIN_VALUE.*), the dropdown closed. `label` is the value's (ORIGIN_LABEL.*), which the
  // term's tag reads.
  async filterByOrigin(id, label) {
    await this.openOriginFilterValues();
    await this.clickOnFilterValue(id, RolesPage.originTerm(label));
    return await this.closeFilterDropdown();
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
