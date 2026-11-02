/**
 * Created on 02.11.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const RolesPage = require('../../page_objects/roles/roles.page');
const ConfirmationDialog = require('../../page_objects/confirmation.dialog');
const userItemsBuilder = require('../../libs/users.items.builder');

describe("roles.page.filtering.spec - Roles page: the search by name in either case, the 'Origin' field of the filter over a system role and over a role made in the editor, and the narrowing by a picked origin", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  // A system role every instance has: 'Audit Log', system.auditlog.
  const SYSTEM_ROLE = appConst.SYSTEM_ROLES.AUDIT_LOG;
  const SYSTEM_ROLE_NAME = 'system.auditlog';
  // The search is case-insensitive: the same role answers to the term in either case.
  const SEARCH_LOWER = 'audit log';
  const SEARCH_UPPER = 'AUDIT LOG';
  // Made in the editor; the one custom role the search for its name leaves.
  const ROLE_NAME = userItemsBuilder.generateRandomName('role');
  let ROLE;

  // Every value of the filter but the one the role falls in counts 0 and is disabled: the fixed
  // 'System' and 'Custom', and one per project under 'Project roles'.
  function assertOnlyValueEnabled(values, enabledId, enabledLabel) {
    let enabled = values.find(({ id }) => id === enabledId);
    assert.ok(enabled !== undefined, `'${enabledLabel}' should be offered by the filter`);
    assert.equal(enabled.label, enabledLabel);
    assert.equal(enabled.count, 1, `'${enabledLabel}' should count the one role the search left`);
    assert.ok(!enabled.disabled, `'${enabledLabel}' should be enabled`);
    for (const value of values.filter(({ id }) => id !== enabledId)) {
      assert.equal(value.count, 0, `'${value.label}' should count no role`);
      assert.ok(value.disabled, `'${value.label}' should be disabled`);
    }
  }

  it("WHEN 'audit log' has been entered in the search input THEN 'Audit Log' alone should be listed AND the filter should offer 'Origin' AND, entered, count the role under 'System' alone, every other value disabled", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    await rolesPage.waitForRowByDisplayNameDisplayed(SYSTEM_ROLE);
    await rolesPage.waitForRowByDisplayNameDisplayed(appConst.SYSTEM_ROLES.ADMINISTRATOR);
    // 1. The name in lower case, entered as a term, leaves the system role alone.
    await rolesPage.addSearchTerm(SEARCH_LOWER);
    await rolesPage.waitForRowByDisplayNameNotDisplayed(appConst.SYSTEM_ROLES.ADMINISTRATOR);
    assert.deepEqual(await rolesPage.getSearchTerms(), [SEARCH_LOWER]);
    assert.deepEqual(
      await rolesPage.getRoleDisplayNames(),
      [SYSTEM_ROLE],
      'Only the role with that name should be listed',
    );
    assert.equal(await rolesPage.getRoleNameByDisplayName(SYSTEM_ROLE), SYSTEM_ROLE_NAME);
    // 2. A system role cannot be deleted, so its row's checkbox is disabled in the narrowed list
    //    as in the whole one.
    assert.ok(
      !(await rolesPage.isRowCheckboxEnabled(RolesPage.roleKey(SYSTEM_ROLE_NAME))),
      `The checkbox of '${SYSTEM_ROLE}' should be disabled in the narrowed list`,
    );
    // 3. A click in the search input opens the fields: 'Origin' is offered.
    await rolesPage.openFilterDropdown();
    await settingsUtils.saveScreenshot('roles_filter_origin_field');
    assert.ok(await rolesPage.isOriginFilterFieldOffered(), "'Origin' should be offered");
    // 4. Entered, the field counts the role under 'System': one, enabled; 'Custom' and the
    //    projects' values count none and are disabled.
    await rolesPage.openOriginFilterValues();
    let values = await rolesPage.getFilterValues();
    await settingsUtils.saveScreenshot('roles_filter_origin_values_system');
    assertOnlyValueEnabled(values, RolesPage.ORIGIN_VALUE.SYSTEM, RolesPage.ORIGIN_LABEL.SYSTEM);
    assert.ok(
      values.some(({ id }) => id === RolesPage.ORIGIN_VALUE.CUSTOM),
      "'Custom' should be offered, disabled, as well",
    );
    await rolesPage.closeFilterDropdown();
  });

  // The same search in upper case; then 'System' picked beside it, which narrows nothing further,
  // and the name's term taken back, which leaves the system roles alone.
  it("WHEN 'AUDIT LOG' has been entered in the search input THEN 'Audit Log' alone should be listed AND WHEN 'System' has been picked in 'Origin' AND the name's term removed THEN only system roles should be listed", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    await rolesPage.waitForRowByDisplayNameDisplayed(SYSTEM_ROLE);
    await rolesPage.waitForRowByDisplayNameDisplayed(appConst.SYSTEM_ROLES.ADMINISTRATOR);
    // 1. The name in upper case matches the same role.
    await rolesPage.addSearchTerm(SEARCH_UPPER);
    await rolesPage.waitForRowByDisplayNameNotDisplayed(appConst.SYSTEM_ROLES.ADMINISTRATOR);
    await settingsUtils.saveScreenshot('roles_search_upper_case');
    assert.deepEqual(
      await rolesPage.getRoleDisplayNames(),
      [SYSTEM_ROLE],
      'The search should match regardless of case',
    );
    // 2. 'System' picked in 'Origin': the second term's tag reads the label, the list is unchanged.
    await rolesPage.filterByOrigin(RolesPage.ORIGIN_VALUE.SYSTEM, RolesPage.ORIGIN_LABEL.SYSTEM);
    assert.deepEqual(await rolesPage.getSearchTerms(), [
      SEARCH_UPPER,
      RolesPage.ORIGIN_LABEL.SYSTEM,
    ]);
    assert.deepEqual(await rolesPage.getRoleDisplayNames(), [SYSTEM_ROLE]);
    // 3. The field, entered again, marks 'System' as picked.
    await rolesPage.openOriginFilterValues();
    let values = await rolesPage.getFilterValues();
    let picked = values.find(({ id }) => id === RolesPage.ORIGIN_VALUE.SYSTEM);
    assert.ok(picked?.selected, "'System' should be marked as picked");
    await rolesPage.closeFilterDropdown();
    // 4. The name's term taken back: every system role is listed, and nothing but system roles -
    //    the platform's 'system.*' and 'cms.*' ones, a project's 'cms.project.*' not among them.
    await rolesPage.removeSearchTerm(SEARCH_UPPER);
    assert.deepEqual(await rolesPage.getSearchTerms(), [RolesPage.ORIGIN_LABEL.SYSTEM]);
    await rolesPage.waitForRowByDisplayNameDisplayed(appConst.SYSTEM_ROLES.ADMINISTRATOR);
    let names = await rolesPage.getRoleNames();
    assert.ok(names.includes(SYSTEM_ROLE_NAME), `'${SYSTEM_ROLE_NAME}' should be listed`);
    assert.ok(
      names.every((name) => RolesPage.isSystemRoleName(name)),
      "Only system roles should be listed with 'System' picked: " + JSON.stringify(names),
    );
    // 5. The origin's tag cross takes the last term back: the list is whole again.
    await rolesPage.removeSearchTerm(RolesPage.originTerm(RolesPage.ORIGIN_LABEL.SYSTEM));
    assert.deepEqual(await rolesPage.getSearchTerms(), [], 'No term should be left');
    await rolesPage.waitForRowByDisplayNameDisplayed(SYSTEM_ROLE);
  });

  // A role made in the editor is a custom one: the search for its name finds it, and the filter
  // counts it under 'Custom' alone, the only value left enabled.
  it("GIVEN a new role has been created in the editor WHEN its name has been entered in the search input THEN that role alone should be listed AND 'Origin' should count it under 'Custom' alone AND WHEN 'Custom' has been picked THEN the role should still be listed", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    // 1. Create the role in the editor (not via the API): General filled, Users and Groups skipped.
    ROLE = await settingsUtils.createRole(
      userItemsBuilder.buildRole({ displayName: ROLE_NAME, description: 'custom role' }),
    );
    await rolesPage.waitForRowByDisplayNameDisplayed(ROLE_NAME);
    // 2. Its name, entered as a term, leaves it alone in the list.
    await rolesPage.addSearchTerm(ROLE_NAME);
    await rolesPage.waitForRowByDisplayNameNotDisplayed(SYSTEM_ROLE);
    assert.deepEqual(
      await rolesPage.getRoleDisplayNames(),
      [ROLE_NAME],
      'Only the new role should be listed',
    );
    // 3. 'Origin' counts it under 'Custom': one, enabled; 'System' and the projects' values are
    //    disabled.
    await rolesPage.openOriginFilterValues();
    let values = await rolesPage.getFilterValues();
    await settingsUtils.saveScreenshot('roles_filter_origin_values_custom');
    assertOnlyValueEnabled(values, RolesPage.ORIGIN_VALUE.CUSTOM, RolesPage.ORIGIN_LABEL.CUSTOM);
    assert.ok(
      values.some(({ id }) => id === RolesPage.ORIGIN_VALUE.SYSTEM),
      "'System' should be offered, disabled, as well",
    );
    // 4. 'Custom' picked: a second term, and the role is still the one listed.
    await rolesPage.clickOnFilterValue(
      RolesPage.ORIGIN_VALUE.CUSTOM,
      RolesPage.originTerm(RolesPage.ORIGIN_LABEL.CUSTOM),
    );
    await rolesPage.closeFilterDropdown();
    assert.deepEqual(await rolesPage.getSearchTerms(), [ROLE_NAME, RolesPage.ORIGIN_LABEL.CUSTOM]);
    assert.deepEqual(await rolesPage.getRoleDisplayNames(), [ROLE_NAME]);
  });

  it('WHEN the name of the new role has been entered in the search input in upper case THEN that role alone should be listed', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    await rolesPage.waitForRowByDisplayNameDisplayed(ROLE_NAME);
    await rolesPage.addSearchTerm(ROLE_NAME.toUpperCase());
    await rolesPage.waitForRowByDisplayNameNotDisplayed(SYSTEM_ROLE);
    await settingsUtils.saveScreenshot('roles_search_custom_upper_case');
    assert.deepEqual(
      await rolesPage.getRoleDisplayNames(),
      [ROLE_NAME],
      'The search should match the new role regardless of case',
    );
  });

  // The search stays in force while the one role it matches is deleted: the list has nothing to
  // show and says so, and 'Custom' counts no role, since the search matches none. Once the term is
  // taken back the list is whole again, and 'Custom' still counts none: the deleted role was the
  // only custom one, every other role being the platform's or a project's.
  it("GIVEN the name of the new role has been entered in the search input WHEN that role has been deleted THEN 'Nothing matches the search' should be shown AND 'Custom' should be disabled AND WHEN the term has been removed THEN 'Custom' should still count no role", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    let confirmationDialog = new ConfirmationDialog(appConst.SECTION_ID.ROLES);
    await rolesPage.waitForRowByDisplayNameDisplayed(ROLE_NAME);
    // 1. Narrow the list to the new role.
    await rolesPage.addSearchTerm(ROLE_NAME);
    await rolesPage.waitForRowByDisplayNameNotDisplayed(SYSTEM_ROLE);
    assert.deepEqual(await rolesPage.getRoleDisplayNames(), [ROLE_NAME]);
    // 2. Delete it in the narrowed list: the dialog names the role, the name typed back confirms.
    await rolesPage.clickOnRowByDisplayName(ROLE_NAME);
    await rolesPage.waitForDeleteButtonEnabled();
    await rolesPage.clickOnDeleteButton();
    await confirmationDialog.waitForDialogOpened();
    assert.equal(await confirmationDialog.getTargetDisplayName(), ROLE_NAME);
    await confirmationDialog.confirmDelete(ROLE_NAME);
    await rolesPage.waitForExpectedNotificationMessage(appConst.principalDeletedMessage(ROLE_NAME));
    // Deleted here, so the API delete at the end has nothing to do.
    ROLE = undefined;
    // 3. The term is still in force and matches nothing now: the list says so.
    await rolesPage.waitForRowByDisplayNameNotDisplayed(ROLE_NAME);
    assert.deepEqual(await rolesPage.getSearchTerms(), [ROLE_NAME]);
    assert.deepEqual(await rolesPage.getRoleDisplayNames(), [], 'No role should be listed');
    assert.equal(
      await rolesPage.getListMessage(),
      appConst.LIST_MESSAGE.NOTHING_MATCHES,
      "The list should read 'Nothing matches the search'",
    );
    // 4. 'Origin': no role the search matches, so every value counts 0 and is disabled.
    await rolesPage.openOriginFilterValues();
    let values = await rolesPage.getFilterValues();
    await settingsUtils.saveScreenshot('roles_filter_origin_values_disabled');
    let custom = values.find(({ id }) => id === RolesPage.ORIGIN_VALUE.CUSTOM);
    assert.ok(custom !== undefined, "'Custom' should still be offered by the filter");
    assert.equal(custom.count, 0, "'Custom' should count no role once the role is deleted");
    assert.ok(custom.disabled, "'Custom' should be disabled");
    assert.ok(
      values.every(({ disabled }) => disabled),
      "Every value of 'Origin' should be disabled: " + JSON.stringify(values),
    );
    // 5. 'Clear the filter', clicked over the open dropdown: the term goes, and the dropdown steps
    //    out of the field back to its first stage.
    await rolesPage.clickOnClearSearchButton();
    await rolesPage.waitForFilterFieldLeft();
    assert.deepEqual(await rolesPage.getSearchTerms(), [], 'No search term should be left');
    await rolesPage.closeFilterDropdown();
    // 6. The list is whole again, the deleted role not in it.
    await rolesPage.waitForRowByDisplayNameDisplayed(SYSTEM_ROLE);
    assert.equal(await rolesPage.getListMessage(), undefined, 'No message should be shown');
    assert.ok(
      !(await rolesPage.isRowByDisplayNameDisplayed(ROLE_NAME)),
      'The deleted role should not be listed',
    );
    // 7. 'Origin' over the whole list: 'System' counts the system roles, enabled; 'Custom' still
    //    counts none and stays disabled - there is no custom role left.
    await rolesPage.openOriginFilterValues();
    values = await rolesPage.getFilterValues();
    await settingsUtils.saveScreenshot('roles_filter_origin_values_no_custom');
    let system = values.find(({ id }) => id === RolesPage.ORIGIN_VALUE.SYSTEM);
    assert.ok(system !== undefined, "'System' should be offered by the filter");
    assert.ok(system.count > 0, "'System' should count the system roles");
    assert.ok(!system.disabled, "'System' should be enabled once the term is gone");
    custom = values.find(({ id }) => id === RolesPage.ORIGIN_VALUE.CUSTOM);
    assert.equal(
      custom.count,
      0,
      "'Custom' should count no role: the deleted one was the only one",
    );
    assert.ok(custom.disabled, "'Custom' should stay disabled");
    await rolesPage.closeFilterDropdown();
  });

  beforeEach(async () => {
    await settingsUtils.navigateToSettingsApp();
  });
  afterEach(() => settingsUtils.doCloseAllWindowTabsAndNavigateToHome());
  before(async () => {
    if (typeof browser !== 'undefined') {
      await settingsUtils
        .getBrowser()
        .setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
    }
    return console.log('specification starting: ' + this.title);
  });
  // The role is deleted in the browser, which unsets it, so the delete here only runs when the
  // suite did not get that far.
  after(async () => {
    if (ROLE !== undefined) {
      await settingsUtils.deletePrincipalsViaApi(ROLE).catch((err) => {
        console.log(`'${ROLE.displayName}' was not cleaned up: ` + err);
      });
    }
  });
});
