/**
 * Created on 23.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const userItemsBuilder = require('../../libs/users.items.builder');
const RolesPage = require('../../page_objects/roles/roles.page');

describe("roles.page.select.all.spec - Select all ticks what the operator may act on and nothing else: a role made here joins the selection, the platform's own are left out of it", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const NEW_ROLE = userItemsBuilder.buildRole({
    displayName: userItemsBuilder.generateRandomName('role'),
  });
  // What createRoleViaApi() answered, with the key the delete at the end needs.
  let ROLE;

  // 'Select all' ticks the rows the section lets the operator act on - selectableKeys() drops the
  // rest - so the one row made here is ticked while every 'role:system.*' one stays out, with its
  // checkbox greyed as it was before the click.
  it('GIVEN a role has been created via the API WHEN Select all has been clicked THEN the new role should be ticked AND Administrator should not be', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    const ADMIN_KEY = RolesPage.roleKey(appConst.roleName.ADMINISTRATOR);
    // 1. Create the role through the API: the editor is not what is under test here.
    ROLE = await settingsUtils.createRoleViaApi(NEW_ROLE);
    // 2. The list was read before the role existed, so it is re-read rather than waited on: the
    //    section does follow the server's events, but that is not what this test is about.
    await rolesPage.clickOnRefreshButton();
    await rolesPage.waitForRowDisplayed(ROLE.key);
    // 3. Nothing is ticked yet.
    assert.ok(!(await rolesPage.isSelectAllCheckboxSelected()), 'Select all should start unticked');
    await rolesPage.waitForDeleteButtonDisabled();
    // 4. Click on Select all.
    await rolesPage.clickOnSelectAllCheckbox();
    // 5. Verify that the role made here is ticked.
    assert.ok(
      await rolesPage.isRowChecked(ROLE.key),
      `The role '${ROLE.displayName}' should be ticked`,
    );
    // 6. Verify that Administrator is not - and that its checkbox is still the greyed one, which is
    //    why Select all passed it by.
    assert.ok(
      !(await rolesPage.isRowChecked(ADMIN_KEY)),
      'Administrator should be left out of the selection',
    );
    assert.ok(
      !(await rolesPage.isRowCheckboxEnabled(ADMIN_KEY)),
      "Administrator's checkbox should stay disabled",
    );
    // 7. The header's own checkbox reads as ticked all the same: the rows it cannot tick do not
    //    count against it.
    //
    //    Nothing is asserted about Delete here. What Select all ticks and what Delete may act on are
    //    two different questions - selectable rows are the ones that are not isPlatformRole, while
    //    Delete asks isReservedRole, which also covers a project's five roles - so a project role,
    //    ticked but undeletable, holds the button back. Whether the instance has one is not this
    //    test's business.
    assert.ok(
      await rolesPage.isSelectAllCheckboxSelected(),
      'Select all should be ticked once every selectable role is',
    );
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
  after(async () => {
    if (ROLE !== undefined) {
      await settingsUtils.deletePrincipalsViaApi(ROLE).catch((err) => {
        console.log(`'${ROLE.displayName}' was not cleaned up: ` + err);
      });
    }
  });
});
