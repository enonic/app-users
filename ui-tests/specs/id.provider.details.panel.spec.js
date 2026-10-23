/**
 * Created on 22.10.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const userItemsBuilder = require('../libs/users.items.builder');
const IdProvidersPage = require('../page_objects/providers/id.providers.page');
const IdProviderDetails = require('../page_objects/providers/id.provider.details');
const IdProviderEditorGeneralStepDialog = require('../page_objects/providers/provider-dialog/provider.editor.general.step.dialog');
const IdProviderEditorPermissionsStepDialog = require('../page_objects/providers/provider-dialog/provider.editor.permissions.step.dialog');

describe("id.provider.details.panel.spec - the details panel of an ID provider: what it shows, and the editor its Edit and 'Edit permissions' buttons open on the saved provider", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  let ID_PROVIDER;
  let GROUP;
  const PROVIDER_NAME = userItemsBuilder.generateRandomName('provider');
  // The second test renames the provider; the rest of the suite knows it under this name. The key
  // never changes, so the rows are selected by it rather than by a display name that moves.
  const NEW_PROVIDER_NAME = userItemsBuilder.generateRandomName('renamedprovider');
  const USER_NAME = userItemsBuilder.generateRandomName('user');
  const GROUP_NAME = userItemsBuilder.generateRandomName('group');
  const APPLICATION = 'Standard ID Provider';
  const DESCRIPTION = 'created in the editor for the details panel';
  // The entries a new provider is seeded with, pinned both in the editor and in the saved provider.
  const SEEDED_PERMISSIONS = Object.freeze({
    Administrator: appConst.ID_PROVIDER_ACCESS.ADMINISTRATOR,
    'Users Administrator': appConst.ID_PROVIDER_ACCESS.ADMINISTRATOR,
    Authenticated: appConst.ID_PROVIDER_ACCESS.READ,
  });
  // The name each seeded principal shows under its display name.
  const SEEDED_NAMES = Object.freeze({
    Administrator: 'system.admin',
    'Users Administrator': 'system.user.admin',
    Authenticated: 'system.authenticated',
  });

  const GROUP_ACCESS = appConst.ID_PROVIDER_ACCESS.WRITE_USERS;

  it('GIVEN the suite starts THEN an ID provider with a user and a group in it should be created', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    ID_PROVIDER = userItemsBuilder.buildIdProvider({
      displayName: PROVIDER_NAME,
      description: DESCRIPTION,
      application: APPLICATION,
    });
    // 1. Create a new ID provider in the editor (not via the API).
    await settingsUtils.createIdProvider(ID_PROVIDER);
    // 2. A user and a group in it, so the panel has its Users and Groups sections.
    await settingsUtils.createUserViaApi(
      userItemsBuilder.buildUser({
        displayName: USER_NAME,
        idProvider: PROVIDER_NAME,
        email: userItemsBuilder.generateEmail(USER_NAME),
      }),
    );
    GROUP = await settingsUtils.createGroupViaApi(
      userItemsBuilder.buildGroup({
        displayName: GROUP_NAME,
        idProvider: PROVIDER_NAME,
      }),
    );
  });

  it('WHEN the new ID provider has been selected THEN the details should show its data, the seeded permissions and the user and the group in it', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let idProviderDetails = new IdProviderDetails();
    // 1. Select the ID provider made in the suite.
    await idProvidersPage.clickOnRowByDisplayName(PROVIDER_NAME);
    await idProviderDetails.waitForTitle(PROVIDER_NAME);
    // 2. The header and the fields of the 'ID provider' section hold what was typed in the editor.
    assert.equal(await idProviderDetails.getKey(), ID_PROVIDER.id);
    assert.equal(await idProviderDetails.getDescription(), DESCRIPTION);
    assert.equal(await idProviderDetails.getApplication(), APPLICATION);
    assert.equal(
      await idProviderDetails.getMode(),
      IdProviderDetails.MODE.LOCAL,
      'The Standard ID Provider keeps users and groups in XP',
    );
    // 3. The permissions and the principals are read apart from the provider itself, so the panel
    //    is titled and its fields are filled a moment before either list is there.
    for (const displayName of Object.keys(SEEDED_PERMISSIONS)) {
      await idProviderDetails.waitForPermission(displayName);
    }
    await idProviderDetails.waitForUser(USER_NAME);
    await idProviderDetails.waitForGroup(GROUP_NAME);
    // 4. Permissions: the three entries a new provider is seeded with, each with its access level.
    assert.equal(
      await idProviderDetails.getPermissionsCount(),
      Object.keys(SEEDED_PERMISSIONS).length,
    );
    assert.deepEqual(await idProviderDetails.getPermissions(), SEEDED_PERMISSIONS);
    // 5. Every entry shows the principal's name under its display name.
    let permissionItems = await idProviderDetails.getPermissionItems();
    for (const { title, subtitle } of permissionItems) {
      assert.equal(subtitle, SEEDED_NAMES[title], `'${title}' should show its name`);
    }
    // 6. Users: the one made via the API, an avatar with its display name beside it.
    assert.equal(await idProviderDetails.getUsersCount(), 1);
    assert.ok(
      (await idProviderDetails.getUsers()).includes(USER_NAME),
      `The user '${USER_NAME}' should be one of the users`,
    );
    // 7. Groups: the one made via the API, with its name under the display name.
    assert.equal(await idProviderDetails.getGroupsCount(), 1);
    let [group] = await idProviderDetails.getGroupItems();
    assert.equal(group.title, GROUP_NAME);
    assert.equal(group.subtitle, GROUP.id, 'The group should show its name');
  });

  it("GIVEN the ID provider is selected WHEN 'Edit' in the details has been clicked THEN the ID input and Save should be disabled AND WHEN the display name has been changed and saved THEN the details and the row should show the new name", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let idProviderDetails = new IdProviderDetails();
    let generalStep = new IdProviderEditorGeneralStepDialog();
    await idProvidersPage.clickOnRowByDisplayName(PROVIDER_NAME);
    await idProviderDetails.waitForTitle(PROVIDER_NAME);
    // 1. 'Edit' of the 'ID provider' section: the General step opens in step view.
    await idProviderDetails.clickOnEditButton();
    await generalStep.waitForLoaded();
    assert.equal(
      await generalStep.getTitle(),
      PROVIDER_NAME,
      'The dialog is titled by the provider',
    );
    assert.equal(await generalStep.getStepTitle(), 'General');
    assert.ok(await generalStep.isStepView(), 'One step, no stepper dots');
    // 2. The fields hold the saved data.
    assert.equal(await generalStep.getTextInDisplayNameInput(), PROVIDER_NAME);
    assert.equal(await generalStep.getTextInIdInput(), ID_PROVIDER.id);
    assert.equal(await generalStep.getTextInDescriptionTextArea(), DESCRIPTION);
    assert.equal(await generalStep.getSelectedApplication(), APPLICATION);
    // 3. The ID cannot be changed after creation, and nothing changed yet: Save is disabled.
    assert.ok(!(await generalStep.isIdInputEnabled()), 'The ID input should be disabled');
    await generalStep.waitForSaveButtonDisabled();
    // 4. Change the display name: Save is enabled, the ID stays as it was.
    await generalStep.clearDisplayNameInput();
    await generalStep.typeInDisplayNameInput(NEW_PROVIDER_NAME);
    await generalStep.waitForSaveButtonEnabled();
    assert.equal(
      await generalStep.getTextInIdInput(),
      ID_PROVIDER.id,
      'The ID of a saved provider does not follow its display name',
    );
    // 5. Save: the dialog closes and the notification message reports the update.
    await generalStep.clickOnSaveButtonAndWaitForClosed();
    await idProvidersPage.waitForExpectedNotificationMessage(
      appConst.idProviderUpdatedMessage(NEW_PROVIDER_NAME),
    );
    // 6. The details and the row in the list read the new display name; the key is unchanged.
    await idProviderDetails.waitForTitle(NEW_PROVIDER_NAME);
    assert.equal(await idProviderDetails.getKey(), ID_PROVIDER.id);
    await idProvidersPage.waitForRowByDisplayNameDisplayed(NEW_PROVIDER_NAME);
    assert.ok(
      !(await idProvidersPage.getProviderDisplayNames()).includes(PROVIDER_NAME),
      'The old display name should be gone from the list',
    );
  });

  // The application is the one thing on General a saved provider may still lose: removing it is
  // staged like any other change, so the way out of the dirty dialog asks before it closes.
  it("GIVEN the General step has been opened from the details WHEN the application has been removed AND the dialog has been closed THEN 'Keep editing' should be offered AND WHEN the step has been saved THEN the details should say no application is set", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let idProviderDetails = new IdProviderDetails();
    let generalStep = new IdProviderEditorGeneralStepDialog();
    await idProvidersPage.clickOnRowByName(ID_PROVIDER.id);
    await idProviderDetails.waitForTitle(NEW_PROVIDER_NAME);
    assert.equal(await idProviderDetails.getApplication(), APPLICATION);
    // 1. 'Edit': the General step opens with the bound application listed under the selector.
    await idProviderDetails.clickOnEditButton();
    await generalStep.waitForLoaded();
    await generalStep.waitForApplicationRowDisplayed();
    // 2. Remove the application: the row goes and Save is enabled.
    await generalStep.clickOnRemoveApplicationButton();
    await generalStep.waitForApplicationRowNotDisplayed();
    assert.strictEqual(
      await generalStep.getSelectedApplication(),
      undefined,
      'No application should be bound any more',
    );
    await generalStep.waitForSaveButtonEnabled();
    // 3. Close the dirty dialog: the question takes the footer's place, with the way back on it.
    await generalStep.clickOnCloseButton();
    await generalStep.waitForCloseQuestionDisplayed();
    assert.equal(
      await generalStep.getCloseQuestion(),
      'Do you want to close the dialog? Changes will be lost.',
    );
    assert.ok(await generalStep.isKeepButtonDisplayed(), "'Keep editing' should be offered");
    // 4. 'Keep editing': the question goes and the removal is still staged.
    await generalStep.clickOnKeepButton();
    await generalStep.waitForCloseQuestionNotDisplayed();
    assert.ok(await generalStep.isDialogDisplayed(), 'The editor should stay open');
    assert.ok(
      !(await generalStep.isApplicationRowDisplayed()),
      'The removal should survive the question',
    );
    // 5. Save: the dialog closes and the notification message reports the update.
    await generalStep.clickOnSaveButtonAndWaitForClosed();
    await idProvidersPage.waitForExpectedNotificationMessage(
      appConst.idProviderUpdatedMessage(NEW_PROVIDER_NAME),
    );
    // 6. The details say no application is set; a provider bound to nothing keeps its accounts in XP.
    await idProviderDetails.waitForApplication(IdProviderDetails.APPLICATION_NOT_SET);
    assert.equal(await idProviderDetails.getMode(), IdProviderDetails.MODE.LOCAL);
  });

  it("GIVEN the ID provider is selected WHEN 'Edit permissions' in the details has been clicked THEN the Permissions step should show the saved entries pinned AND WHEN the group has been added with an access and saved THEN the details should list it", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let idProviderDetails = new IdProviderDetails();
    let permissionsStep = new IdProviderEditorPermissionsStepDialog();
    await idProvidersPage.clickOnRowByName(ID_PROVIDER.id);
    await idProviderDetails.waitForTitle(NEW_PROVIDER_NAME);
    // 1. 'Edit permissions' of the Permissions section: the Permissions step opens in step view.
    await idProviderDetails.clickOnEditPermissionsButton();
    await permissionsStep.waitForLoaded();
    assert.equal(
      await permissionsStep.getTitle(),
      NEW_PROVIDER_NAME,
      'The dialog is titled by the provider',
    );
    assert.equal(await permissionsStep.getStepTitle(), 'Permissions');
    assert.ok(await permissionsStep.isStepView(), 'One step, no stepper dots');
    // 2. The provider's own entries and the defaults that pin them are two reads of their own, so
    //    the step is on screen before either has answered: wait for the rows and for the lock.
    for (const displayName of Object.keys(SEEDED_PERMISSIONS)) {
      await permissionsStep.waitForPrincipalSelected(displayName);
      await permissionsStep.waitForAccessSelectorDisabled(displayName);
    }
    // 3. The step opens on the provider's own entries, with the access each was saved with, and
    //    they are pinned: neither their access nor their presence may change.
    assert.deepEqual(await permissionsStep.getPermissions(), SEEDED_PERMISSIONS);
    for (const displayName of Object.keys(SEEDED_PERMISSIONS)) {
      assert.ok(
        !(await permissionsStep.isAccessSelectorEnabled(displayName)),
        `The access of '${displayName}' should be locked`,
      );
      assert.ok(
        !(await permissionsStep.isRemoveButtonEnabled(displayName)),
        `'${displayName}' should not be removable`,
      );
    }
    // 4. Nothing changed yet: Save is disabled.
    await permissionsStep.waitForSaveButtonDisabled();
    // 5. Add the group made in the suite and give it 'Write users'.
    await permissionsStep.addPrincipalWithAccess(GROUP_NAME, GROUP_ACCESS);
    await permissionsStep.waitForAccess(GROUP_NAME, GROUP_ACCESS);
    assert.ok(
      await permissionsStep.isRemoveButtonEnabled(GROUP_NAME),
      'An added entry is not pinned',
    );
    // 6. Save: the dialog closes and the notification message reports the update.
    await permissionsStep.clickOnSaveButtonAndWaitForClosed();
    await idProvidersPage.waitForExpectedNotificationMessage(
      appConst.idProviderUpdatedMessage(NEW_PROVIDER_NAME),
    );
    // 7. The details list the group among the permissions, with the access it was given.
    await idProviderDetails.waitForPermission(GROUP_NAME);
    await idProviderDetails.waitForAccess(GROUP_NAME, GROUP_ACCESS);
    assert.equal(
      await idProviderDetails.getPermissionsCount(),
      Object.keys(SEEDED_PERMISSIONS).length + 1,
    );
    assert.deepEqual(
      await idProviderDetails.getPermissions(),
      Object.assign({}, SEEDED_PERMISSIONS, { [GROUP_NAME]: GROUP_ACCESS }),
    );
    // 8. The group is still a group of the provider, listed under Groups as before.
    assert.equal(await idProviderDetails.getGroupsCount(), 1);
    assert.deepEqual(await idProviderDetails.getGroups(), [GROUP_NAME]);
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
