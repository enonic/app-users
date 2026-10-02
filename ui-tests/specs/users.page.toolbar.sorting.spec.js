/**
 * Created on 24.09.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const UsersPage = require('../page_objects/users/users.page');

describe('users.page.toolbar.sorting.spec - ui-tests to verify state of buttons in the users page toolbar', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  it('WHEN Users page is loaded THEN New button should be enabled AND Delete is disabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    // 1. Verify that New button is enabled.
    await usersPage.waitForNewButtonEnabled();
    // 2. Verify that Delete button is disabled.
    await usersPage.waitForDeleteButtonDisabled();
    await usersPage.selectSortOrder(appConst.SORT_MENU_ITEM.ID_PROVIDER_DESC);
    //await usersPage.waitForSelectedSortOrder(appConst.SORT_MENU_ITEM.ID_PROVIDER_DESC);
    let actual = await usersPage.getSelectedSortOrder();
    assert.equal(actual, appConst.SORT_MENU_ITEM.ID_PROVIDER_DESC);
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
