/**
 * Created on 30.10.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const GroupsPage = require('../page_objects/groups/groups.page');

describe('groups.page.toolbar.sorting.spec - ui-tests to verify state of buttons in the toolbar', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  it('WHEN Groups page is loaded THEN New button should be enabled AND Delete is disabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    // 1. Verify that New button is enabled.
    await groupsPage.waitForNewButtonEnabled();
    // 2. Verify that Delete button is disabled.
    await groupsPage.waitForDeleteButtonDisabled();
    await groupsPage.selectSortOrder(appConst.SORT_MENU_ITEM.ID_PROVIDER_DESC);
    //await usersPage.waitForSelectedSortOrder(appConst.SORT_MENU_ITEM.ID_PROVIDER_DESC);
    let actual = await groupsPage.getSelectedSortOrder();
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
