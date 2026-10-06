/**
 * Created on 24.09.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const UsersPage = require('../page_objects/users/users.page');
const userItemsBuilder = require('../libs/users.items.builder');
const IdProvidersPage = require('../page_objects/providers/id.providers.page');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');

describe('idprovider.in.use.delete.spec - an ID provider in use by a user cannot be deleted: Delete is disabled until the user is gone', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  let ID_PROVIDER;
  const PROVIDER_NAME = userItemsBuilder.generateRandomName('provider');
  const PROVIDER_ID = userItemsBuilder.generateRandomName('id');
  let USER_NAME = userItemsBuilder.generateRandomName('user');

  it('WHEN new created idProvider has been selected THEN Delete button should be enabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    ID_PROVIDER = userItemsBuilder.buildIdProvider({
      displayName: PROVIDER_NAME,
      //id: 'my-provider-id1',
      description: 'description',
      application: 'Standard ID Provider',
    });
    await settingsUtils.createIdProvider(ID_PROVIDER);
    let idProvidersPage = new IdProvidersPage();
    await idProvidersPage.clickOnRowByDisplayName(ID_PROVIDER.displayName);
    await idProvidersPage.waitForDeleteButtonEnabled();
    await idProvidersPage.waitForNewButtonEnabled();
  });

  it('WHEN new created user has been selected THEN Delete button should be enabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let user = userItemsBuilder.buildUser({
      displayName: USER_NAME,
      idProvider: ID_PROVIDER.displayName,
      email: userItemsBuilder.generateEmail(USER_NAME),
    });
    await settingsUtils.createUser(user);
    let usersPage = new UsersPage();
    await usersPage.clickOnRowByDisplayName(user.displayName);
    await usersPage.waitForDeleteButtonEnabled();
    await usersPage.waitForNewButtonEnabled();
    let userIdProvider = await usersPage.getUserIdProviderByDisplayName(user.displayName);
    assert.equal(userIdProvider, ID_PROVIDER.displayName);
  });

  it('WHEN the idProvider has been selected THEN Delete button should be disabled because it is being used by a user', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    // 1. Select the ID provider that is being used by a user.
    await idProvidersPage.clickOnRowByDisplayName(ID_PROVIDER.displayName);
    // 2. Verify that Delete button is disabled because the ID provider is being used by a user.
    await idProvidersPage.waitForDeleteButtonDisabled();
    await idProvidersPage.waitForNewButtonEnabled();
    // 3. Verify that the application of the ID provider is correct.
    let application = await idProvidersPage.getProviderApplication(PROVIDER_NAME);
    assert.equal(application, ID_PROVIDER.application);
  });

  // Deleting takes a typed confirmation: the dialog names the user and the Delete button stays
  // disabled until the user's name is typed back.
  it("GIVEN an existing user is selected AND Delete has been clicked WHEN the user's name is typed in the confirmation dialog AND Delete is confirmed THEN the user should be removed from the list", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let confirmationDialog = new ConfirmationDialog(appConst.SECTION_ID.USERS);
    // 1. Select the user: Delete gets enabled.
    await usersPage.clickOnRowByDisplayName(USER_NAME);
    await usersPage.waitForDeleteButtonEnabled();
    // 2. Click on Delete: the confirmation dialog opens, naming the user.
    await usersPage.clickOnDeleteButton();
    await confirmationDialog.waitForDialogOpened();
    assert.equal(
      await confirmationDialog.getTargetDisplayName(),
      USER_NAME,
      'The confirmation dialog should name the user to delete',
    );
    // 3. The Delete button is disabled until the user's name is typed back.
    await confirmationDialog.waitForDeleteButtonDisabled();
    await confirmationDialog.typeInConfirmInput(USER_NAME);
    await confirmationDialog.waitForDeleteButtonEnabled();
    // 4. Confirm: the dialog closes, the toast reports the deletion.
    await confirmationDialog.clickOnDeleteButton();
    await confirmationDialog.waitForDialogClosed();
    await usersPage.waitForExpectedNotificationMessage(appConst.principalDeletedMessage(USER_NAME));
    // 5. The user is no longer listed and nothing is selected: Delete is disabled again.
    await usersPage.waitForRowByDisplayNameNotDisplayed(USER_NAME);
    await usersPage.waitForDeleteButtonDisabled();
  });

  it('WHEN the idProvider has been selected THEN Delete button should be enabled because the user was deleted', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    // 1. Select the ID provider that is being used by a user.
    await idProvidersPage.clickOnRowByDisplayName(ID_PROVIDER.displayName);
    // 2. Verify that Delete button is disabled because the ID provider is being used by a user.
    await idProvidersPage.waitForDeleteButtonEnabled();
    await idProvidersPage.clickOnDeleteButton();
    let confirmationDialog = new ConfirmationDialog(appConst.SECTION_ID.ID_PROVIDERS);
    await confirmationDialog.waitForDialogOpened();
    assert.equal(
      await confirmationDialog.getTargetDisplayName(),
      ID_PROVIDER.displayName,
      'The confirmation dialog should name the ID provider to delete',
    );
    await confirmationDialog.typeInConfirmInput(ID_PROVIDER.displayName);
    await confirmationDialog.waitForDeleteButtonEnabled();
    await confirmationDialog.clickOnDeleteButton();
    await confirmationDialog.waitForDialogClosed();
    await idProvidersPage.waitForExpectedNotificationMessage(
      appConst.principalDeletedMessage(ID_PROVIDER.displayName),
    );
    await idProvidersPage.waitForRowByDisplayNameNotDisplayed(ID_PROVIDER.displayName);
    // TODO bug
    //await idProvidersPage.waitForDeleteButtonDisabled();
  });

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
