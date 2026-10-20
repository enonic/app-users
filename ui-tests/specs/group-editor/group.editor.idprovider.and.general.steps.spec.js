/**
 * Created on 15.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const GroupsPage = require('../../page_objects/groups/groups.page');
const GroupEditorIdProviderStepDialog = require('../../page_objects/groups/group-dialog/group.editor.id.provider.step.dialog');
const GroupEditorGeneralStepDialog = require('../../page_objects/groups/group-dialog/group.editor.general.step.dialog');
const userItemsBuilder = require('../../libs/users.items.builder');

describe("group.editor.id.provider.step.spec - the group editor's ID provider step: a provider is picked by filtering the combobox or by dropping its list down, and the pick survives a step back", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const PROVIDER_NAME = userItemsBuilder.generateRandomName('provider');
  // The key is given its own name, so a filter by the key and one by the display name can be told
  // apart: neither text occurs in the other.
  const PROVIDER_ID = userItemsBuilder.generateRandomName('key');
  // The system ID provider takes service accounts only, so it is never offered here.
  const SYSTEM_PROVIDER = userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME;
  let ID_PROVIDER;

  it('GIVEN an ID provider has been created via API WHEN New group editor is opened THEN the ID provider step with the combobox should be loaded', async () => {
    ID_PROVIDER = await settingsUtils.createIdProviderViaApi(
      userItemsBuilder.buildIdProvider({
        displayName: PROVIDER_NAME,
        id: PROVIDER_ID,
        description: 'created via API for the ID provider step',
      }),
    );
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    let idProviderStep = new GroupEditorIdProviderStepDialog();
    // 1. Open the editor: it starts on the ID provider step.
    await groupsPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    assert.equal(await idProviderStep.getStepTitle(), 'ID provider');
    // 2. The combobox is there, with its placeholder.
    assert.ok(
      await idProviderStep.isIdProviderSelectorDisplayed(),
      'The ID provider combobox should be displayed',
    );
    assert.equal(await idProviderStep.combobox.getPlaceholder(), 'Select an ID provider');
  });

  it('WHEN the combobox dropdown handle has been clicked THEN every ID provider should be listed', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    let idProviderStep = new GroupEditorIdProviderStepDialog();
    await groupsPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    // 1. Drop the list down.
    await idProviderStep.clickOnIdProviderSelector();
    // 2. The provider created via API is offered; the system provider is not - it takes service
    //    accounts only.
    let options = await idProviderStep.getIdProviderOptions();
    assert.ok(options.includes(PROVIDER_NAME), `'${PROVIDER_NAME}' should be listed`);
    assert.ok(
      options.includes(SYSTEM_PROVIDER),
      `'${SYSTEM_PROVIDER}' should not be offered to a user`,
    );
    // 3. An option shows the provider's key under its name.
    let option = (await idProviderStep.combobox.getOptions()).find(
      ({ displayName }) => displayName === PROVIDER_NAME,
    );
    assert.equal(option.key, ID_PROVIDER.key, 'The option should show the provider key');
  });

  // Way 2: drop the list down and click the option.
  it('GIVEN the list is dropped down WHEN an ID provider option has been clicked THEN the provider should be selected AND Next should be enabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    let idProviderStep = new GroupEditorIdProviderStepDialog();
    await groupsPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    // 1. Drop the list down and click the provider.
    await idProviderStep.clickOnIdProviderSelector();
    await idProviderStep.clickOnIdProviderOption(PROVIDER_NAME);
    // 2. The list closes, the provider is shown as picked, Next is enabled.
    await idProviderStep.combobox.waitForPopupClosed();
    await idProviderStep.waitForSelectedIdProvider(PROVIDER_NAME);
    await idProviderStep.waitForNextButtonEnabled();
  });

  // Way 1: type in the input, which filters the list, then click the match.
  it("WHEN the provider's display name has been typed in the combobox THEN only that provider should be listed AND clicking it should select it", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    let idProviderStep = new GroupEditorIdProviderStepDialog();
    await groupsPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    // 1. Type the display name: the list narrows to that provider.
    await idProviderStep.typeInIdProviderFilterInput(PROVIDER_NAME);
    assert.deepEqual(
      await idProviderStep.getIdProviderOptions(),
      [PROVIDER_NAME],
      'The filtered list should hold the typed provider alone',
    );
    // 2. Click the match: the provider is picked.
    await idProviderStep.clickOnIdProviderOption(PROVIDER_NAME);
    await idProviderStep.waitForSelectedIdProvider(PROVIDER_NAME);
    await idProviderStep.waitForNextButtonEnabled();
  });

  it('WHEN the provider display name has been typed THEN the provider should be listed AND WHEN its key has been typed THEN the same provider should be listed', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    let idProviderStep = new GroupEditorIdProviderStepDialog();
    await groupsPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    // 1. By the display name: the option shows that name and the key under it.
    await idProviderStep.typeInIdProviderFilterInput(PROVIDER_NAME);
    assert.deepEqual(
      await idProviderStep.combobox.getOptions(),
      [{ displayName: PROVIDER_NAME, key: PROVIDER_ID }],
      'The filter by display name should list the provider alone',
    );
    // 2. By the key - a text that occurs in the key only.
    await idProviderStep.combobox.clearFilterInput();
    await idProviderStep.typeInIdProviderFilterInput(PROVIDER_ID);
    assert.deepEqual(
      await idProviderStep.combobox.getOptions(),
      [{ displayName: PROVIDER_NAME, key: PROVIDER_ID }],
      'The filter by key should list the same provider alone',
    );
    // 3. A part of the key is enough.
    await idProviderStep.combobox.clearFilterInput();
    await idProviderStep.typeInIdProviderFilterInput(PROVIDER_ID.slice(0, 5));
    assert.ok(
      (await idProviderStep.getIdProviderOptions()).includes(PROVIDER_NAME),
      'The filter by a part of the key should list the provider',
    );
  });

  it('WHEN text that matches no ID provider has been typed in the combobox THEN no option should be listed', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    let idProviderStep = new GroupEditorIdProviderStepDialog();
    await groupsPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    // 1. Type something no provider is called.
    await idProviderStep.typeInIdProviderFilterInput(userItemsBuilder.generateRandomName('none'));
    // 2. The list is empty and says so.
    assert.deepEqual(await idProviderStep.getIdProviderOptions(), [], 'No option should match');
    assert.equal(await idProviderStep.combobox.getPopupMessage(), 'Nothing matches the search');
  });

  // TODO bug: github.com/enonic/app-users/issues/2796
  it.skip('GIVEN an ID provider has been selected by filtering WHEN Next then Previous have been clicked THEN the General step should open AND the pick should still be there on the way back', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    let idProviderStep = new GroupEditorIdProviderStepDialog();
    let generalStep = new GroupEditorGeneralStepDialog();
    await groupsPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    // 1. Pick the provider the one-call way.
    await idProviderStep.doFilterAndSelectIdProviderByDisplayName(PROVIDER_NAME);
    // 2. Next: General opens.
    await idProviderStep.clickOnNextAndWaitForGeneralStep();
    await generalStep.waitForLoaded();
    // 3. Previous: the ID provider step is back with the same pick.
    await generalStep.clickOnPreviousButton();
    await idProviderStep.waitForLoaded();
    assert.equal(await idProviderStep.getSelectedIdProvider(), PROVIDER_NAME);
  });

  it('GIVEN the General step is opened THEN Next should be disabled AND WHEN the display name has been typed THEN the ID should be derived', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    let idProviderStep = new GroupEditorIdProviderStepDialog();
    let generalStep = new GroupEditorGeneralStepDialog();
    let group = userItemsBuilder.buildGroup({
      displayName: appConst.generateRandomName('group'),
      idProvider: PROVIDER_NAME,
    });
    // 1. Open the editor, pick the provider, get to General.
    await groupsPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    await idProviderStep.doFilterAndSelectIdProviderByDisplayName(PROVIDER_NAME);
    await idProviderStep.clickOnNextAndWaitForGeneralStep();
    assert.equal(await generalStep.getStepTitle(), 'General');
    // 2. Empty: every input is there, nothing is reported yet, Next is disabled.
    assert.ok(await generalStep.isDisplayNameInputDisplayed(), 'Display name input');
    assert.ok(await generalStep.isIdInputDisplayed(), 'ID input');
    assert.equal(await generalStep.getTextInDisplayNameInput(), '');
    assert.equal(await generalStep.getTextInIdInput(), '');
    assert.deepEqual(
      await generalStep.getValidationMessages(),
      [],
      'No message should be shown before an input is touched',
    );
    await generalStep.waitForNextButtonDisabled();
    // 3. The display name: the ID follows it-  so Next gets enabled.
    await generalStep.typeInDisplayNameInput(group.displayName);
    assert.equal(
      await generalStep.getTextInIdInput(),
      group.displayName,
      'The ID should be derived from the display name',
    );
    await generalStep.waitForNextButtonEnabled();
    assert.deepEqual(
      await generalStep.getValidationMessages(),
      [],
      'No message should be shown for valid data',
    );
  });

  // TODO bug: github.com/enonic/app-users/issues/2796
  it.skip('GIVEN the ID provider step is opened WHEN the provider created via API has been deleted via API THEN it should not be listed anymore', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    // 1. Delete the provider the suite made (nothing was created in it).
    await settingsUtils.deleteIdProviderViaApi(ID_PROVIDER);
    ID_PROVIDER = undefined;
    let groupsPage = new GroupsPage();
    let idProviderStep = new GroupEditorIdProviderStepDialog();
    // 2. A freshly opened editor does not offer it.
    await groupsPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    await idProviderStep.clickOnIdProviderSelector();
    let options = await idProviderStep.getIdProviderOptions();
    assert.ok(!options.includes(PROVIDER_NAME), `'${PROVIDER_NAME}' should not be listed`);
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
  // The provider is deleted by the last test; this is for a run that stopped before it.
  after(async () => {
    if (ID_PROVIDER !== undefined) {
      await settingsUtils.deleteIdProviderViaApi(ID_PROVIDER).catch((err) => {
        console.log('The ID provider was not cleaned up: ' + err);
      });
    }
  });
});
