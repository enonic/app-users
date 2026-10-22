/**
 * Created on 21.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const userItemsBuilder = require('../../libs/users.items.builder');
const IdProvidersPage = require('../../page_objects/providers/id.providers.page');
const IdProviderEditorGeneralStepDialog = require('../../page_objects/providers/provider-dialog/provider.editor.general.step.dialog');
const IdProviderEditorPermissionsStepDialog = require('../../page_objects/providers/provider-dialog/provider.editor.permissions.step.dialog');
const IdProviderEditorSummaryStepDialog = require('../../page_objects/providers/provider-dialog/provider.editor.summary.step.dialog');
const {
  LABEL,
} = require('../../page_objects/providers/provider-dialog/provider.editor.summary.step.dialog');

describe("idprovider.editor.permissions.summary.step.spec - the ID provider editor's Permissions and Summary steps: the seeded entries are pinned, an added one is not, and the application is optional all the way to Create", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  const PROVIDER_NAME = userItemsBuilder.generateRandomName('provider');
  const USER_NAME = userItemsBuilder.generateRandomName('user');
  const ADFS_APPLICATION = 'Test ADFS ID Provider';
  const CONFIG_INCOMPLETE = 'The application configuration has required fields to fill in';
  const SEEDED_PERMISSIONS = Object.freeze({
    Administrator: appConst.ID_PROVIDER_ACCESS.ADMINISTRATOR,
    'Users Administrator': appConst.ID_PROVIDER_ACCESS.ADMINISTRATOR,
    Authenticated: appConst.ID_PROVIDER_ACCESS.READ,
  });
  const SEEDED_PRINCIPALS = Object.keys(SEEDED_PERMISSIONS);
  const DEFAULT_ACCESS = appConst.ID_PROVIDER_ACCESS.CREATE_USERS;
  const ROLE_NAME = appConst.SYSTEM_ROLES.EVERYONE;
  const NEW_PROVIDER = userItemsBuilder.buildIdProvider({
    displayName: userItemsBuilder.generateRandomName('newprovider'),
    description: 'description',
  });
  const GROUP_NAME = userItemsBuilder.generateRandomName('group');
  // The access the third test gives its entry by hand - neither a seeded level nor the one a new
  // entry starts at, so the change is the only way the Summary could show it.
  const PICKED_ACCESS = appConst.ID_PROVIDER_ACCESS.ID_PROVIDER_MANAGER;
  let ID_PROVIDER;
  let USER;
  let GROUP;

  it('GIVEN the suite starts THEN an ID provider with a user and a group in it should be created via the API', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    ID_PROVIDER = await settingsUtils.createIdProviderViaApi(
      userItemsBuilder.buildIdProvider(PROVIDER_NAME, 'description', 'Standard ID Provider', {
        'role:system.user.admin': appConst.ID_PROVIDER_ACCESS.WRITE_USERS,
      }),
    );
    USER = await settingsUtils.createUserViaApi(
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

  it("GIVEN the General step has been filled without an application WHEN Next has been pressed THEN the Permissions step should offer the user made in the suite's provider AND the seeded entries should be pinned AND an added one should not be AND Summary should read every answer back", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let generalStep = new IdProviderEditorGeneralStepDialog();
    let permissionsStep = new IdProviderEditorPermissionsStepDialog();
    let summaryStep = new IdProviderEditorSummaryStepDialog();
    // 1. General, with the application left alone: Next is enabled all the same.
    await idProvidersPage.clickOnNewButton();
    await generalStep.waitForLoaded();
    await generalStep.typeInDisplayNameInput(NEW_PROVIDER.displayName);
    await generalStep.typeInDescriptionTextArea(NEW_PROVIDER.description);
    assert.ok(
      !(await generalStep.isApplicationRowDisplayed()),
      'No application should be bound in this test',
    );
    await generalStep.waitForNextButtonEnabled();
    await generalStep.clickOnNextButton();
    // 2. Permissions: the step answers nothing required of its own either, so Next is enabled the
    //    moment it opens.
    await permissionsStep.waitForLoaded();
    assert.equal(await permissionsStep.getStepTitle(), 'Permissions');
    await permissionsStep.waitForNextButtonEnabled();
    await settingsUtils.saveScreenshot('idprovider-editor-permissions-step');
    // 3. The three seeded entries are there, each at the access it was seeded with, and each one
    //    inert: neither its access nor its removal is the user's to change.
    assert.deepEqual(
      new Set(await permissionsStep.getSelectedPrincipals()),
      new Set(SEEDED_PRINCIPALS),
      'The three seeded entries should be shown to begin with',
    );
    assert.deepEqual(
      await permissionsStep.getPermissions(),
      SEEDED_PERMISSIONS,
      'Each seeded entry should carry the access it was seeded with',
    );
    for (const principal of SEEDED_PRINCIPALS) {
      assert.ok(
        !(await permissionsStep.isAccessSelectorEnabled(principal)),
        `The access selector of the seeded '${principal}' should be disabled`,
      );
      assert.ok(
        !(await permissionsStep.isRemoveButtonEnabled(principal)),
        `The Remove button of the seeded '${principal}' should be disabled`,
      );
    }
    // 4. The picker spans every ID provider: the user made in the suite's own is offered, with that
    //    provider's key beside it.
    await permissionsStep.typeInPermissionsFilterInput(USER_NAME);
    await permissionsStep.combobox.waitForOptionDisplayed(USER_NAME);
    assert.equal(
      await permissionsStep.combobox.getOptionIdProvider(USER_NAME),
      ID_PROVIDER.key,
      "The user's option should name the ID provider it was made in",
    );
    await permissionsStep.clickOnPrincipalOption(USER_NAME);
    await permissionsStep.clickOnApplyButton();
    // 5. The added entry starts at the access app-users grants a new one, and - unlike the seeded
    //    ones - it is the user's to change and to remove.
    await permissionsStep.waitForPrincipalSelected(USER_NAME);
    assert.equal(
      await permissionsStep.getAccess(USER_NAME),
      DEFAULT_ACCESS,
      'The added entry should start at the default access',
    );
    assert.ok(
      await permissionsStep.isRemoveButtonEnabled(USER_NAME),
      'The Remove button of the added entry should be enabled',
    );
    assert.ok(
      await permissionsStep.isAccessSelectorEnabled(USER_NAME),
      'The access selector of the added entry should be enabled',
    );
    await permissionsStep.waitForNextButtonEnabled();
    // 6. Summary reads every answer back: the provider as 'Display name (id)', the description, and
    //    the four entries with their levels. No application was bound, so that row is absent.
    await permissionsStep.clickOnNextAndWaitForSummaryStep();
    await summaryStep.waitForLoaded();
    assert.equal(await summaryStep.getStepTitle(), 'Summary');
    assert.equal(
      await summaryStep.getIdProvider(),
      `${NEW_PROVIDER.displayName} (${NEW_PROVIDER.id})`,
      'The ID provider row should read back the display name and the ID',
    );
    assert.equal(await summaryStep.getDescription(), NEW_PROVIDER.description);
    assert.ok(
      !(await summaryStep.isRowDisplayed(LABEL.APPLICATION)),
      'The Application row should be absent when nothing is bound',
    );
    assert.deepEqual(
      await summaryStep.getPermissions(),
      Object.assign({}, SEEDED_PERMISSIONS, { [USER_NAME]: DEFAULT_ACCESS }),
      'The Permissions row should list the seeded entries and the added one with their levels',
    );
    // 7. The last step's own controls: Create in place of Next, and Previous back to Permissions.
    await summaryStep.waitForCreateButtonDisplayed();
    await summaryStep.waitForCreateButtonEnabled();
    assert.equal(
      await summaryStep.getNextButtonLabel(),
      'Create',
      "The footer's primary button should be Create on the last step",
    );
    assert.ok(await summaryStep.isPreviousButtonDisplayed(), 'Previous should be displayed');
    assert.ok(await summaryStep.isPreviousButtonEnabled(), 'Previous should be enabled');
  });

  it("GIVEN 'Test ADFS ID Provider' has been bound on the General step THEN the icon should say its configuration has required fields AND the Permissions step should behave as it does without an application AND Summary should name the bound application", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let generalStep = new IdProviderEditorGeneralStepDialog();
    let permissionsStep = new IdProviderEditorPermissionsStepDialog();
    let summaryStep = new IdProviderEditorSummaryStepDialog();
    // 1. General, with the ADFS application bound.
    await idProvidersPage.clickOnNewButton();
    await generalStep.waitForLoaded();
    await generalStep.typeInDisplayNameInput(NEW_PROVIDER.displayName);
    await generalStep.typeInDescriptionTextArea(NEW_PROVIDER.description);
    await generalStep.selectApplication(ADFS_APPLICATION);
    await generalStep.waitForApplicationRowDisplayed();
    assert.equal(await generalStep.getSelectedApplication(), ADFS_APPLICATION);
    // 2. Its configuration has required fields, so the red icon is shown, and the pencil is offered to open the configuration form.
    //    The icon waits for the configuration form to be read: binding the application only starts
    //    that request, and a form still loading reports nothing, so the row appears before the icon.
    await generalStep.waitForApplicationConfigIssue(CONFIG_INCOMPLETE);
    await settingsUtils.saveScreenshot('idprovider-editor-general-step-config-issue');
    assert.ok(
      await generalStep.isApplicationConfigIssueDisplayed(),
      'The bound application should carry the configuration icon',
    );
    assert.ok(
      await generalStep.isApplicationConfigButtonDisplayed(),
      'An application with a configuration form should offer the pencil',
    );
    await generalStep.waitForNextButtonEnabled();
    // Next is enabled all the same, because the configuration is not required to continue.
    await generalStep.clickOnNextButton();
    // 3. Permissions: as without an application - Next enabled at once, the three seeded entries
    //    pinned.
    await permissionsStep.waitForLoaded();
    await permissionsStep.waitForNextButtonEnabled();
    assert.deepEqual(
      await permissionsStep.getPermissions(),
      SEEDED_PERMISSIONS,
      'The three seeded entries should be shown at the access they were seeded with',
    );
    for (const principal of SEEDED_PRINCIPALS) {
      assert.ok(
        !(await permissionsStep.isAccessSelectorEnabled(principal)),
        `The access selector of the seeded '${principal}' should be disabled`,
      );
      assert.ok(
        !(await permissionsStep.isRemoveButtonEnabled(principal)),
        `The Remove button of the seeded '${principal}' should be disabled`,
      );
    }
    // 4. A role added by hand: the picker offers roles beside users and groups, and the new entry
    //    is the user's to change and to remove.
    await permissionsStep.addPrincipal(ROLE_NAME);
    await permissionsStep.waitForPrincipalSelected(ROLE_NAME);
    // 'Create users' is the access a new entry starts at.
    assert.equal(
      await permissionsStep.getAccess(ROLE_NAME),
      DEFAULT_ACCESS,
      'The added entry should start at the default access',
    );
    assert.ok(
      await permissionsStep.isRemoveButtonEnabled(ROLE_NAME),
      'The Remove button of the added entry should be enabled',
    );
    assert.ok(
      await permissionsStep.isAccessSelectorEnabled(ROLE_NAME),
      'The access selector of the added entry should be enabled',
    );
    await permissionsStep.waitForNextButtonEnabled();
    // 5. Summary: the bound application is named here, and the unfinished configuration holds
    //    nothing back - Create is enabled.
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
    assert.deepEqual(
      await summaryStep.getPermissions(),
      Object.assign({}, SEEDED_PERMISSIONS, { [ROLE_NAME]: DEFAULT_ACCESS }),
      'The Permissions row should list the seeded entries and the added role with their levels',
    );
    await summaryStep.waitForCreateButtonDisplayed();
    await summaryStep.waitForCreateButtonEnabled();
    assert.equal(await summaryStep.getNextButtonLabel(), 'Create');
    assert.ok(await summaryStep.isPreviousButtonDisplayed(), 'Previous should be displayed');
    assert.ok(await summaryStep.isPreviousButtonEnabled(), 'Previous should be enabled');
  });

  // An entry added by hand is the user's all the way: its access is picked from the selector, read
  // back on Summary, and the row is gone once Previous led back and the cross was clicked.
  it('GIVEN a group has been added on the Permissions step AND given an access of its own WHEN Summary has been reached THEN the group should be read back with that access AND WHEN Previous has led back AND the entry has been removed THEN only the seeded ones should be left', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ID_PROVIDERS);
    let idProvidersPage = new IdProvidersPage();
    let generalStep = new IdProviderEditorGeneralStepDialog();
    let permissionsStep = new IdProviderEditorPermissionsStepDialog();
    let summaryStep = new IdProviderEditorSummaryStepDialog();
    // 1. General, then on to Permissions.
    await idProvidersPage.clickOnNewButton();
    await generalStep.waitForLoaded();
    await generalStep.typeInDisplayNameInput(NEW_PROVIDER.displayName);
    await generalStep.typeInDescriptionTextArea(NEW_PROVIDER.description);
    await generalStep.waitForNextButtonEnabled();
    await generalStep.clickOnNextButton();
    await permissionsStep.waitForLoaded();
    // 2. The group made in the suite's provider is offered, with that provider's key beside it.
    await permissionsStep.typeInPermissionsFilterInput(GROUP_NAME);
    await permissionsStep.combobox.waitForOptionDisplayed(GROUP_NAME);
    assert.equal(
      await permissionsStep.combobox.getOptionIdProvider(GROUP_NAME),
      ID_PROVIDER.key,
      "The group's option should name the ID provider it was made in",
    );
    await permissionsStep.clickOnPrincipalOption(GROUP_NAME);
    await permissionsStep.clickOnApplyButton();
    await permissionsStep.waitForPrincipalSelected(GROUP_NAME);
    assert.equal(
      await permissionsStep.getAccess(GROUP_NAME),
      DEFAULT_ACCESS,
      'The added entry should start at the default access',
    );
    // 3. Its access is the user's to pick: the selector offers every level, widening.
    await permissionsStep.clickOnAccessSelector(GROUP_NAME);
    assert.deepEqual(
      await permissionsStep.getAccessOptions(),
      Object.values(appConst.ID_PROVIDER_ACCESS),
      'The selector should offer every access level, widening',
    );
    await permissionsStep.clickOnAccessOption(PICKED_ACCESS);
    await permissionsStep.waitForAccess(GROUP_NAME, PICKED_ACCESS);
    await settingsUtils.saveScreenshot('idprovider-editor-permissions-step-group-entry');
    // 4. Summary reads the group back with the access it was given, beside the seeded entries.
    await permissionsStep.clickOnNextAndWaitForSummaryStep();
    await summaryStep.waitForLoaded();
    assert.deepEqual(
      await summaryStep.getPermissions(),
      Object.assign({}, SEEDED_PERMISSIONS, { [GROUP_NAME]: PICKED_ACCESS }),
      'The Permissions row should list the group with the access it was given',
    );
    assert.equal(
      await summaryStep.getAccess(GROUP_NAME),
      PICKED_ACCESS,
      'The group should be read back with the access picked for it',
    );
    // 5. Previous leads back to Permissions, which still holds the entry as it was left.
    await summaryStep.clickOnPreviousButton();
    await permissionsStep.waitForLoaded();
    await permissionsStep.waitForPrincipalSelected(GROUP_NAME);
    assert.equal(
      await permissionsStep.getAccess(GROUP_NAME),
      PICKED_ACCESS,
      'The access should survive the walk to Summary and back',
    );
    // 6. The cross removes it, and the seeded entries are left untouched.
    await permissionsStep.removePrincipal(GROUP_NAME);
    await permissionsStep.combobox.waitForOptionNotSelected(GROUP_NAME);
    assert.deepEqual(
      await permissionsStep.getPermissions(),
      SEEDED_PERMISSIONS,
      'Only the seeded entries should be left once the group has been removed',
    );
    await permissionsStep.waitForNextButtonEnabled();
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

  after(async () => {
    for (const principal of [USER, GROUP]) {
      if (principal !== undefined) {
        await settingsUtils.deletePrincipalsViaApi(principal).catch((err) => {
          console.log(`'${principal.displayName}' was not cleaned up: ` + err);
        });
      }
    }
    if (ID_PROVIDER !== undefined) {
      await settingsUtils.deleteIdProviderViaApi(ID_PROVIDER).catch((err) => {
        console.log('The ID provider was not cleaned up: ' + err);
      });
    }
  });
});
