/**
 * Created on 20.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const userItemsBuilder = require('../../libs/users.items.builder');
const IdProvidersPage = require('../../page_objects/providers/id.providers.page');
const IdProviderEditorGeneralStepDialog = require('../../page_objects/providers/provider-dialog/provider.editor.general.step.dialog');

describe("idprovider.editor.general.step.spec - the ID provider editor's General step: the ID follows the display name, the application is bound here, and the ID's own rules are reported under the input", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  const PROVIDER_NAME = userItemsBuilder.generateRandomName('provider');
  // The application every provider of this suite is bound to; it ships with XP.
  const APPLICATION = 'Standard ID Provider';
  const DISPLAY_NAME_REQUIRED = 'Display name is required';
  const ID_REQUIRED = 'ID is required';
  const ID_INVALID = 'The ID can only contain Latin letters, digits and the characters . - _';
  // XP's NameValidator refuses '_', '.' and '..' outright, and an ID provider's key may not be the
  // roles folder's name either.
  const RESERVED_ID = 'roles';
  const ID_RESERVED = `The ID cannot be "${RESERVED_ID}"`;
  const ID_DOTTED = 'Avoid dots: the ID is used as a key in the virtual host configuration';
  const CLOSE_QUESTION = 'Do you want to close the dialog? Changes will be lost.';
  // The provider the editor is opened for. It is never created: every editor here is closed without
  // Create, so the suite leaves nothing behind to clean up.
  const NEW_PROVIDER = userItemsBuilder.buildIdProvider({
    displayName: PROVIDER_NAME,
    description: 'description',
    application: APPLICATION,
  });

  // A new provider opens on General.
  it('GIVEN the ID provider editor is opened THEN Next should be disabled AND WHEN the display name has been typed THEN the ID should be derived from it AND Next should be enabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let generalStep = new IdProviderEditorGeneralStepDialog();
    // 1. New: the editor opens on General.
    await idProvidersPage.clickOnNewButton();
    await settingsUtils.saveScreenshot('idprovider-editor-general-step');
    await generalStep.waitForLoaded();
    assert.equal(await generalStep.getTitle(), 'New ID provider');
    assert.equal(await generalStep.getStepTitle(), 'General');
    // 2. Empty: the inputs are there, nothing is reported yet, Next is disabled.
    assert.ok(await generalStep.isDisplayNameInputDisplayed(), 'Display name input');
    assert.ok(await generalStep.isIdInputDisplayed(), 'ID input');
    assert.ok(await generalStep.isDescriptionTextAreaDisplayed(), 'Description text area');
    assert.ok(await generalStep.isApplicationSelectorDisplayed(), 'Application selector');
    assert.equal(await generalStep.getTextInDisplayNameInput(), '');
    assert.equal(await generalStep.getTextInIdInput(), '');
    assert.ok(
      !(await generalStep.isApplicationRowDisplayed()),
      'No application should be bound before one is picked',
    );
    assert.deepEqual(
      await generalStep.getValidationMessages(),
      [],
      'No message should be shown before an input is touched',
    );
    await generalStep.waitForNextButtonDisabled();
    // 3. The display name alone: the ID follows it, Next is enabled.
    await generalStep.typeInDisplayNameInput(NEW_PROVIDER.displayName);
    assert.equal(
      await generalStep.getTextInIdInput(),
      NEW_PROVIDER.id,
      'The ID should be derived from the display name',
    );
    await generalStep.waitForNextButtonEnabled();
    assert.deepEqual(
      await generalStep.getValidationMessages(),
      [],
      'No message should be shown for valid data',
    );
  });

  // The application is bound on this step: picking one lists it under the selector
  it("GIVEN the display name has been typed on the General step WHEN 'Standard ID Provider' has been picked THEN it should be listed as the bound application AND WHEN it has been removed THEN the row should be gone AND Next should stay enabled", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let generalStep = new IdProviderEditorGeneralStepDialog();
    // 1. New, then the display name and the description.
    await idProvidersPage.clickOnNewButton();
    await generalStep.waitForLoaded();
    await generalStep.typeInDisplayNameInput(NEW_PROVIDER.displayName);
    await generalStep.typeInDescriptionTextArea(NEW_PROVIDER.description);
    await generalStep.waitForNextButtonEnabled();
    // 2. The application is offered in the selector and listed under it once it has been picked.
    assert.ok(
      await generalStep.isApplicationSelectorEnabled(),
      'The application selector should be enabled for a new provider',
    );
    await generalStep.selectApplication(APPLICATION);
    await generalStep.waitForApplicationRowDisplayed();
    assert.equal(
      await generalStep.getSelectedApplication(),
      APPLICATION,
      'The picked application should be listed as the bound one',
    );
    assert.ok(
      await generalStep.isRemoveApplicationButtonEnabled(),
      'The bound application should be removable',
    );
    // 3. Nothing else on the step was touched by the pick.
    assert.equal(await generalStep.getTextInDisplayNameInput(), NEW_PROVIDER.displayName);
    assert.equal(await generalStep.getTextInIdInput(), NEW_PROVIDER.id);
    assert.equal(await generalStep.getTextInDescriptionTextArea(), NEW_PROVIDER.description);
    await generalStep.waitForNextButtonEnabled();
    // 4. Remove: the row goes and Next stays enabled - the application is not what it waits for.
    await generalStep.clickOnRemoveApplicationButton();
    await generalStep.waitForApplicationRowNotDisplayed();
    assert.deepEqual(
      await generalStep.getValidationMessages(),
      [],
      'Removing the application should report nothing',
    );
    await generalStep.waitForNextButtonEnabled();
  });

  // Both fields are required. The display name is also where the ID comes from until the ID is
  // taken over, so clearing the display name empties both and reports both.
  it('GIVEN the display name has been typed on the General step WHEN it has been cleared AND the input left THEN both the display name and the ID should be reported as required AND Next should be disabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let generalStep = new IdProviderEditorGeneralStepDialog();
    // 1. New, the display name and the application the suite uses: Next is enabled.
    await idProvidersPage.clickOnNewButton();
    await generalStep.waitForLoaded();
    await generalStep.typeInDisplayNameInput(NEW_PROVIDER.displayName);
    await generalStep.selectApplication(APPLICATION);
    await generalStep.waitForNextButtonEnabled();
    // 2. Clear the display name and leave the input: the derived ID goes with it, so both messages
    //    are shown and Next is disabled - a bound application answers neither question.
    await generalStep.clearDisplayNameInput();
    await settingsUtils.doPressTabKey();
    await generalStep.waitForNextButtonDisabled();
    await generalStep.waitForValidationMessage(DISPLAY_NAME_REQUIRED);
    await generalStep.waitForValidationMessage(ID_REQUIRED);
    assert.equal(await generalStep.getTextInIdInput(), '', 'The derived ID should be empty too');
    assert.ok(
      await generalStep.isApplicationRowDisplayed(),
      'The bound application should be untouched',
    );
    // 3. The display name again: both messages go, the ID is derived anew, Next is enabled.
    await generalStep.typeInDisplayNameInput(NEW_PROVIDER.displayName);
    await generalStep.waitForValidationMessageGone(DISPLAY_NAME_REQUIRED);
    await generalStep.waitForValidationMessageGone(ID_REQUIRED);
    assert.equal(await generalStep.getTextInIdInput(), NEW_PROVIDER.id);
    await generalStep.waitForNextButtonEnabled();
  });

  it('GIVEN the display name has been typed on the General step WHEN an ID with forbidden characters has been typed THEN it should be reported AND Next should be disabled AND WHEN a reserved ID has been typed THEN that should be reported too AND WHEN a dotted ID has been typed THEN it should be warned about rather than refused', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let generalStep = new IdProviderEditorGeneralStepDialog();
    // 1. New, then the display name: the derived ID is a valid one.
    await idProvidersPage.clickOnNewButton();
    await generalStep.waitForLoaded();
    await generalStep.typeInDisplayNameInput(NEW_PROVIDER.displayName);
    await generalStep.waitForNextButtonEnabled();
    // 2. A space and a percent sign are both outside what a key may carry.
    await generalStep.typeInIdInput('test %%');
    await generalStep.waitForValidationMessage(ID_INVALID);
    await generalStep.waitForNextButtonDisabled();
    await settingsUtils.saveScreenshot('idprovider-editor-general-step-invalid-id');
    assert.equal(
      await generalStep.getTextInDisplayNameInput(),
      NEW_PROVIDER.displayName,
      'The display name should be untouched',
    );
    // 3. 'roles' is the name of the folder XP keeps the roles in: legal characters, reserved name.
    await generalStep.typeInIdInput(RESERVED_ID);
    await generalStep.waitForValidationMessageGone(ID_INVALID);
    await generalStep.waitForValidationMessage(ID_RESERVED);
    await generalStep.waitForNextButtonDisabled();
    // 4. A dot is legal: nothing is reported and Next is enabled, but the warning is shown under
    //    the input.
    await generalStep.typeInIdInput(`${NEW_PROVIDER.id}.dotted`);
    await generalStep.waitForValidationMessageGone(ID_RESERVED);
    assert.deepEqual(
      await generalStep.getValidationMessages(),
      [],
      'A dotted ID should not be refused',
    );
    assert.equal(
      await generalStep.getIdWarning(),
      ID_DOTTED,
      'A dotted ID should be warned about under the input',
    );
    await generalStep.waitForNextButtonEnabled();
    // 5. An ID the rules are happy with: neither a message nor the warning, Next enabled.
    await generalStep.typeInIdInput(NEW_PROVIDER.id);
    assert.ok(
      !(await generalStep.isIdWarningDisplayed()),
      'The warning should be gone once the dot is',
    );
    assert.deepEqual(
      await generalStep.getValidationMessages(),
      [],
      'No message should be shown for a valid ID',
    );
    await generalStep.waitForNextButtonEnabled();
  });

  // Every way out but a save asks first while the form is dirty, the header's cross included: the
  // footer puts its controls aside and asks instead. 'Keep editing' takes the question back.
  it("GIVEN data has been typed on the General step WHEN the Close icon has been clicked THEN the dialog should ask before closing AND WHEN 'Keep editing' has been clicked THEN the question should be gone AND the data should still be there", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let generalStep = new IdProviderEditorGeneralStepDialog();
    // 1. New, then the data: the form is dirty from the first keystroke.
    await idProvidersPage.clickOnNewButton();
    await generalStep.waitForLoaded();
    await generalStep.typeInDisplayNameInput(NEW_PROVIDER.displayName);
    await generalStep.typeInDescriptionTextArea(NEW_PROVIDER.description);
    assert.ok(
      !(await generalStep.isCloseQuestionDisplayed()),
      'Nothing should be asked before the dialog is closed',
    );
    // 2. The Close icon: the dialog stays open and the footer asks instead.
    await generalStep.clickOnCloseButton();
    await generalStep.waitForCloseQuestionDisplayed();
    await settingsUtils.saveScreenshot('idprovider-editor-close-question');
    assert.ok(await generalStep.isDialogDisplayed(), 'The dialog should stay open while it asks');
    assert.ok(
      await generalStep.isKeepButtonDisplayed(),
      "The 'Keep editing' button should be shown",
    );
    assert.equal(
      await generalStep.getCloseQuestion(),
      CLOSE_QUESTION,
      'The question should say the changes would be lost',
    );
    // 3. 'Keep editing': the question goes, its button with it, and the form is as it was left.
    await generalStep.clickOnKeepButton();
    await generalStep.waitForCloseQuestionNotDisplayed();
    assert.ok(
      !(await generalStep.isKeepButtonDisplayed()),
      "The 'Keep editing' button should not be shown any more",
    );
    assert.ok(await generalStep.isDialogDisplayed(), 'The dialog should still be open');
    assert.equal(
      await generalStep.getTextInDisplayNameInput(),
      NEW_PROVIDER.displayName,
      'The display name should have survived the question',
    );
    assert.equal(
      await generalStep.getTextInDescriptionTextArea(),
      NEW_PROVIDER.description,
      'The description should have survived the question',
    );
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
});
