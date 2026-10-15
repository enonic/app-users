/**
 * Created on 13.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const UsersPage = require('../../page_objects/users/users.page');
const UserEditorIdProviderStepDialog = require('../../page_objects/users/user-dialog/user.editor.id.provider.step.dialog');
const UserEditorGeneralStepDialog = require('../../page_objects/users/user-dialog/user.editor.general.step.dialog');
const userItemsBuilder = require('../../libs/users.items.builder');

describe("user.editor.general.step.spec - the user editor's General step: Next waits for the display name, the ID and the email, and a cleared display name is reported", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  const PROVIDER_NAME = userItemsBuilder.generateRandomName('provider');
  const USER_NAME = userItemsBuilder.generateRandomName('user');
  const DISPLAY_NAME_REQUIRED = 'Display name is required';
  // What createIdProviderViaApi() returns, with the key the delete at the end needs.
  let ID_PROVIDER;

  // The ID provider step comes before General: a provider to pick there.
  it('GIVEN the suite starts THEN an ID provider for its user should be created via the API', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let idProvider = userItemsBuilder.buildIdProvider(
      PROVIDER_NAME,
      'description',
      'Standard ID Provider',
      {
        'role:system.user.admin': appConst.ID_PROVIDER_ACCESS.WRITE_USERS,
      },
    );
    ID_PROVIDER = await settingsUtils.createIdProviderViaApi(idProvider);
  });

  // The step asks for a display name, an ID and an email, and Next waits for all three. The ID is
  // derived from the display name as it is typed, so the display name fills two of them at once;
  // the email is the last one.
  it('GIVEN the General step is opened THEN Next should be disabled AND WHEN the display name has been typed THEN the ID should be derived AND Next still disabled AND WHEN the email has been typed THEN Next should be enabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let idProviderStep = new UserEditorIdProviderStepDialog();
    let generalStep = new UserEditorGeneralStepDialog();
    let user = userItemsBuilder.buildUser({
      displayName: USER_NAME,
      idProvider: PROVIDER_NAME,
      email: userItemsBuilder.generateEmail(USER_NAME),
    });
    // 1. Open the editor, pick the provider, get to General.
    await usersPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    await idProviderStep.doFilterAndSelectIdProviderByDisplayName(PROVIDER_NAME);
    await idProviderStep.clickOnNextAndWaitForGeneralStep();
    assert.equal(await generalStep.getStepTitle(), 'General');
    // 2. Empty: every input is there, nothing is reported yet, Next is disabled.
    assert.ok(await generalStep.isDisplayNameInputDisplayed(), 'Display name input');
    assert.ok(await generalStep.isIdInputDisplayed(), 'ID input');
    assert.ok(await generalStep.isEmailInputDisplayed(), 'Email input');
    assert.equal(await generalStep.getTextInDisplayNameInput(), '');
    assert.equal(await generalStep.getTextInIdInput(), '');
    assert.equal(await generalStep.getTextInEmailInput(), '');
    assert.deepEqual(
      await generalStep.getValidationMessages(),
      [],
      'No message should be shown before an input is touched',
    );
    await generalStep.waitForNextButtonDisabled();
    // 3. The display name: the ID follows it; the email is still missing, so Next stays disabled.
    await generalStep.typeInDisplayNameInput(user.displayName);
    assert.equal(
      await generalStep.getTextInIdInput(),
      user.id,
      'The ID should be derived from the display name',
    );
    await generalStep.waitForNextButtonDisabled();
    // 4. The email: all three answered, Next is enabled.
    await generalStep.typeInEmailInput(user.email);
    await generalStep.waitForNextButtonEnabled();
    assert.deepEqual(
      await generalStep.getValidationMessages(),
      [],
      'No message should be shown for valid data',
    );
  });

  // A message is shown once the input has been left (Tab), and Next is disabled while it stands.
  it('GIVEN the General step is filled WHEN the display name has been cleared AND the input left THEN a validation message should be shown AND Next should be disabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let idProviderStep = new UserEditorIdProviderStepDialog();
    let generalStep = new UserEditorGeneralStepDialog();
    let user = userItemsBuilder.buildUser({
      displayName: USER_NAME,
      idProvider: PROVIDER_NAME,
      email: userItemsBuilder.generateEmail(USER_NAME),
    });
    // 1. Open the editor, pick the provider, fill General: Next is enabled.
    await usersPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    await idProviderStep.doFilterAndSelectIdProviderByDisplayName(PROVIDER_NAME);
    await idProviderStep.clickOnNextAndWaitForGeneralStep();
    await generalStep.typeData(user);
    await generalStep.waitForNextButtonEnabled();
    // 2. Clear the display name and leave the input: the message appears, Next is disabled.
    await generalStep.clearDisplayNameInput();
    await settingsUtils.doPressTabKey();
    await generalStep.waitForNextButtonDisabled();
    await generalStep.waitForValidationMessage(DISPLAY_NAME_REQUIRED);
    // 3. The display name again: the message goes, Next is enabled.
    await generalStep.typeInDisplayNameInput(user.displayName);
    await generalStep.waitForValidationMessageGone(DISPLAY_NAME_REQUIRED);
    await generalStep.waitForNextButtonEnabled();
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
  // No user was created in the provider - every editor here was closed without Create - so the
  // provider is free to go.
  after(async () => {
    if (ID_PROVIDER !== undefined) {
      await settingsUtils.deleteIdProviderViaApi(ID_PROVIDER).catch((err) => {
        console.log('The ID provider was not cleaned up: ' + err);
      });
    }
  });
});
