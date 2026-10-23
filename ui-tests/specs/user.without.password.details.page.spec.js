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
const UserEditorCredentialStepDialog = require('../page_objects/users/user-dialog/user.editor.credentials.step.dialog');
const UserEditorRolesStepDialog = require('../page_objects/users/user-dialog/user.editor.roles.step.dialog');
const UserEditorGroupsStepDialog = require('../page_objects/users/user-dialog/user.editor.groups.step.dialog');
const UserEditorSummaryStepDialog = require('../page_objects/users/user-dialog/user.editor.summary.step.dialog');
const UserDetails = require('../page_objects/users/user.details');
const userItemsBuilder = require('../libs/users.items.builder');

describe('user.without.password.details.page.spec - an ID provider made via the API, a user created in it by the editor without a password, and the password set afterwards from the details', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  const PROVIDER_NAME = userItemsBuilder.generateRandomName('provider');
  const USER_NAME = userItemsBuilder.generateRandomName('user');
  const USER = userItemsBuilder.buildUser({
    displayName: USER_NAME,
    idProvider: PROVIDER_NAME,
    email: userItemsBuilder.generateEmail(USER_NAME),
  });
  // What createIdProviderViaApi() returns, with the key the delete at the end needs.
  let ID_PROVIDER;

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

  // A new user opens on the ID provider step; General is the step after it, then Credentials,
  // Roles, Groups and Summary. The password and the roles are optional: here both are skipped.
  it('GIVEN the user editor is opened WHEN a user in the new ID provider has been created without a password and roles THEN the user should be listed with that provider', async () => {
    let idProviderStepDialog = new UserEditorIdProviderStepDialog();
    let generalStepDialog = new UserEditorGeneralStepDialog();
    let credentialsStepDialog = new UserEditorCredentialStepDialog();
    let rolesStepDialog = new UserEditorRolesStepDialog();
    let groupsStepDialog = new UserEditorGroupsStepDialog();
    let summaryStepDialog = new UserEditorSummaryStepDialog();
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    // 1. Open the editor: it starts on the ID provider step; the provider made via API is picked (the system one takes service accounts only).
    await usersPage.clickOnNewButton();
    await idProviderStepDialog.waitForLoaded();
    await idProviderStepDialog.doFilterAndSelectIdProviderByDisplayName(PROVIDER_NAME);
    await idProviderStepDialog.clickOnNextAndWaitForGeneralStep();
    // 2. General: display name, ID and email.
    await generalStepDialog.typeInDisplayNameInput(USER.displayName);
    await generalStepDialog.typeInEmailInput(USER.email);
    await generalStepDialog.clickOnNextButton();
    // 3. Credentials: no password is set - 'Set password' stays, the input never appears.
    await credentialsStepDialog.waitForLoaded();
    await credentialsStepDialog.waitForSetPasswordButtonDisplayed();
    assert.ok(
      !(await credentialsStepDialog.isPasswordInputDisplayed()),
      'The password input should not be displayed before Set password is clicked',
    );
    await credentialsStepDialog.clickOnNextButton();
    // 4. Roles: none is picked.
    await rolesStepDialog.waitForLoaded();
    assert.deepEqual(await rolesStepDialog.getSelectedRoles(), [], 'No role should be picked');
    await rolesStepDialog.clickOnNextButton();
    // 5. Groups: none is picked.
    await groupsStepDialog.waitForLoaded();
    assert.deepEqual(await groupsStepDialog.getSelectedGroups(), [], 'No group should be picked');
    await groupsStepDialog.clickOnNextButton();
    // 6. Summary reads the answers back; a row with nothing to say (Credentials, Roles, Groups) is absent.
    await summaryStepDialog.waitForLoaded();
    assert.equal(await summaryStepDialog.getUser(), `${USER.displayName} (${USER.id})`);
    assert.equal(await summaryStepDialog.getIdProvider(), PROVIDER_NAME);
    assert.equal(await summaryStepDialog.getEmail(), USER.email);
    assert.ok(
      !(await summaryStepDialog.isRowDisplayed(UserEditorSummaryStepDialog.LABEL.CREDENTIALS)),
      'The Credentials row should be absent when no password is set',
    );
    assert.ok(
      !(await summaryStepDialog.isRowDisplayed(UserEditorSummaryStepDialog.LABEL.ROLES)),
      'The Roles row should be absent when no role is picked',
    );
    assert.ok(
      !(await summaryStepDialog.isRowDisplayed(UserEditorSummaryStepDialog.LABEL.GROUPS)),
      'The Groups row should be absent when no group is picked',
    );
    // 7. Create: the dialog closes, the notification message confirms, the user is listed with its ID provider.
    await summaryStepDialog.clickOnCreateButtonAndWaitForClosed();
    await usersPage.waitForExpectedNotificationMessage(
      appConst.userCreatedMessage(USER.displayName),
    );
    await usersPage.waitForRowByDisplayNameDisplayed(USER.displayName);
    assert.equal(await usersPage.getUserIdProviderByDisplayName(USER.displayName), USER.idProvider);
  });

  // The user was created without a password. 'Edit credentials' in the details opens the Credentials
  // step alone (step view); Set password shows the input, Save makes it so, and the details re-read
  // the user.
  it("GIVEN the new user is selected AND the details say the password is 'Not set' WHEN 'Edit credentials' has been clicked AND a password has been set AND saved THEN the details should say 'Set'", async () => {
    let usersPage = new UsersPage();
    let userDetails = new UserDetails();
    let credentialsStepDialog = new UserEditorCredentialStepDialog();
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    // 1. Select the user created in the previous test.
    await usersPage.clickOnRowByDisplayName(USER_NAME);
    await userDetails.waitForTitle(USER_NAME);
    // 2. The Credentials section of the details: the password is 'Not set'.
    assert.equal(await userDetails.getPassword(), UserDetails.PASSWORD.NOT_SET);
    // 3. 'Edit credentials': the Credentials step opens in step view with 'Set password' and no input.
    await userDetails.clickOnEditCredentialsButton();
    await credentialsStepDialog.waitForLoaded();
    assert.equal(
      await credentialsStepDialog.getTitle(),
      USER_NAME,
      'The dialog is titled by the user',
    );
    assert.equal(await credentialsStepDialog.getStepTitle(), 'Credentials');
    assert.ok(await credentialsStepDialog.isStepView(), 'One step, no stepper dots');
    assert.equal(
      await credentialsStepDialog.getPasswordNotice(),
      UserEditorCredentialStepDialog.PASSWORD_NOTICE.OPTIONAL,
    );
    await credentialsStepDialog.waitForSetPasswordButtonDisplayed();
    assert.ok(
      !(await credentialsStepDialog.isPasswordInputDisplayed()),
      'The password input should not be displayed before Set password is clicked',
    );
    await credentialsStepDialog.waitForSaveButtonDisabled();
    // 4. 'Set password', then the password: Save is enabled.
    await credentialsStepDialog.setPassword(appConst.PASSWORD.MEDIUM);
    await credentialsStepDialog.waitForSaveButtonEnabled();
    // 5. Save: the dialog closes, the notification message reports the update, the details say 'Set'.
    await credentialsStepDialog.clickOnSaveButtonAndWaitForClosed();
    await usersPage.waitForExpectedNotificationMessage(appConst.userUpdatedMessage(USER_NAME));
    await userDetails.waitForPassword(UserDetails.PASSWORD.SET);
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
  // The user goes first: a provider that still holds one cannot be deleted. The user's key is the
  // one the editor gave it - 'user:<provider key>:<id>'.
  after(async () => {
    if (ID_PROVIDER !== undefined) {
      await settingsUtils
        .deletePrincipalsViaApi(`user:${ID_PROVIDER.key}:${USER.id}`)
        .catch((err) => {
          console.log('The user was not cleaned up: ' + err);
        });
      await settingsUtils.deleteIdProviderViaApi(ID_PROVIDER).catch((err) => {
        console.log('The ID provider was not cleaned up: ' + err);
      });
    }
  });
});
