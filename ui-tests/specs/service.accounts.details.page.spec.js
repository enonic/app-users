/**
 * Created on 08.10.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ServiceAccountsPage = require('../page_objects/service-accounts/service.accounts.page');
const ServiceAccountDetails = require('../page_objects/service-accounts/service.account.details');
const ServiceAccountEditorGeneralStepDialog = require('../page_objects/service-accounts/service-account-dialog/service.account.editor.general.step.dialog');
const ServiceAccountEditorRolesStepDialog = require('../page_objects/service-accounts/service-account-dialog/service.account.editor.roles.step.dialog');
const ServiceAccountEditorCredentialsStepDialog = require('../page_objects/service-accounts/service-account-dialog/service.account.editor.credentials.step.dialog');
const ServiceAccountEditorGroupsStepDialog = require('../page_objects/service-accounts/service-account-dialog/service.account.editor.groups.step.dialog');
const AddPublicKeyDialog = require('../page_objects/users/user-dialog/add.public.key.dialog');
const userItemsBuilder = require('../libs/users.items.builder');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');

describe("service.accounts.details.page.spec - the details panel of a service account: what it shows, and the editor each of its Edit buttons opens on the account's saved data", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  let GROUP;
  // What buildServiceAccount() answered for the account the first test creates: its `id` is the
  // login the server knows it by, which a display name is not.
  let SERVICE_ACCOUNT;
  const GROUP_NAME = userItemsBuilder.generateRandomName('group');
  const SERVICE_ACCOUNT_NAME = userItemsBuilder.generateRandomName('account');
  // Picked on the Roles step by their display names; both are system roles every instance has.
  const ACCOUNT_ROLES = [appConst.SYSTEM_ROLES.ADMIN_CONSOLE, appConst.SYSTEM_ROLES.USERS_APP];
  const GROUP_ROLES = [appConst.SYSTEM_ROLES.USERS_APP];
  // one key is generated in the wizard, the second through 'Edit credentials' later on.
  const KEY_LABEL = 'key from the wizard';
  const SECOND_KEY_LABEL = 'key added later';

  // A service account lives in the system ID provider, so the group it will join is made there -
  // the default of buildGroup.
  it('GIVEN the suite starts THEN a group in the system ID provider should be created via the API', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    GROUP = userItemsBuilder.buildGroup({
      idProvider: userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME,
      displayName: GROUP_NAME,
      roles: GROUP_ROLES,
    });
    await settingsUtils.createGroupViaApi(GROUP);
  });

  it('WHEN a new service account with two roles and a public key has been created in the editor AND selected THEN the details should show the roles and the key', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    SERVICE_ACCOUNT = userItemsBuilder.buildServiceAccount({
      displayName: SERVICE_ACCOUNT_NAME,
      email: userItemsBuilder.generateEmail(SERVICE_ACCOUNT_NAME),
      roles: ACCOUNT_ROLES,
      publicKeys: [KEY_LABEL],
    });
    // 1. Create a new service account in the editor (not via the API): the roles are picked on the
    //    Roles step, the key generated in the 'New public key' dialog of the Credentials step.
    await settingsUtils.createServiceAccount(SERVICE_ACCOUNT);
    let serviceAccountsPage = new ServiceAccountsPage();
    let serviceAccountDetails = new ServiceAccountDetails();
    // 2. Select the new service account
    await serviceAccountsPage.clickOnRowByDisplayName(SERVICE_ACCOUNT.displayName);
    // 3. Verify that the details panel lists the two roles.
    await serviceAccountDetails.waitForTitle(SERVICE_ACCOUNT.displayName);
    assert.equal(await serviceAccountDetails.getRolesCount(), ACCOUNT_ROLES.length);
    let roles = await serviceAccountDetails.getRoles();
    for (const role of ACCOUNT_ROLES) {
      assert.ok(roles.includes(role), `The role '${role}' should be listed in the details`);
    }
    // 4. The 'Service account' section shows the email typed in the editor (Type 'System' is shown
    //    for the built-in accounts su and anonymous only).
    assert.equal(await serviceAccountDetails.getEmail(), SERVICE_ACCOUNT.email);
    // 5. The key generated in the wizard was written with the account: one row under 'Public keys',
    //    with the label it was given and the kid the server stored it under.
    assert.equal(await serviceAccountDetails.getPublicKeysCount(), 1);
    let [publicKey] = await serviceAccountDetails.getPublicKeys();
    assert.equal(publicKey.title, KEY_LABEL);
    assert.ok(publicKey.subtitle.length > 0, 'The key should show the kid it was stored under');
  });

  // Edit in a section of the details opens the editor on that step alone (step view): the title is
  // the account, the footer has Cancel and Save, Save stays disabled until something changes.
  it("GIVEN the new service account is selected WHEN 'Edit' in the details has been clicked THEN the General step should open with the saved data AND WHEN 'Edit roles' has been clicked THEN the Roles step should list the roles", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let serviceAccountsPage = new ServiceAccountsPage();
    let serviceAccountDetails = new ServiceAccountDetails();
    let generalStep = new ServiceAccountEditorGeneralStepDialog();
    let rolesStep = new ServiceAccountEditorRolesStepDialog();
    await serviceAccountsPage.clickOnRowByDisplayName(SERVICE_ACCOUNT_NAME);
    await serviceAccountDetails.waitForTitle(SERVICE_ACCOUNT_NAME);
    // 1. 'Edit' of the 'Service account' section: the General step opens in step view.
    await serviceAccountDetails.clickOnEditButton();
    await generalStep.waitForLoaded();
    // 2. Verify the account's name in the title:
    assert.equal(
      await generalStep.getTitle(),
      SERVICE_ACCOUNT_NAME,
      'The dialog is titled by the service account',
    );
    assert.equal(await generalStep.getStepTitle(), 'General');
    assert.ok(await generalStep.isStepView(), 'One step, no stepper dots');
    // 3. The fields hold the saved data. A service account lives in the system ID provider, so the
    //    step shows no ID provider at all.
    assert.ok(
      !(await generalStep.isIdProviderInputDisplayed()),
      'A service account has no ID provider field',
    );
    assert.equal(await generalStep.getTextInDisplayNameInput(), SERVICE_ACCOUNT_NAME);
    assert.equal(await generalStep.getTextInIdInput(), SERVICE_ACCOUNT_NAME);
    assert.equal(
      await generalStep.getTextInEmailInput(),
      userItemsBuilder.generateEmail(SERVICE_ACCOUNT_NAME),
    );
    // 4. The ID input is disabled: the ID cannot be changed.
    assert.ok(!(await generalStep.isIdInputEnabled()), 'The ID input should be disabled');
    // 5. Nothing changed: Save is disabled, Cancel closes the dialog.
    await generalStep.waitForSaveButtonDisabled();
    await generalStep.clickOnCancelButtonAndWaitForClosed();
    // 6. 'Edit roles' of the Roles section: the Roles step opens with the two roles picked.
    await serviceAccountDetails.clickOnEditRolesButton();
    await rolesStep.waitForLoaded();
    // 7. Expected roles should be displayed in the Roles step of the editor.
    assert.equal(await rolesStep.getStepTitle(), 'Roles');
    let roles = await rolesStep.getSelectedRoles();
    for (const role of ACCOUNT_ROLES) {
      assert.ok(roles.includes(role), `The role '${role}' should be picked in the editor`);
    }
    // 8. Nothing changed: Save is disabled, Cancel closes the dialog.
    await rolesStep.waitForSaveButtonDisabled();
    await rolesStep.clickOnCancelButtonAndWaitForClosed();
  });

  // The account was created with a password (buildServiceAccount gives one). Clearing it is staged
  // on the Credentials step and only Save makes it so: Cancel, once confirmed, leaves the password
  // alone.
  it("GIVEN the service account has a password WHEN 'Edit credentials' in the details has been clicked THEN the Credentials step should open AND WHEN 'Clear password' has been clicked THEN the clearing should be staged AND WHEN Cancel is confirmed THEN every dialog should close AND the password should stay set", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let serviceAccountsPage = new ServiceAccountsPage();
    let serviceAccountDetails = new ServiceAccountDetails();
    let credentialsStep = new ServiceAccountEditorCredentialsStepDialog();
    let confirmationDialog = new ConfirmationDialog(
      appConst.SECTION_ID.SERVICE_ACCOUNTS,
      ConfirmationDialog.KIND.CONFIRM,
    );
    await serviceAccountsPage.clickOnRowByDisplayName(SERVICE_ACCOUNT_NAME);
    await serviceAccountDetails.waitForTitle(SERVICE_ACCOUNT_NAME);
    // 1. The details say the password is set.
    assert.equal(await serviceAccountDetails.getPassword(), ServiceAccountDetails.PASSWORD.SET);
    // 2. 'Edit credentials': the Credentials step opens in step view, titled by the account.
    await serviceAccountDetails.clickOnEditCredentialsButton();
    await credentialsStep.waitForLoaded();
    assert.equal(
      await credentialsStep.getTitle(),
      SERVICE_ACCOUNT_NAME,
      'The dialog is titled by the service account',
    );
    assert.equal(await credentialsStep.getStepTitle(), 'Credentials');
    assert.ok(await credentialsStep.isStepView(), 'One step, no stepper dots');
    // 3. A set password: 'Password already set', Change and Clear beside it, Save disabled.
    assert.equal(
      await credentialsStep.getPasswordNotice(),
      ServiceAccountEditorCredentialsStepDialog.PASSWORD_NOTICE.ALREADY_SET,
    );
    assert.ok(
      await credentialsStep.isChangePasswordButtonDisplayed(),
      "'Change password' is shown",
    );
    assert.ok(await credentialsStep.isClearPasswordButtonDisplayed(), "'Clear password' is shown");
    await credentialsStep.waitForSaveButtonDisabled();
    // 4. Click on 'Clear password': the notice says so, 'Keep it' undoes it, Save is enabled.
    await credentialsStep.clickOnClearPasswordButton();
    await credentialsStep.waitForPasswordNotice(
      ServiceAccountEditorCredentialsStepDialog.PASSWORD_NOTICE.WILL_CLEAR,
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
    await serviceAccountDetails.waitForPassword(ServiceAccountDetails.PASSWORD.SET);
  });

  // The same clearing, undone inside the dialog: 'Keep it' takes the step back to what it opened
  // with, so Cancel closes it outright - nothing is dirty, nothing to confirm.
  it("GIVEN 'Clear password' has been clicked on the Credentials step WHEN 'Keep it' has been clicked THEN the step should be back to its initial state AND Cancel should close the dialog without a confirmation", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let serviceAccountsPage = new ServiceAccountsPage();
    let serviceAccountDetails = new ServiceAccountDetails();
    let credentialsStep = new ServiceAccountEditorCredentialsStepDialog();
    let confirmationDialog = new ConfirmationDialog(
      appConst.SECTION_ID.SERVICE_ACCOUNTS,
      ConfirmationDialog.KIND.CONFIRM,
    );
    await serviceAccountsPage.clickOnRowByDisplayName(SERVICE_ACCOUNT_NAME);
    await serviceAccountDetails.waitForTitle(SERVICE_ACCOUNT_NAME);
    // 1. Click on 'Edit credentials', then 'Clear password'.
    await serviceAccountDetails.clickOnEditCredentialsButton();
    await credentialsStep.waitForLoaded();
    await credentialsStep.clickOnClearPasswordButton();
    await credentialsStep.waitForPasswordNotice(
      ServiceAccountEditorCredentialsStepDialog.PASSWORD_NOTICE.WILL_CLEAR,
    );
    await credentialsStep.waitForSaveButtonEnabled();
    // 2. 'Keep it': the step is as it opened - 'Password already set', Change and Clear are back,
    //    'Keep it' is gone, Save is disabled again.
    await credentialsStep.clickOnKeepPasswordButton();
    await credentialsStep.waitForPasswordNotice(
      ServiceAccountEditorCredentialsStepDialog.PASSWORD_NOTICE.ALREADY_SET,
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
    await serviceAccountDetails.waitForPassword(ServiceAccountDetails.PASSWORD.SET);
  });

  // A generated pair is made in the browser and its private half never reaches the server: it is
  // handed over as a file download the moment the save lands, which is why a key can only be added
  // through the editor. The download needs no save dialog answered - wdio.chrome.conf.js points
  // Chrome at a directory of its own - and the test does not depend on the file landing either,
  // since the notification message is what reports it.
  it("GIVEN the service account has one public key WHEN 'Edit credentials' has been clicked AND a second key has been generated THEN it should be staged until the save AND WHEN saved THEN the details should list both keys", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let serviceAccountsPage = new ServiceAccountsPage();
    let serviceAccountDetails = new ServiceAccountDetails();
    let credentialsStep = new ServiceAccountEditorCredentialsStepDialog();
    let addPublicKeyDialog = new AddPublicKeyDialog(appConst.SECTION_ID.SERVICE_ACCOUNTS);
    await serviceAccountsPage.clickOnRowByDisplayName(SERVICE_ACCOUNT_NAME);
    await serviceAccountDetails.waitForTitle(SERVICE_ACCOUNT_NAME);
    assert.equal(await serviceAccountDetails.getPublicKeysCount(), 1);
    // 1. 'Edit credentials': the step lists the key the account was created with, by its kid.
    await serviceAccountDetails.clickOnEditCredentialsButton();
    await credentialsStep.waitForLoaded();
    // The stored keys arrive with a read of their own, which the step does not wait for.
    await credentialsStep.waitForPublicKeyDisplayed(KEY_LABEL);
    assert.deepEqual(await credentialsStep.getPublicKeyLabels(), [KEY_LABEL]);
    assert.ok(
      !(await credentialsStep.isPublicKeyPending(KEY_LABEL)),
      'A stored key shows its kid, not the pending line',
    );
    await credentialsStep.waitForSaveButtonDisabled();
    // 2. 'Add': the 'New public key' dialog opens, Generate held back until a label is typed.
    await credentialsStep.clickOnAddPublicKeyButton();
    await addPublicKeyDialog.waitForLoaded();
    assert.equal(await addPublicKeyDialog.getTitle(), 'New public key');
    await addPublicKeyDialog.waitForGenerateButtonDisabled();
    // 3. Type the label, then Generate: the pair is made in the browser and the dialog closes.
    await addPublicKeyDialog.typeInLabelInput(SECOND_KEY_LABEL);
    await addPublicKeyDialog.waitForGenerateButtonEnabled();
    await addPublicKeyDialog.clickOnGenerateButton();
    await addPublicKeyDialog.waitForClosed();
    // 4. The new key is staged, not stored: it says so in place of a kid, and Save is enabled.
    await credentialsStep.waitForPublicKeyDisplayed(SECOND_KEY_LABEL);
    assert.ok(
      await credentialsStep.isPublicKeyPending(SECOND_KEY_LABEL),
      'A generated key is only written when the step is saved',
    );
    await credentialsStep.waitForSaveButtonEnabled();
    // 5. Save: the key is written against the saved account, so its private half is downloaded
    //    first - named after the login and the kid - and the update is reported after it. That extra
    //    write happens before the dialog closes, which is why the close is given the longer wait.
    await credentialsStep.clickOnSaveButtonAndWaitForClosed(appConst.TIMEOUT.LONG);
    await serviceAccountsPage.waitForExpectedNotificationMessage(
      `The private key was downloaded as ${SERVICE_ACCOUNT.id}-`,
    );
    await serviceAccountsPage.waitForExpectedNotificationMessage(
      appConst.serviceAccountUpdatedMessage(SERVICE_ACCOUNT_NAME),
    );
    // 6. The details list both keys, each with the kid it was stored under.
    await serviceAccountDetails.waitForPublicKey(SECOND_KEY_LABEL);
    assert.equal(await serviceAccountDetails.getPublicKeysCount(), 2);
    let labels = await serviceAccountDetails.getPublicKeyLabels();
    for (const label of [KEY_LABEL, SECOND_KEY_LABEL]) {
      assert.ok(labels.includes(label), `The key '${label}' should be listed in the details`);
    }
    for (const { title, subtitle } of await serviceAccountDetails.getPublicKeys()) {
      assert.ok(subtitle.length > 0, `The key '${title}' should show its kid`);
    }
  });

  // The group was made via the API in the first test, in the system ID provider like the account,
  // so the picker offers it without 'Show groups from all ID providers'.
  it("GIVEN the service account has no group WHEN 'Edit groups' in the details has been clicked AND the group has been picked by filtering AND applied AND saved THEN the details should list the group", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let serviceAccountsPage = new ServiceAccountsPage();
    let serviceAccountDetails = new ServiceAccountDetails();
    let groupsStep = new ServiceAccountEditorGroupsStepDialog();
    await serviceAccountsPage.clickOnRowByDisplayName(SERVICE_ACCOUNT_NAME);
    await serviceAccountDetails.waitForTitle(SERVICE_ACCOUNT_NAME);
    // 1. The details list no group yet.
    assert.equal(
      await serviceAccountDetails.getGroupsCount(),
      0,
      'The account starts without groups',
    );
    // 2. 'Edit groups': the Groups step opens in step view with nothing picked.
    await serviceAccountDetails.clickOnEditGroupsButton();
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
    // 4. Tick the option, then Apply: the group is listed under the input with the key of its ID
    //    provider ('system') beside it, Save is enabled.
    await groupsStep.clickOnGroupOption(GROUP_NAME);
    assert.ok(await groupsStep.combobox.isOptionChecked(GROUP_NAME), 'The option should be ticked');
    await groupsStep.clickOnApplyButton();
    await groupsStep.waitForGroupSelected(GROUP_NAME);
    assert.equal(
      await groupsStep.getSelectedGroupIdProvider(GROUP_NAME),
      userItemsBuilder.SYSTEM_ID_PROVIDER,
      'The picked group should show the key of the system ID provider',
    );
    await groupsStep.waitForSaveButtonEnabled();
    // 5. Save: the dialog closes, the notification message reports the update.
    await groupsStep.clickOnSaveButtonAndWaitForClosed();
    await serviceAccountsPage.waitForExpectedNotificationMessage(
      appConst.serviceAccountUpdatedMessage(SERVICE_ACCOUNT_NAME),
    );
    // 6. The details list the group, with the key of the system ID provider on the right.
    await serviceAccountDetails.waitForGroup(GROUP_NAME);
    assert.equal(await serviceAccountDetails.getGroupsCount(), 1);
    let [group] = await serviceAccountDetails.getGroupItems();
    assert.equal(group.title, GROUP_NAME);
    assert.equal(
      group.meta,
      userItemsBuilder.SYSTEM_ID_PROVIDER,
      'The group should show the key of the system ID provider',
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
});
