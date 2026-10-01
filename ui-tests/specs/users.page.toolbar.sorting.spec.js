/**
 * Created on 24.09.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const UsersPage = require('../page_objects/users/users.page');
const UserEditorIdProviderStepDialog = require('../page_objects/users/user-dialog/user.editor.id.provider.step.dialog');
const UserEditorGeneralStepDialog = require('../page_objects/users/user-dialog/user.editor.general.step.dialog');

describe('users.page.toolbar.sorting.spec - ui-tests to verify state of buttons in the toolbar', function () {
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

  // A new user opens on the ID provider step; General is the step after it, then Credentials.
  it('WHEN New button has been clicked THEN the ID provider step of the user editor should be loaded', async () => {
    let idProviderStepDialog = new UserEditorIdProviderStepDialog();
    let generalStepDialog = new UserEditorGeneralStepDialog();
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    await usersPage.clickOnNewButton();
    await idProviderStepDialog.waitForLoaded();
    await idProviderStepDialog.clickOnNextAndWaitForGeneralStep();
    await generalStepDialog.typeInEmailInput('aaq@gmail.com');
    await generalStepDialog.typeInDisplayNameInput('test');
    await generalStepDialog.typeInIdInput('xx');
    await generalStepDialog.clickOnNextButton();
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
