/**
 * Created on 30.09.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const RolesPage = require('../page_objects/roles/roles.page');

describe('roles.page.toolbar.sorting.spec - Roles page: New is enabled and Delete disabled with nothing selected, and the Sort by menu sets the order', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  it('WHEN Roles page is loaded THEN New button should be enabled AND Delete is disabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    // 1. Verify that New button is enabled.
    await rolesPage.waitForNewButtonEnabled();
    // 2. Verify that Delete button is disabled.
    await rolesPage.waitForDeleteButtonDisabled();
    await rolesPage.selectSortOrder(appConst.SORT_MENU_ITEM.DISPLAY_NAME_DESC);
    let actual = await rolesPage.getSelectedSortOrder();
    assert.equal(actual, appConst.SORT_MENU_ITEM.DISPLAY_NAME_DESC);
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
