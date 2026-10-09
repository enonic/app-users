/**
 * Created on 08.10.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const UsersPage = require('../page_objects/users/users.page');
const UserDetails = require('../page_objects/users/user.details');
const UserEditorGeneralStepDialog = require('../page_objects/users/user-dialog/user.editor.general.step.dialog');
const UserEditorRolesStepDialog = require('../page_objects/users/user-dialog/user.editor.roles.step.dialog');
const UserEditorCredentialsStepDialog = require('../page_objects/users/user-dialog/user.editor.credentials.step.dialog');
const UserEditorGroupsStepDialog = require('../page_objects/users/user-dialog/user.editor.groups.step.dialog');
const userItemsBuilder = require('../libs/users.items.builder');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');

describe("user.details.panel.spec - the details panel of a user: what it shows, and the editor each of its Edit buttons opens on the user's saved data", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  let ID_PROVIDER;
  let GROUP;
  const GROUP_NAME = userItemsBuilder.generateRandomName('group');
  const PROVIDER_NAME = userItemsBuilder.generateRandomName('provider');
  let USER_NAME = userItemsBuilder.generateRandomName('user');
  // Picked on the Roles step by their display names; both are system roles every instance has.
  const USER_ROLES = [appConst.SYSTEM_ROLES.ADMIN_CONSOLE, appConst.SYSTEM_ROLES.USERS_APP];
  const GROUP_ROLES = [appConst.SYSTEM_ROLES.USERS_APP];

  it('GIVEN the suite starts THEN an ID provider for its users should be created via the API', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    ID_PROVIDER = userItemsBuilder.buildIdProvider({
      displayName: PROVIDER_NAME,
      description: 'description',
      application: 'Standard ID Provider',
    });
    // 1. Create a new ID provider via the API - the users of this suite live in it.
    await settingsUtils.createIdProviderViaApi(ID_PROVIDER);

    GROUP = userItemsBuilder.buildGroup({
      idProvider: PROVIDER_NAME,
      displayName: GROUP_NAME,
      roles: GROUP_ROLES,
    });
    await settingsUtils.createGroupViaApi(GROUP);
  });

  it('WHEN a new user with two roles has been created in the editor AND selected THEN the details should show the roles', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let user = userItemsBuilder.buildUser({
      displayName: USER_NAME,
      idProvider: ID_PROVIDER.displayName,
      email: userItemsBuilder.generateEmail(USER_NAME),
      roles: USER_ROLES,
    });
    // 1. Create a new user in the editor (not via the API): the roles are picked on the Roles step.
    await settingsUtils.createUser(user);
    let usersPage = new UsersPage();
    let userDetails = new UserDetails();
    // 2. Select the new user
    await usersPage.clickOnRowByDisplayName(user.displayName);
    // 3. Verify that the details panel lists the two roles..
    await userDetails.waitForTitle(user.displayName);
    assert.equal(await userDetails.getRolesCount(), USER_ROLES.length);
    let roles = await userDetails.getRoles();
    for (const role of USER_ROLES) {
      assert.ok(roles.includes(role), `The role '${role}' should be listed in the details`);
    }
  });

  // Edit in a section of the details opens the editor on that step alone (step view): the title is
  // the user, the footer has Cancel and Save, Save stays disabled until something changes.
  it("GIVEN the new user is selected WHEN 'Edit' in the details has been clicked THEN the General step should open with the saved data AND WHEN 'Edit roles' has been clicked THEN the Roles step should list the roles", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let userDetails = new UserDetails();
    let generalStep = new UserEditorGeneralStepDialog();
    let rolesStep = new UserEditorRolesStepDialog();
    await usersPage.clickOnRowByDisplayName(USER_NAME);
    await userDetails.waitForTitle(USER_NAME);
    // 1. 'Edit' of the User section: the General step opens in step view.
    await userDetails.clickOnEditButton();
    await generalStep.waitForLoaded();
    // 2. Verify the userName in the section:
    assert.equal(await generalStep.getTitle(), USER_NAME, 'The dialog is titled by the user');
    assert.equal(await generalStep.getStepTitle(), 'General');
    assert.ok(await generalStep.isStepView(), 'One step, no stepper dots');
    // 3. The fields hold the saved data; the ID provider and the ID cannot be changed.
    assert.equal(await generalStep.getIdProvider(), ID_PROVIDER.displayName);
    assert.equal(await generalStep.getTextInDisplayNameInput(), USER_NAME);
    assert.equal(await generalStep.getTextInIdInput(), USER_NAME);
    assert.equal(
      await generalStep.getTextInEmailInput(),
      userItemsBuilder.generateEmail(USER_NAME),
    );
    // 4. The ID input is disabled, the ID provider cannot be changed.
    assert.ok(!(await generalStep.isIdInputEnabled()), 'The ID input should be disabled');
    // 5. Nothing changed: Save is disabled, Cancel closes the dialog.
    await generalStep.waitForSaveButtonDisabled();
    // close the modal dialog:
    await generalStep.clickOnCancelButtonAndWaitForClosed();
    // 6. 'Edit roles' of the Roles section: the Roles step opens with the two roles picked.
    await userDetails.clickOnEditRolesButton();
    await rolesStep.waitForLoaded();
    // 7. Expected roles should be displayed in the Roles step of the editor.
    assert.equal(await rolesStep.getStepTitle(), 'Roles');
    let roles = await rolesStep.getSelectedRoles();
    for (const role of USER_ROLES) {
      assert.ok(roles.includes(role), `The role '${role}' should be picked in the editor`);
    }
    // 8. Nothing changed: Save is disabled, Cancel closes the dialog.
    await rolesStep.waitForSaveButtonDisabled();
    await rolesStep.clickOnCancelButtonAndWaitForClosed();
  });

  // The user was created with a password (buildUser gives one). Clearing it is staged on the
  // Credentials step and only Save makes it so: Cancel, once confirmed, leaves the password alone.
  it("GIVEN the user has a password WHEN 'Edit credentials' in the details has been clicked THEN the Credentials step should open AND WHEN 'Clear password' has been clicked THEN the clearing should be staged AND WHEN Cancel is confirmed THEN every dialog should close AND the password should stay set", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let userDetails = new UserDetails();
    let credentialsStep = new UserEditorCredentialsStepDialog();
    let confirmationDialog = new ConfirmationDialog(
      appConst.SECTION_ID.USERS,
      ConfirmationDialog.KIND.CONFIRM,
    );
    await usersPage.clickOnRowByDisplayName(USER_NAME);
    await userDetails.waitForTitle(USER_NAME);
    // 1. The details say the password is set.
    assert.equal(await userDetails.getPassword(), UserDetails.PASSWORD.SET);
    // 2. 'Edit credentials': the Credentials step opens in step view, titled by the user.
    await userDetails.clickOnEditCredentialsButton();
    await credentialsStep.waitForLoaded();
    assert.equal(await credentialsStep.getTitle(), USER_NAME, 'The dialog is titled by the user');
    assert.equal(await credentialsStep.getStepTitle(), 'Credentials');
    assert.ok(await credentialsStep.isStepView(), 'One step, no stepper dots');
    // 3. A set password: 'Password already set', Change and Clear beside it, Save disabled.
    assert.equal(
      await credentialsStep.getPasswordNotice(),
      UserEditorCredentialsStepDialog.PASSWORD_NOTICE.ALREADY_SET,
    );
    assert.ok(
      await credentialsStep.isChangePasswordButtonDisplayed(),
      "'Change password' is shown",
    );
    assert.ok(await credentialsStep.isClearPasswordButtonDisplayed(), "'Clear password' is shown");
    await credentialsStep.waitForSaveButtonDisabled();
    // 4. Click on 'Clear password':  the notice says so, 'Keep it' undoes it, Save is enabled.
    await credentialsStep.clickOnClearPasswordButton();
    await credentialsStep.waitForPasswordNotice(
      UserEditorCredentialsStepDialog.PASSWORD_NOTICE.WILL_CLEAR,
    );
    await credentialsStep.waitForKeepPasswordButtonDisplayed();
    assert.ok(
      !(await credentialsStep.isClearPasswordButtonDisplayed()),
      "'Clear password' is gone",
    );
    await credentialsStep.waitForSaveButtonEnabled();
    // 5. Click on Cancel: the step is dirty, so the close is asked to be confirmed.
    await credentialsStep.clickOnCancelButton();
    await confirmationDialog.waitForDialogOpened();
    assert.equal(
      await confirmationDialog.getQuestion(),
      'Do you want to close the dialog? Changes will be lost.',
    );
    await confirmationDialog.confirm();
    // 6. Both dialogs are gone and the password is still set.
    await credentialsStep.waitForClosed();
    assert.ok(!(await confirmationDialog.isDialogDisplayed()), 'The confirmation is closed');
    assert.ok(!(await credentialsStep.isDialogDisplayed()), 'The editor is closed');
    // 7. Verify that 'Set' is still shown in the details.
    await userDetails.waitForPassword(UserDetails.PASSWORD.SET);
  });

  // The same clearing, undone inside the dialog: 'Keep it' takes the step back to what it opened
  // with, so Cancel closes it outright - nothing is dirty, nothing to confirm.
  it("GIVEN 'Clear password' has been clicked on the Credentials step WHEN 'Keep it' has been clicked THEN the step should be back to its initial state AND Cancel should close the dialog without a confirmation", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let userDetails = new UserDetails();
    let credentialsStep = new UserEditorCredentialsStepDialog();
    let confirmationDialog = new ConfirmationDialog(
      appConst.SECTION_ID.USERS,
      ConfirmationDialog.KIND.CONFIRM,
    );
    await usersPage.clickOnRowByDisplayName(USER_NAME);
    await userDetails.waitForTitle(USER_NAME);
    // 1. Click on 'Edit credentials', then 'Clear password'.
    await userDetails.clickOnEditCredentialsButton();
    await credentialsStep.waitForLoaded();
    await credentialsStep.clickOnClearPasswordButton();
    await credentialsStep.waitForPasswordNotice(
      UserEditorCredentialsStepDialog.PASSWORD_NOTICE.WILL_CLEAR,
    );
    await credentialsStep.waitForSaveButtonEnabled();
    // 2. 'Keep it': the step is as it opened - 'Password already set', Change and Clear are back,
    //    'Keep it' is gone, Save is disabled again.
    await credentialsStep.clickOnKeepPasswordButton();
    await credentialsStep.waitForPasswordNotice(
      UserEditorCredentialsStepDialog.PASSWORD_NOTICE.ALREADY_SET,
    );
    assert.ok(await credentialsStep.isChangePasswordButtonDisplayed(), "'Change password' is back");
    assert.ok(await credentialsStep.isClearPasswordButtonDisplayed(), "'Clear password' is back");
    assert.ok(!(await credentialsStep.isKeepPasswordButtonDisplayed()), "'Keep it' is gone");
    await credentialsStep.waitForSaveButtonDisabled();
    // 3. Cancel: nothing changed, so the dialog closes without asking.
    await credentialsStep.clickOnCancelButton();
    await credentialsStep.waitForClosed();
    assert.ok(!(await confirmationDialog.isDialogDisplayed()), 'No confirmation should be asked');
    // 4. The details still say the password is set.
    await userDetails.waitForPassword(UserDetails.PASSWORD.SET);
  });

  // The group was made via the API in the first test, in the same ID provider as the user, so the
  // picker offers it without 'Show groups from all ID providers'.
  it("GIVEN the user has no group WHEN 'Edit groups' in the details has been clicked AND the group has been picked by filtering AND applied AND saved THEN the details should list the group", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let userDetails = new UserDetails();
    let groupsStep = new UserEditorGroupsStepDialog();
    await usersPage.clickOnRowByDisplayName(USER_NAME);
    await userDetails.waitForTitle(USER_NAME);
    // 1. The details list no group yet.
    assert.equal(await userDetails.getGroupsCount(), 0, 'The user starts without groups');
    // 2. 'Edit groups': the Groups step opens in step view with nothing picked.
    await userDetails.clickOnEditGroupsButton();
    await groupsStep.waitForLoaded();
    assert.equal(await groupsStep.getStepTitle(), 'Groups');
    assert.ok(await groupsStep.isStepView(), 'One step, no stepper dots');
    assert.deepEqual(await groupsStep.getSelectedGroups(), [], 'No group should be picked yet');
    // 3. Filter by the group's name: the popup narrows to it.
    await groupsStep.typeInGroupsFilterInput(GROUP_NAME);
    assert.deepEqual(
      await groupsStep.getGroupOptions(),
      [GROUP_NAME],
      'The filter should leave the group alone',
    );
    // 4. Tick the option, then Apply: the group is listed under the input, Save is enabled.
    await groupsStep.clickOnGroupOption(GROUP_NAME);
    assert.ok(await groupsStep.combobox.isOptionChecked(GROUP_NAME), 'The option should be ticked');
    await groupsStep.clickOnApplyButton();
    await groupsStep.waitForGroupSelected(GROUP_NAME);
    // The row shows the provider's key; the key of the provider made here is its display name.
    assert.equal(
      await groupsStep.getSelectedGroupIdProvider(GROUP_NAME),
      PROVIDER_NAME,
      'The picked group should show the key of its ID provider',
    );
    await groupsStep.waitForSaveButtonEnabled();
    // 5. Save: the dialog closes, the toast reports the update.
    await groupsStep.clickOnSaveButtonAndWaitForClosed();
    await usersPage.waitForExpectedNotificationMessage(appConst.userUpdatedMessage(USER_NAME));
    // 6. The details list the group, with its ID provider on the right.
    await userDetails.waitForGroup(GROUP_NAME);
    assert.equal(await userDetails.getGroupsCount(), 1);
    let [group] = await userDetails.getGroupItems();
    assert.equal(group.title, GROUP_NAME);
    assert.equal(group.meta, PROVIDER_NAME, 'The group should show the key of its ID provider');
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
