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
const UserEditorCredentialStepDialog = require('../../page_objects/users/user-dialog/user.editor.credentials.step.dialog');
const UserEditorRolesStepDialog = require('../../page_objects/users/user-dialog/user.editor.roles.step.dialog');
const ConfirmationDialog = require('../../page_objects/confirmation.dialog');
const userItemsBuilder = require('../../libs/users.items.builder');

describe("user.editor.credential.step.spec - the user editor's Credentials step: a password is typed after 'Set password', rated by the strength meter, and kept across a step back", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  const PROVIDER_NAME = userItemsBuilder.generateRandomName('provider');
  const USER_NAME = userItemsBuilder.generateRandomName('user');
  // What createIdProviderViaApi() returns, with the key the delete at the end needs.
  let ID_PROVIDER;

  // The ID provider and General steps come before Credentials: a provider to pick on the first, and
  // the display name the second requires.
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

  // 'Set password' opens an empty input, which the step rejects until something is typed; a password
  // the meter rates 'Medium' is accepted. The password is part of the form, not of the step, so a
  // step back and forth keeps it.
  it("GIVEN the Credentials step is opened WHEN 'Set password' has been clicked AND a medium password has been typed THEN Next should be enabled AND the meter should read 'Medium' AND WHEN Previous then Next have been clicked THEN the password should still be there", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let idProviderStep = new UserEditorIdProviderStepDialog();
    let generalStep = new UserEditorGeneralStepDialog();
    let credentialsStep = new UserEditorCredentialStepDialog();
    let user = userItemsBuilder.buildUser({
      displayName: USER_NAME,
      idProvider: PROVIDER_NAME,
      email: userItemsBuilder.generateEmail(USER_NAME),
    });
    // 1. Open the editor and get to Credentials: the provider is picked, the display name and the
    //    email typed.
    await usersPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    await idProviderStep.doFilterAndSelectIdProviderByDisplayName(PROVIDER_NAME);
    await idProviderStep.clickOnNextAndWaitForGeneralStep();
    await generalStep.typeDataAndClickOnNext(user);
    await credentialsStep.waitForLoaded();
    assert.equal(await credentialsStep.getStepTitle(), 'Credentials');
    // 2. 'Set password': the input appears, empty - the step wants a password now, Next is disabled.
    await credentialsStep.clickOnSetPasswordButton();
    await credentialsStep.waitForPasswordInputDisplayed();
    await credentialsStep.waitForNextButtonDisabled();
    // 3. A medium password: the meter rates it 'Medium', Next is enabled.
    await credentialsStep.typeInPasswordInput(appConst.PASSWORD.MEDIUM);
    await credentialsStep.waitForNextButtonEnabled();
    assert.equal(await credentialsStep.getPasswordStrengthLabel(), 'Medium');
    assert.deepEqual(
      await credentialsStep.getValidationMessages(),
      [],
      'No validation message should be shown for a medium password',
    );
    // 4. Previous: General, with what was typed there.
    await credentialsStep.clickOnPreviousButton();
    await generalStep.waitForLoaded();
    assert.equal(await generalStep.getTextInDisplayNameInput(), USER_NAME);
    // 5. Next: Credentials again - the input is still shown with the password, the meter still reads
    //    'Medium', Next is still enabled.
    await generalStep.clickOnNextButton();
    await credentialsStep.waitForLoaded();
    await credentialsStep.waitForPasswordInputDisplayed();
    assert.equal(
      await credentialsStep.getTextInPasswordInput(),
      appConst.PASSWORD.MEDIUM,
      'The password should survive the step back',
    );
    assert.equal(await credentialsStep.getPasswordStrengthLabel(), 'Medium');
    assert.ok(
      !(await credentialsStep.isSetPasswordButtonDisplayed()),
      "'Set password' should not be back while a password is typed",
    );
    await credentialsStep.waitForNextButtonEnabled();
    // 6. And on to Roles: the password holds the step no more.
    await credentialsStep.clickOnNextButton();
    await new UserEditorRolesStepDialog().waitForLoaded();
  });

  // 'Discard this password' (the X beside Generate) drops the typed password: the step is back to
  // where it opened, with 'Set password' and no input. A password is optional, so the step lets Next
  // through again - it is only an opened, empty or too weak input that holds it.
  it("GIVEN a medium password has been typed on the Credentials step WHEN 'Discard this password' has been clicked THEN 'Set password' should be back AND the input gone AND Next enabled, as with no password at all", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let idProviderStep = new UserEditorIdProviderStepDialog();
    let generalStep = new UserEditorGeneralStepDialog();
    let credentialsStep = new UserEditorCredentialStepDialog();
    let user = userItemsBuilder.buildUser({
      displayName: USER_NAME,
      idProvider: PROVIDER_NAME,
      email: userItemsBuilder.generateEmail(USER_NAME),
    });
    // 1. Open the editor and get to Credentials.
    await usersPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    await idProviderStep.doFilterAndSelectIdProviderByDisplayName(PROVIDER_NAME);
    await idProviderStep.clickOnNextAndWaitForGeneralStep();
    await generalStep.typeDataAndClickOnNext(user);
    await credentialsStep.waitForLoaded();
    // 2. 'Set password', then a medium password: the input and the meter are shown, Next is enabled.
    await credentialsStep.setPassword(appConst.PASSWORD.MEDIUM);
    await credentialsStep.waitForNextButtonEnabled();
    assert.equal(await credentialsStep.getPasswordStrengthLabel(), 'Medium');
    assert.ok(
      await credentialsStep.isDiscardPasswordButtonDisplayed(),
      "'Discard this password' should be shown beside the input",
    );
    // 3. Discard: the input and the meter go away, 'Set password' is back with the optional notice.
    await credentialsStep.clickOnDiscardPasswordButton();
    await credentialsStep.waitForPasswordInputNotDisplayed();
    await credentialsStep.waitForSetPasswordButtonDisplayed();
    assert.ok(
      !(await credentialsStep.isPasswordStrengthMeterDisplayed()),
      'The strength meter should be gone with the input',
    );
    assert.equal(
      await credentialsStep.getPasswordNotice(),
      UserEditorCredentialStepDialog.PASSWORD_NOTICE.OPTIONAL,
    );
    // 4. No password is a valid answer, so Next is enabled - the same as before 'Set password'.
    await credentialsStep.waitForNextButtonEnabled();
    assert.deepEqual(
      await credentialsStep.getValidationMessages(),
      [],
      'No validation message should be shown after the discard',
    );
  });

  // Generate fills the input with a random password of 15 characters that the meter accepts, so it
  // reads 'Medium' or 'Strong', never below. The input hides it until Show is clicked.
  it("GIVEN 'Set password' has been clicked on the Credentials step WHEN Generate has been clicked THEN the meter should accept the password AND Next should be enabled AND WHEN Show has been clicked THEN the password should be readable in the input", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let idProviderStep = new UserEditorIdProviderStepDialog();
    let generalStep = new UserEditorGeneralStepDialog();
    let credentialsStep = new UserEditorCredentialStepDialog();
    let user = userItemsBuilder.buildUser({
      displayName: USER_NAME,
      idProvider: PROVIDER_NAME,
      email: userItemsBuilder.generateEmail(USER_NAME),
    });
    // 1. Open the editor and get to Credentials.
    await usersPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    await idProviderStep.doFilterAndSelectIdProviderByDisplayName(PROVIDER_NAME);
    await idProviderStep.clickOnNextAndWaitForGeneralStep();
    await generalStep.typeDataAndClickOnNext(user);
    await credentialsStep.waitForLoaded();
    // 2. 'Set password': the empty input holds the step.
    await credentialsStep.clickOnSetPasswordButton();
    await credentialsStep.waitForNextButtonDisabled();
    // 3. Generate: the meter rates the password as accepted, Next is enabled.
    await credentialsStep.clickOnGeneratePasswordButton();
    await credentialsStep.waitForNextButtonEnabled();
    let strength = await credentialsStep.getPasswordStrengthLabel();
    assert.ok(
      ['Medium', 'Strong'].includes(strength),
      `A generated password should be rated Medium or Strong, got '${strength}'`,
    );
    assert.deepEqual(
      await credentialsStep.getValidationMessages(),
      [],
      'No validation message should be shown for a generated password',
    );
    // 4. The input hides the password: its type is 'password', the eye reads 'Show'.
    assert.equal(await credentialsStep.getPasswordInputType(), 'password');
    assert.ok(await credentialsStep.isShowPasswordButtonDisplayed(), "'Show' should be offered");
    // 5. Show: the input turns to plain text and holds the 15 generated characters; the eye now
    //    reads 'Hide'.
    await credentialsStep.clickOnShowPasswordButton();
    assert.equal(await credentialsStep.getPasswordInputType(), 'text');
    assert.ok(await credentialsStep.isHidePasswordButtonDisplayed(), "'Hide' should be offered");
    let password = await credentialsStep.getTextInPasswordInput();
    assert.equal(
      password.length,
      15,
      `The generated password should be 15 characters: '${password}'`,
    );
    assert.ok(!/\s/.test(password), 'The generated password should contain no whitespace');
  });

  // The editor is dirty once a password is typed, so the Close icon asks before throwing the draft
  // away: Confirm closes both dialogs.
  it('GIVEN a password has been typed on the Credentials step WHEN the Close icon has been clicked AND Confirm has been clicked THEN the editor should be closed', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let idProviderStep = new UserEditorIdProviderStepDialog();
    let generalStep = new UserEditorGeneralStepDialog();
    let credentialsStep = new UserEditorCredentialStepDialog();
    let confirmationDialog = new ConfirmationDialog(
      appConst.SECTION_ID.USERS,
      ConfirmationDialog.KIND.CONFIRM,
    );
    let user = userItemsBuilder.buildUser({
      displayName: USER_NAME,
      idProvider: PROVIDER_NAME,
      email: userItemsBuilder.generateEmail(USER_NAME),
    });
    // 1. Open the editor and get to Credentials; type a password.
    await usersPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    await idProviderStep.doFilterAndSelectIdProviderByDisplayName(PROVIDER_NAME);
    await idProviderStep.clickOnNextAndWaitForGeneralStep();
    await generalStep.typeDataAndClickOnNext(user);
    await credentialsStep.waitForLoaded();
    await credentialsStep.setPassword(appConst.PASSWORD.MEDIUM);
    await credentialsStep.waitForNextButtonEnabled();
    // 2. The Close icon: the draft is dirty, so a confirmation is asked.
    await credentialsStep.clickOnCloseButton();
    await confirmationDialog.waitForDialogOpened();
    assert.equal(
      await confirmationDialog.getQuestion(),
      'Do you want to close the dialog? Changes will be lost.',
    );
    // 3. Confirm: the confirmation and the editor are both gone.
    await confirmationDialog.confirm();
    await credentialsStep.waitForClosed();
    assert.ok(!(await confirmationDialog.isDialogDisplayed()), 'The confirmation is closed');
    assert.ok(!(await credentialsStep.isDialogDisplayed()), 'The editor is closed');
  });

  // Cancel keeps the editor open where it was, with what was typed.
  it('GIVEN a password has been typed on the Credentials step WHEN the Close icon has been clicked AND Cancel has been clicked THEN the Credentials step should stay loaded with the password', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let usersPage = new UsersPage();
    let idProviderStep = new UserEditorIdProviderStepDialog();
    let generalStep = new UserEditorGeneralStepDialog();
    let credentialsStep = new UserEditorCredentialStepDialog();
    let confirmationDialog = new ConfirmationDialog(
      appConst.SECTION_ID.USERS,
      ConfirmationDialog.KIND.CONFIRM,
    );
    let user = userItemsBuilder.buildUser({
      displayName: USER_NAME,
      idProvider: PROVIDER_NAME,
      email: userItemsBuilder.generateEmail(USER_NAME),
    });
    // 1. Open the editor and get to Credentials; type a password.
    await usersPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    await idProviderStep.doFilterAndSelectIdProviderByDisplayName(PROVIDER_NAME);
    await idProviderStep.clickOnNextAndWaitForGeneralStep();
    await generalStep.typeDataAndClickOnNext(user);
    await credentialsStep.waitForLoaded();
    await credentialsStep.setPassword(appConst.PASSWORD.MEDIUM);
    await credentialsStep.waitForNextButtonEnabled();
    // 2. The Close icon, then Cancel in the confirmation.
    await credentialsStep.clickOnCloseButton();
    await confirmationDialog.cancel();
    // 3. The editor is still on Credentials, the password still typed, Next still enabled.
    await credentialsStep.waitForLoaded();
    assert.equal(await credentialsStep.getStepTitle(), 'Credentials');
    assert.equal(
      await credentialsStep.getTextInPasswordInput(),
      appConst.PASSWORD.MEDIUM,
      'The password should still be in the input',
    );
    assert.equal(await credentialsStep.getPasswordStrengthLabel(), 'Medium');
    await credentialsStep.waitForNextButtonEnabled();
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
