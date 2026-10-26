/**
 * Created on 26.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const userItemsBuilder = require('../../libs/users.items.builder');
const IdProvidersPage = require('../../page_objects/providers/id.providers.page');
const IdProviderDetails = require('../../page_objects/providers/id.provider.details');
const IdProviderEditorGeneralStepDialog = require('../../page_objects/providers/provider-dialog/provider.editor.general.step.dialog');
const IdProviderEditorPermissionsStepDialog = require('../../page_objects/providers/provider-dialog/provider.editor.permissions.step.dialog');
const IdProviderEditorSummaryStepDialog = require('../../page_objects/providers/provider-dialog/provider.editor.summary.step.dialog');
const AdfsIdProviderConfigDialog = require('../../page_objects/providers/provider-dialog/adfs.provider.config.dialog');
const Auth0IdProviderConfigDialog = require('../../page_objects/providers/provider-dialog/auth0.provider.config.dialog');

describe('idprovider.editor.application.config.spec - the configuration of the bound application: filled in the dialog behind the pencil, applied, written by Create and read back by Edit', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  // The application whose configuration form has required fields; it comes from the dev repository.
  const ADFS_APPLICATION = AdfsIdProviderConfigDialog.APPLICATION;
  const CONFIG_TITLE = AdfsIdProviderConfigDialog.TITLE;
  const AUTH0_APPLICATION = Auth0IdProviderConfigDialog.APPLICATION;
  const CONFIG_INCOMPLETE = 'The application configuration has required fields to fill in';
  const FIELD_REQUIRED = 'This field is required';
  const { DOMAIN, CLIENT_ID, CLIENT_SECRET } = AdfsIdProviderConfigDialog.FIELD;
  // The three required inputs of the Client fieldset - the configuration is complete once they are.
  const CLIENT_SETTINGS = Object.freeze({
    [DOMAIN]: 'test.auth0.com',
    [CLIENT_ID]: userItemsBuilder.generateRandomName('client'),
    [CLIENT_SECRET]: userItemsBuilder.generateRandomName('secret'),
  });
  const NEW_PROVIDER = userItemsBuilder.buildIdProvider({
    displayName: userItemsBuilder.generateRandomName('adfsprovider'),
    description: 'configured in the editor',
  });
  // The group the third test picks in the form's Groups selector; made in the system provider.
  const GROUP_NAME = userItemsBuilder.generateRandomName('group');
  let GROUP;

  it('GIVEN the suite starts THEN a group should be created via the API', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    GROUP = await settingsUtils.createGroupViaApi(
      userItemsBuilder.buildGroup({ displayName: GROUP_NAME }),
    );
  });

  it("GIVEN 'Test ADFS ID Provider' has been bound on the General step WHEN its configuration has been filled in and applied THEN the red icon should be gone AND Summary should name the application AND Create should save the provider", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let generalStep = new IdProviderEditorGeneralStepDialog();
    let configDialog = new AdfsIdProviderConfigDialog();
    let permissionsStep = new IdProviderEditorPermissionsStepDialog();
    let summaryStep = new IdProviderEditorSummaryStepDialog();
    // 1. New: the editor opens on General; the display name alone, the ID is derived from it.
    await idProvidersPage.clickOnNewButton();
    await generalStep.waitForLoaded();
    await generalStep.typeInDisplayNameInput(NEW_PROVIDER.displayName);
    await generalStep.typeInDescriptionTextArea(NEW_PROVIDER.description);
    // 2. The ADFS application: its configuration starts with required fields empty, so the row
    //    carries the red icon once the form has been read.
    await generalStep.selectApplication(ADFS_APPLICATION);
    await generalStep.waitForApplicationRowDisplayed();
    assert.equal(await generalStep.getSelectedApplication(), ADFS_APPLICATION);
    await generalStep.waitForApplicationConfigIssue(CONFIG_INCOMPLETE);
    await settingsUtils.saveScreenshot('idprovider-config-issue-before-apply');
    assert.ok(
      await generalStep.isApplicationConfigButtonDisplayed(),
      'An application with a configuration form should offer the pencil',
    );
    // Next button should be enabled even with the red icon, because the configuration is not required to proceed.
    await generalStep.waitForNextButtonEnabled();
    // 3. The pencil opens the configuration dialog, titled by the application. Nothing is typed
    //    yet, and Apply is enabled all the same - it never waits for the form to be complete.
    await generalStep.clickOnApplicationConfigButton();
    await configDialog.waitForLoaded();
    assert.equal(await configDialog.getTitle(), CONFIG_TITLE);
    for (const label of Object.keys(CLIENT_SETTINGS)) {
      assert.ok(await configDialog.isInputDisplayed(label), `The '${label}' input should be shown`);
      assert.equal(
        await configDialog.getInputValue(label),
        '',
        `The '${label}' input should start empty`,
      );
    }
    assert.ok(
      await configDialog.isApplyButtonEnabled(),
      'Apply should be enabled before anything is typed',
    );
    // 4. The three required inputs: Apply stays enabled while they are typed.
    await configDialog.typeClientSettings(CLIENT_SETTINGS);
    assert.deepEqual(
      await configDialog.getClientSettings(),
      CLIENT_SETTINGS,
      'The inputs should hold what was typed',
    );
    assert.deepEqual(
      await configDialog.getValidationMessages(),
      [],
      'Filled required inputs should report nothing',
    );
    assert.ok(await configDialog.isApplyButtonEnabled(), 'Apply should be enabled after typing');
    await settingsUtils.saveScreenshot('idprovider-config-dialog-filled');
    // 5. Apply: the dialog closes without a question and the red icon goes - the applied
    //    configuration satisfies the form.
    await configDialog.clickOnApplyButtonAndWaitForClosed();
    await generalStep.waitForApplicationConfigIssueGone();
    assert.strictEqual(
      await generalStep.getApplicationConfigIssue(),
      undefined,
      'The configuration icon should be gone once the required fields are filled',
    );
    assert.equal(
      await generalStep.getSelectedApplication(),
      ADFS_APPLICATION,
      'The application should still be bound',
    );
    await settingsUtils.saveScreenshot('idprovider-config-issue-after-apply');
    // 6. Permissions is left as it is; Summary names the bound application.
    await generalStep.waitForNextButtonEnabled();
    await generalStep.clickOnNextButton();
    await permissionsStep.waitForLoaded();
    await permissionsStep.waitForNextButtonEnabled();
    await permissionsStep.clickOnNextAndWaitForSummaryStep();
    await summaryStep.waitForLoaded();
    assert.equal(
      await summaryStep.getIdProvider(),
      `${NEW_PROVIDER.displayName} (${NEW_PROVIDER.id})`,
      'The ID provider row should read back the display name and the ID',
    );
    assert.equal(await summaryStep.getDescription(), NEW_PROVIDER.description);
    assert.equal(
      await summaryStep.getApplication(),
      ADFS_APPLICATION,
      'The Application row should name the bound application',
    );
    // 7. Create: the dialog closes, the notification message confirms, the row appears with the
    //    application on its right.
    await summaryStep.waitForCreateButtonEnabled();
    await summaryStep.clickOnCreateButtonAndWaitForClosed();
    await idProvidersPage.waitForExpectedNotificationMessage(
      appConst.idProviderCreatedMessage(NEW_PROVIDER.displayName),
    );
    await idProvidersPage.waitForRowByDisplayNameDisplayed(NEW_PROVIDER.displayName);
    assert.equal(
      await idProvidersPage.getProviderApplicationByDisplayName(NEW_PROVIDER.displayName),
      ADFS_APPLICATION,
      'The row should show the bound application',
    );
  });

  // The configuration was written with the provider: the editor opened on the saved one shows the
  // application without the icon, and the dialog behind the pencil holds what was typed.
  it("GIVEN the saved provider is selected WHEN 'Edit' in the details has been clicked AND the pencil has been clicked THEN the configuration dialog should hold the values typed before Create", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let idProviderDetails = new IdProviderDetails();
    let generalStep = new IdProviderEditorGeneralStepDialog();
    let configDialog = new AdfsIdProviderConfigDialog();
    // 1. The details of the saved provider.
    await idProvidersPage.clickOnRowByDisplayName(NEW_PROVIDER.displayName);
    await idProviderDetails.waitForTitle(NEW_PROVIDER.displayName);
    // 2. 'Edit': the General step opens on the saved data, the application bound and complete - no
    //    red icon, the pencil still there.
    await idProviderDetails.clickOnEditButton();
    await generalStep.waitForLoaded();
    await generalStep.waitForApplicationRowDisplayed();
    assert.equal(await generalStep.getSelectedApplication(), ADFS_APPLICATION);
    assert.ok(
      await generalStep.isApplicationConfigButtonDisplayed(),
      'The pencil should be offered for the saved provider',
    );
    assert.ok(
      !(await generalStep.isApplicationConfigIssueDisplayed()),
      'A saved configuration with its required fields filled should carry no icon',
    );
    await generalStep.waitForSaveButtonDisabled();
    // 3. The pencil: the dialog opens on the stored configuration, the three inputs as they were
    //    typed before Create.
    await generalStep.clickOnApplicationConfigButton();
    await configDialog.waitForLoaded();
    assert.equal(await configDialog.getTitle(), CONFIG_TITLE);
    assert.deepEqual(
      await configDialog.getClientSettings(),
      CLIENT_SETTINGS,
      'The dialog should read back the configuration written by Create',
    );
    assert.deepEqual(
      await configDialog.getValidationMessages(),
      [],
      'A complete stored configuration should report nothing',
    );
    await settingsUtils.saveScreenshot('idprovider-config-dialog-stored');
    // 4. Nothing was changed: Cancel closes the dialog without a question, and the editor is left
    //    as it was - Save still disabled.
    await configDialog.clickOnCancelButtonAndWaitForClosed();
    assert.ok(
      !(await generalStep.isApplicationConfigIssueDisplayed()),
      'Cancel should leave the stored configuration, and the icon, as they were',
    );
    await generalStep.waitForSaveButtonDisabled();
  });

  // The Groups fieldset of the form is a principal selector of its own: the groups of every ID
  // provider are offered in it, and a picked one is staged with the rest of the configuration.
  it("GIVEN 'Test ADFS ID Provider' has been bound AND its configuration dialog opened WHEN the group made in the suite has been picked in the Groups selector THEN it should be listed under the selector with its ID provider AND WHEN the dialog has been applied and reopened THEN the group should still be picked", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let generalStep = new IdProviderEditorGeneralStepDialog();
    let configDialog = new AdfsIdProviderConfigDialog();
    let groupsSelector = configDialog.groupsSelector;
    // 1. New, the display name, the ADFS application: the pencil opens the configuration dialog.
    await idProvidersPage.clickOnNewButton();
    await generalStep.waitForLoaded();
    await generalStep.typeInDisplayNameInput(userItemsBuilder.generateRandomName('provider'));
    await generalStep.selectApplication(ADFS_APPLICATION);
    await generalStep.clickOnApplicationConfigButton();
    await configDialog.waitForLoaded();
    assert.ok(
      await groupsSelector.isFilterInputDisplayed(),
      'The Groups fieldset should offer a principal selector',
    );
    assert.deepEqual(
      await groupsSelector.getSelectedOptionsDisplayName(),
      [],
      'No group should be picked to begin with',
    );
    // 2. The group made via the API is offered, with its provider's key beside it.
    await groupsSelector.typeTextInFilterInput(GROUP_NAME);
    await groupsSelector.waitForOptionDisplayed(GROUP_NAME);
    assert.equal(
      await groupsSelector.getOptionIdProvider(GROUP_NAME),
      'system',
      "The option should name the group's ID provider",
    );
    // 3. Tick it and Apply the picker: the group is listed under the selector with its provider and
    //    a Remove button.
    await groupsSelector.clickOnOptionByDisplayName(GROUP_NAME);
    await groupsSelector.clickOnApplyButton();
    await groupsSelector.waitForOptionSelected(GROUP_NAME);
    await groupsSelector.scrollToSelectedOption(GROUP_NAME);
    await settingsUtils.saveScreenshot('idprovider-config-dialog-group-picked');
    assert.deepEqual(await groupsSelector.getSelectedOptionsDisplayName(), [GROUP_NAME]);
    assert.equal(
      await groupsSelector.getSelectedOptionIdProvider(GROUP_NAME),
      'system',
      "The picked row should name the group's ID provider",
    );
    assert.ok(
      await groupsSelector.isRemoveButtonEnabled(GROUP_NAME),
      'The picked group should be removable',
    );
    // 4. Apply the dialog: the pick is staged in the editor, and the red icon stays - the Client
    //    fieldset is still empty.
    await configDialog.clickOnApplyButtonAndWaitForClosed();
    await generalStep.waitForApplicationConfigIssue(CONFIG_INCOMPLETE);
    // 5. The pencil again: the dialog opens on the applied configuration, the group still picked.
    await generalStep.clickOnApplicationConfigButton();
    await configDialog.waitForLoaded();
    await groupsSelector.waitForOptionSelected(GROUP_NAME);
    assert.deepEqual(
      await groupsSelector.getSelectedOptionsDisplayName(),
      [GROUP_NAME],
      'The picked group should survive Apply and a reopen',
    );
    // 6. Nothing was changed this time: Cancel closes the dialog without a question. The editor is
    //    dirty, so its cross asks, and the question is confirmed - nothing is created here.
    await configDialog.clickOnCancelButtonAndWaitForClosed();
    await generalStep.clickOnCloseButton();
    await generalStep.waitForCloseQuestionDisplayed();
    await generalStep.clickOnDiscardButton();
    await generalStep.waitForClosed();
  });

  // An item set inside the configuration form: Add appends an occurrence whose own required input
  // is validated with the rest of the form, so a proxy without a host keeps the configuration
  // incomplete even once clientId - the only field a fresh configuration lacks - is filled.
  it("GIVEN 'Test Auth0 ID Provider' has been bound AND a Proxy has been added in its configuration WHEN clientId has been typed and the dialog applied THEN the red icon should stay for the empty Host AND WHEN the host has been typed and applied THEN the icon should be gone", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let generalStep = new IdProviderEditorGeneralStepDialog();
    let configDialog = new Auth0IdProviderConfigDialog();
    const { PROXY } = Auth0IdProviderConfigDialog.ITEM_SET;
    const { HOST } = Auth0IdProviderConfigDialog.PROXY_FIELD;
    const clientId = userItemsBuilder.generateRandomName('client');
    const host = userItemsBuilder.generateRandomName('host');
    // 1. New, the display name, the Auth0 application: a fresh configuration lacks clientId alone,
    //    so the red icon is shown.
    await idProvidersPage.clickOnNewButton();
    await generalStep.waitForLoaded();
    await generalStep.typeInDisplayNameInput(userItemsBuilder.generateRandomName('provider'));
    await generalStep.selectApplication(AUTH0_APPLICATION);
    await generalStep.waitForApplicationConfigIssue(CONFIG_INCOMPLETE);
    // 2. The pencil: the dialog is titled by the application, the URL inputs carry their defaults,
    //    clientId is empty and the Proxy set holds no occurrence.
    await generalStep.clickOnApplicationConfigButton();
    await configDialog.waitForLoaded();
    assert.equal(await configDialog.getTitle(), Auth0IdProviderConfigDialog.TITLE);
    assert.equal(await configDialog.getTextInClientIdInput(), '', 'clientId should start empty');
    assert.notEqual(
      await configDialog.getTextInAuthorizationUrlInput(),
      '',
      'authorizationUrl should start with its default',
    );
    assert.ok(await configDialog.isItemSetDisplayed(PROXY), 'The Proxy item set should be shown');
    assert.deepEqual(await configDialog.getProxyLabels(), [], 'No proxy should be added yet');
    // 3. Add: one occurrence appears, with the Host input in it.
    await configDialog.clickOnAddProxyButton();
    await configDialog.waitForProxyCount(1);
    assert.ok(await configDialog.isInputDisplayed(HOST), 'The Host input should be shown');
    assert.equal(await configDialog.getTextInProxyHostInput(), '', 'Host should start empty');
    await settingsUtils.saveScreenshot('idprovider-config-dialog-proxy-added');
    // 4. clientId alone, then Apply: the occurrence's Host is required, so the configuration is
    //    still incomplete and the icon stays.
    await configDialog.typeInClientIdInput(clientId);
    await configDialog.clickOnApplyButtonAndWaitForClosed();
    await generalStep.waitForApplicationConfigIssue(CONFIG_INCOMPLETE);
    // 5. Reopened on a broken configuration, the form reports every empty required field at once:
    //    the Host under its input. The proxy and the clientId were kept.
    await generalStep.clickOnApplicationConfigButton();
    await configDialog.waitForLoaded();
    await configDialog.waitForProxyCount(1);
    assert.equal(await configDialog.getTextInClientIdInput(), clientId);
    await configDialog.waitForValidationMessage(FIELD_REQUIRED);
    await settingsUtils.saveScreenshot('idprovider-config-dialog-proxy-host-required');
    // 6. The host, then Apply: the occurrence takes the host as its label, nothing is reported, and
    //    the icon goes - the configuration is complete, item set included.
    await configDialog.typeInProxyHostInput(host);
    assert.deepEqual(
      await configDialog.getProxyLabels(),
      [host],
      'The occurrence should be labelled by its host',
    );
    assert.deepEqual(
      await configDialog.getValidationMessages(),
      [],
      'A filled Host should report nothing',
    );
    await configDialog.clickOnApplyButtonAndWaitForClosed();
    await generalStep.waitForApplicationConfigIssueGone();
    await settingsUtils.saveScreenshot('idprovider-config-issue-gone-auth0');
    // 7. Nothing is created: the dirty editor asks on the cross, and the question is confirmed.
    await generalStep.clickOnCloseButton();
    await generalStep.waitForCloseQuestionDisplayed();
    await generalStep.clickOnDiscardButton();
    await generalStep.waitForClosed();
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

  // The provider holds no users or groups, so the API lets it go; the group lives in the system
  // provider and goes apart from it.
  after(async () => {
    await settingsUtils.deleteIdProviderViaApi(NEW_PROVIDER).catch((err) => {
      console.log(`The ID provider '${NEW_PROVIDER.displayName}' was not cleaned up: ` + err);
    });
    if (GROUP !== undefined) {
      await settingsUtils.deletePrincipalsViaApi(GROUP).catch((err) => {
        console.log(`The group '${GROUP_NAME}' was not cleaned up: ` + err);
      });
    }
  });
});
