/**
 * Created on 22.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const ServiceAccountsPage = require('../../page_objects/service-accounts/service.accounts.page');
const ServiceAccountDetails = require('../../page_objects/service-accounts/service.account.details');
const ServiceAccountEditorGeneralStepDialog = require('../../page_objects/service-accounts/service-account-dialog/service.account.editor.general.step.dialog');
const ServiceAccountEditorCredentialsStepDialog = require('../../page_objects/service-accounts/service-account-dialog/service.account.editor.credentials.step.dialog');
const AddPublicKeyDialog = require('../../page_objects/users/user-dialog/add.public.key.dialog');
const ConfirmationDialog = require('../../page_objects/confirmation.dialog');
const userItemsBuilder = require('../../libs/users.items.builder');
const publicKeyFiles = require('../../libs/public.key.files');

describe("service.account.editor.credentials.step.spec - the public keys of the Credentials step: a pair generated in the browser or a .pem uploaded, staged until the save, and a stored key removed only through 'Keep'", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // The account the last test edits - the only one this suite creates. The wizard tests work on a
  // draft they never create, so they all type the same display name.
  const ACCOUNT_NAME = userItemsBuilder.generateRandomName('account');
  const DRAFT_NAME = userItemsBuilder.generateRandomName('draft');
  const STORED_KEY_LABEL = 'stored key';
  const KEY_LABEL = 'generated key';
  const SECOND_KEY_LABEL = 'second key';
  const UPLOADED_KEY_LABEL = 'uploaded key';
  // Typed with spaces around it: the dialog trims the label before it stages the key.
  const SPACED_KEY_LABEL = '  spaced key  ';
  const NOT_PUBLIC =
    'That file is not an RSA public key. Upload the .pem holding the public half alone.';
  // The .pem files Upload is pointed at, written under build/ by before().
  let KEY_PAIR_FILES;
  // What buildServiceAccount() answered for the account the first test creates: the last test and
  // the clean-up need its `id`, which is the login the server knows it by, not its display name.
  let ACCOUNT;

  function draft() {
    return userItemsBuilder.buildServiceAccount({
      displayName: DRAFT_NAME,
      email: userItemsBuilder.generateEmail(DRAFT_NAME),
    });
  }

  it('GIVEN the suite starts THEN a service account with one public key should be created', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    ACCOUNT = userItemsBuilder.buildServiceAccount({
      displayName: ACCOUNT_NAME,
      email: userItemsBuilder.generateEmail(ACCOUNT_NAME),
      publicKeys: [STORED_KEY_LABEL],
    });
    // The key is generated in the wizard, so the last test has a stored one to stage the removal of.
    await settingsUtils.createServiceAccount(ACCOUNT);
  });

  // The Label is the one thing the dialog requires, and it is trimmed before it counts: nothing but
  // whitespace is no label at all. Both ways out of the dialog are held back by it, since either
  // stages a key that would otherwise have nothing to show in its row.
  it("GIVEN the Credentials step is opened WHEN 'Add' has been clicked THEN Generate and Upload should be held back until a label is typed", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let credentialsStep = new ServiceAccountEditorCredentialsStepDialog();
    let addPublicKeyDialog = new AddPublicKeyDialog(appConst.SECTION_ID.SERVICE_ACCOUNTS);
    // 1. Open the editor and get to Credentials: a new account has no key yet.
    await settingsUtils.openNewServiceAccountEditorOnCredentials(draft());
    assert.equal(await credentialsStep.getStepTitle(), 'Credentials');
    assert.ok(
      await credentialsStep.isNoPublicKeysNoticeDisplayed(),
      "'No public keys' should be shown while the list is empty",
    );
    assert.ok(await credentialsStep.isAddPublicKeyButtonDisplayed(), "'Add' should be shown");
    // 2. 'Add': the dialog opens on an empty Label, with both ways out disabled.
    await credentialsStep.clickOnAddPublicKeyButton();
    await addPublicKeyDialog.waitForLoaded();
    assert.equal(await addPublicKeyDialog.getTitle(), 'New public key');
    assert.equal(await addPublicKeyDialog.getTextInLabelInput(), '');
    await addPublicKeyDialog.waitForGenerateButtonDisabled();
    assert.ok(
      !(await addPublicKeyDialog.isUploadButtonEnabled()),
      'Upload should be disabled with no label',
    );
    // 3. Whitespace is not a label: the dialog trims it, so both stay disabled.
    await addPublicKeyDialog.typeInLabelInput('   ');
    await addPublicKeyDialog.waitForGenerateButtonDisabled();
    assert.ok(
      !(await addPublicKeyDialog.isUploadButtonEnabled()),
      'Upload should be disabled for a whitespace label',
    );
    // 4. A real label enables both.
    await addPublicKeyDialog.clearLabelInput();
    await addPublicKeyDialog.typeInLabelInput(KEY_LABEL);
    await addPublicKeyDialog.waitForGenerateButtonEnabled();
    assert.ok(
      await addPublicKeyDialog.isUploadButtonEnabled(),
      'Upload should be enabled once a label is typed',
    );
    // 5. Clearing it takes them back: the label is read as it is typed, not on a blur.
    await addPublicKeyDialog.clearLabelInput();
    await addPublicKeyDialog.waitForGenerateButtonDisabled();
    assert.ok(
      !(await addPublicKeyDialog.isUploadButtonEnabled()),
      'Upload should be disabled again once the label is cleared',
    );
    // 6. Cancel: the dialog closes with nothing staged, and a key is optional anyway, so the step
    //    lets Next through.
    await addPublicKeyDialog.clickOnCancelButton();
    await addPublicKeyDialog.waitForClosed();
    assert.ok(await credentialsStep.isNoPublicKeysNoticeDisplayed(), 'Cancel should stage nothing');
    await credentialsStep.waitForNextButtonEnabled();
  });

  it('GIVEN a label has been typed in the New public key dialog WHEN Generate has been clicked THEN the key should be staged until the save AND should survive a step back', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let generalStep = new ServiceAccountEditorGeneralStepDialog();
    let credentialsStep = new ServiceAccountEditorCredentialsStepDialog();
    let addPublicKeyDialog = new AddPublicKeyDialog(appConst.SECTION_ID.SERVICE_ACCOUNTS);
    // 1. Open the editor and get to Credentials.
    await settingsUtils.openNewServiceAccountEditorOnCredentials(draft());
    // 2. 'Add' → the label → Generate: the dialog closes on its own.
    await credentialsStep.clickOnAddPublicKeyButton();
    await addPublicKeyDialog.generateKey(KEY_LABEL);
    // 3. The key is listed under its label, waiting for the save rather than showing a kid.
    await credentialsStep.waitForPublicKeyDisplayed(KEY_LABEL);
    assert.ok(
      await credentialsStep.isPublicKeyPending(KEY_LABEL),
      'A generated key is only written when the wizard is saved',
    );
    assert.ok(
      !(await credentialsStep.isNoPublicKeysNoticeDisplayed()),
      "'No public keys' should be gone once a key is staged",
    );
    // 4. A key is optional, so staging one does not hold the step either.
    await credentialsStep.waitForNextButtonEnabled();
    // 5. A second key, its label typed with spaces around it: the row shows it trimmed.
    await credentialsStep.clickOnAddPublicKeyButton();
    await addPublicKeyDialog.generateKey(SPACED_KEY_LABEL);
    await credentialsStep.waitForPublicKeyDisplayed(SPACED_KEY_LABEL.trim());
    assert.deepEqual(
      await credentialsStep.getPublicKeyLabels(),
      [KEY_LABEL, SPACED_KEY_LABEL.trim()],
      'The keys should be listed in the order they were staged, their labels trimmed',
    );
    // 6. Previous: General, with what was typed there.
    await credentialsStep.clickOnPreviousButton();
    await generalStep.waitForLoaded();
    assert.equal(await generalStep.getTextInDisplayNameInput(), DRAFT_NAME);
    // 7. Next: Credentials again, both keys still staged - they are part of the form, not of the step.
    await generalStep.clickOnNextButton();
    await credentialsStep.waitForLoaded();
    assert.deepEqual(
      await credentialsStep.getPublicKeyLabels(),
      [KEY_LABEL, SPACED_KEY_LABEL.trim()],
      'The staged keys should survive the step back',
    );
  });

  // Upload takes the public half of a pair made elsewhere: a '-----BEGIN PUBLIC KEY-----' block, and
  // nothing that holds a private key. The refusal is reported in the dialog's footer and the dialog
  // stays open on the label that was typed, so the right file can be picked without starting over.
  it('GIVEN a label has been typed WHEN a .pem holding the private half has been uploaded THEN the dialog should refuse it AND WHEN the public half is uploaded instead THEN the key should be staged', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let credentialsStep = new ServiceAccountEditorCredentialsStepDialog();
    let addPublicKeyDialog = new AddPublicKeyDialog(appConst.SECTION_ID.SERVICE_ACCOUNTS);
    // 1. Open the editor and get to Credentials; 'Add' and type the label.
    await settingsUtils.openNewServiceAccountEditorOnCredentials(draft());
    await credentialsStep.clickOnAddPublicKeyButton();
    await addPublicKeyDialog.waitForLoaded();
    await addPublicKeyDialog.typeInLabelInput(UPLOADED_KEY_LABEL);
    // 2. Upload the .pem holding the private half.
    await addPublicKeyDialog.uploadPublicKey(KEY_PAIR_FILES.privateKeyPath);
    // 3. Refused: the reason is reported in the footer, the dialog stays open on the label that was
    //    typed, and nothing is staged.
    await addPublicKeyDialog.waitForErrorMessage(NOT_PUBLIC);
    assert.ok(await addPublicKeyDialog.isDialogDisplayed(), 'The dialog should stay open');
    assert.equal(
      await addPublicKeyDialog.getTextInLabelInput(),
      UPLOADED_KEY_LABEL,
      'The label should survive the refusal',
    );
    // 4. The public half has been uploaded, in the same dialog: accepted, so the dialog closes.
    await addPublicKeyDialog.uploadPublicKey(KEY_PAIR_FILES.publicKeyPath);
    await addPublicKeyDialog.waitForClosed();
    // 5. The key is staged under its label, waiting for the save like a generated one.
    await credentialsStep.waitForPublicKeyDisplayed(UPLOADED_KEY_LABEL);
    assert.ok(
      await credentialsStep.isPublicKeyPending(UPLOADED_KEY_LABEL),
      'An uploaded key is only written when the wizard is saved',
    );
    await credentialsStep.waitForNextButtonEnabled();
  });

  // A key that was never written has nothing to undo: Remove drops it outright, and the Keep button
  // the stored keys get is not offered for it.
  it('GIVEN two keys have been staged on the Credentials step WHEN one of them has been removed THEN it should be dropped outright with no Keep offered', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let credentialsStep = new ServiceAccountEditorCredentialsStepDialog();
    let addPublicKeyDialog = new AddPublicKeyDialog(appConst.SECTION_ID.SERVICE_ACCOUNTS);
    // 1. Open the editor and get to Credentials; stage two keys.
    await settingsUtils.openNewServiceAccountEditorOnCredentials(draft());
    await credentialsStep.clickOnAddPublicKeyButton();
    await addPublicKeyDialog.generateKey(KEY_LABEL);
    await credentialsStep.clickOnAddPublicKeyButton();
    await addPublicKeyDialog.generateKey(SECOND_KEY_LABEL);
    assert.deepEqual(await credentialsStep.getPublicKeyLabels(), [KEY_LABEL, SECOND_KEY_LABEL]);
    // 2. Remove the first: the row goes, the other one stays, and nothing is struck through.
    await credentialsStep.clickOnRemovePublicKeyButton(KEY_LABEL);
    assert.deepEqual(
      await credentialsStep.getPublicKeyLabels(),
      [SECOND_KEY_LABEL],
      'A staged key is dropped, not marked for removal',
    );
    assert.ok(
      !(await credentialsStep.isKeepPublicKeyButtonDisplayed()),
      "'Keep' is for stored keys, which a staged one never was",
    );
    // 3. Remove the other one too: the list is empty again and says so.
    await credentialsStep.clickOnRemovePublicKeyButton(SECOND_KEY_LABEL);
    assert.deepEqual(await credentialsStep.getPublicKeyLabels(), []);
    assert.ok(
      await credentialsStep.isNoPublicKeysNoticeDisplayed(),
      "'No public keys' should be back",
    );
    await credentialsStep.waitForNextButtonEnabled();
  });

  // A stored key is removed by the save, not by the click: until then the row stays, struck through,
  // with 'Keep' in place of its Remove button. 'Keep' takes the step back to what it opened with, so
  // Cancel closes it outright - nothing is dirty, nothing to confirm.
  it("GIVEN the saved account's key has been marked for removal WHEN 'Keep' has been clicked THEN the step should be back as it opened AND the key should still be stored", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.SERVICE_ACCOUNTS);
    let serviceAccountsPage = new ServiceAccountsPage();
    let serviceAccountDetails = new ServiceAccountDetails();
    let credentialsStep = new ServiceAccountEditorCredentialsStepDialog();
    let confirmationDialog = new ConfirmationDialog(
      appConst.SECTION_ID.SERVICE_ACCOUNTS,
      ConfirmationDialog.KIND.CONFIRM,
    );
    await serviceAccountsPage.clickOnRowByDisplayName(ACCOUNT_NAME);
    await serviceAccountDetails.waitForTitle(ACCOUNT_NAME);
    // 1. 'Edit credentials': the step opens on the stored key, which shows the kid it was written
    //    under rather than the pending line. Nothing changed, so Save is disabled.
    await serviceAccountDetails.clickOnEditCredentialsButton();
    await credentialsStep.waitForLoaded();
    // The stored keys arrive with a read of their own, which the step does not wait for.
    await credentialsStep.waitForPublicKeyDisplayed(STORED_KEY_LABEL);
    assert.deepEqual(await credentialsStep.getPublicKeyLabels(), [STORED_KEY_LABEL]);
    assert.ok(
      !(await credentialsStep.isPublicKeyPending(STORED_KEY_LABEL)),
      'A stored key shows its kid, not the pending line',
    );
    await credentialsStep.waitForSaveButtonDisabled();
    // 2. Remove: the row stays - struck through - and offers 'Keep' instead; Save is enabled, since
    //    the removal is a change the save would make.
    await credentialsStep.clickOnRemovePublicKeyButton(STORED_KEY_LABEL);
    assert.deepEqual(
      await credentialsStep.getPublicKeyLabels(),
      [STORED_KEY_LABEL],
      'A stored key is only marked for removal, never dropped from the list',
    );
    assert.ok(
      await credentialsStep.isKeepPublicKeyButtonDisplayed(),
      "'Keep' should be offered in place of the Remove button",
    );
    await credentialsStep.waitForSaveButtonEnabled();
    // 3. 'Keep': the marking is undone - the Remove button is back, 'Keep' is gone, Save is disabled
    //    again.
    await credentialsStep.clickOnKeepPublicKeyButton();
    await credentialsStep.waitForPublicKeyDisplayed(STORED_KEY_LABEL);
    assert.ok(
      !(await credentialsStep.isKeepPublicKeyButtonDisplayed()),
      "'Keep' should be gone once the removal is undone",
    );
    await credentialsStep.waitForSaveButtonDisabled();
    // 4. Cancel: nothing changed, so the dialog closes without asking.
    await credentialsStep.clickOnCancelButton();
    await credentialsStep.waitForClosed();
    assert.ok(!(await confirmationDialog.isDialogDisplayed()), 'No confirmation should be asked');
    // 5. The details still list the key, with the kid it was stored under.
    await serviceAccountDetails.waitForPublicKey(STORED_KEY_LABEL);
    assert.equal(await serviceAccountDetails.getPublicKeysCount(), 1);
  });

  beforeEach(async () => {
    await settingsUtils.navigateToSettingsApp();
  });
  afterEach(() => settingsUtils.doCloseAllWindowTabsAndNavigateToHome());
  before(async () => {
    // Written here rather than in the first test: the upload test needs them whether or not that
    // test got as far as creating its account.
    KEY_PAIR_FILES = publicKeyFiles.writeKeyPairPems(ACCOUNT_NAME);
    if (typeof browser !== 'undefined') {
      await settingsUtils
        .getBrowser()
        .setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
    }
    return console.log('specification starting: ' + this.title);
  });
  // The wizards of the other tests were all closed without Create, so the account made in the first
  // test is the only thing to clean up.
  after(async () => {
    if (ACCOUNT === undefined) {
      return;
    }
    await settingsUtils
      .deletePrincipalsViaApi(`user:${userItemsBuilder.SYSTEM_ID_PROVIDER}:${ACCOUNT.id}`)
      .catch((err) => {
        console.log('The service account was not cleaned up: ' + err);
      });
  });
});
