/**
 * Created on 23.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const RolesPage = require('../../page_objects/roles/roles.page');
const RoleDetails = require('../../page_objects/roles/role.details');

describe("roles.page.system.role.delete.spec - a platform role is not the operator's to delete: its checkbox is greyed, and Delete stays disabled both in the toolbar and in the row's context menu", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // Roles every XP instance ships with. Each is keyed 'role:system.*', which is what makes it a
  // platform role - and a platform role may be neither ticked nor deleted.
  const SYSTEM_ROLE_NAMES = [
    'system.admin',
    'system.admin.login',
    'system.auditlog',
    'system.authenticated',
    'system.everyone',
  ];

  // The checkbox is greyed in place rather than left out: the row is an item, it is just not one to
  // act on. Reading it by key rather than by what the row shows, since a role further down the list
  // is scrolled out of view and only its display name would be unreachable.
  it('WHEN the Roles page is loaded THEN the checkbox of every system role should be disabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    // 1. Wait for the list of roles.
    await rolesPage.waitForListLoaded();
    await rolesPage.waitForRowDisplayed(RolesPage.roleKey(appConst.roleName.ADMINISTRATOR));
    // 2. Verify that the checkbox of each system role is disabled.
    for (const name of SYSTEM_ROLE_NAMES) {
      assert.ok(
        !(await rolesPage.isRowCheckboxEnabled(RolesPage.roleKey(name))),
        `The checkbox of the system role '${name}' should be disabled`,
      );
    }
    // 3. Nothing is ticked, so Delete has nothing to act on and is disabled.
    await rolesPage.waitForDeleteButtonDisabled();
  });

  // Delete acts on the ticked rows, or on the row that was clicked when none is ticked: clicking
  // Administrator makes it the one Delete would apply to, and it refuses it.
  it('GIVEN the Roles page is loaded WHEN the Administrator role has been clicked THEN Delete should stay disabled AND New should stay enabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    let roleDetails = new RoleDetails();
    // 1. Click on the role: the details open on the right, so the click did make it the active row.
    await rolesPage.clickOnRowByDisplayName(appConst.SYSTEM_ROLES.ADMINISTRATOR);
    await roleDetails.waitForTitle(appConst.SYSTEM_ROLES.ADMINISTRATOR);
    // 2. The click painted the row as selected without ticking it - and it cannot be ticked: its
    //    checkbox is disabled.
    await rolesPage.waitForRowHighlighted(RolesPage.roleKey(appConst.roleName.ADMINISTRATOR));
    assert.ok(
      !(await rolesPage.isRowChecked(RolesPage.roleKey(appConst.roleName.ADMINISTRATOR))),
      'Clicking the row should not tick it',
    );
    // 3. Verify that Delete is disabled for the clicked platform role.
    await rolesPage.waitForDeleteButtonDisabled();
    // 4. New is not about the selection, so it stays enabled.
    await rolesPage.waitForNewButtonEnabled();
  });

  // The row menu is the toolbar's list of actions, asked the same question about the same row, so
  // it has to answer the same way.
  it('GIVEN the Administrator role is the active row WHEN its context menu has been opened THEN the Delete item should be disabled AND the New item enabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    let roleDetails = new RoleDetails();
    await rolesPage.clickOnRowByDisplayName(appConst.SYSTEM_ROLES.ADMINISTRATOR);
    await roleDetails.waitForTitle(appConst.SYSTEM_ROLES.ADMINISTRATOR);
    // 1. Right-click on the role: the menu opens over the row with the toolbar's two actions.
    await rolesPage.openContextMenu(appConst.SYSTEM_ROLES.ADMINISTRATOR);
    assert.deepEqual(
      await rolesPage.getContextMenuItemLabels(),
      [appConst.ROW_MENU_ITEM.NEW, appConst.ROW_MENU_ITEM.DELETE],
      "The row menu should offer the toolbar's own actions",
    );
    // 2. Verify that the Delete item is disabled, as the toolbar's Delete button is.
    assert.ok(
      !(await rolesPage.isContextMenuItemEnabled(appConst.ROW_MENU_ITEM.DELETE)),
      'The Delete item should be disabled for a platform role',
    );
    // 3. New is enabled there too.
    assert.ok(
      await rolesPage.isContextMenuItemEnabled(appConst.ROW_MENU_ITEM.NEW),
      'The New item should be enabled',
    );
    // 4. Escape closes the menu and the toolbar is unchanged: the right click only retargeted the
    //    row, it did not tick it.
    await rolesPage.closeContextMenu();
    await rolesPage.waitForDeleteButtonDisabled();
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
});
