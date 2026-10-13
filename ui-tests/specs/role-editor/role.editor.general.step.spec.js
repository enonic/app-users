/**
 * Created on 13.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const RolesPage = require('../../page_objects/roles/roles.page');
const RoleEditorGeneralStepDialog = require('../../page_objects/roles/role-dialog/role.editor.general.step.dialog');
const userItemsBuilder = require('../../libs/users.items.builder');

describe("role.editor.general.step.spec - the role editor's General step: the ID follows the display name, Next waits for both, and a cleared ID is reported", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  const ROLE_NAME = userItemsBuilder.generateRandomName('role');
  const ID_REQUIRED = 'ID is required';

  // A new role opens on General - there is no ID provider step, every role is the system's. The
  // step asks for a display name and an ID; the ID is derived from the display name as it is typed,
  // so the display name alone answers both. The description is optional.
  it('GIVEN the role editor is opened THEN Next should be disabled AND WHEN the display name has been typed THEN the ID should be derived from it AND Next should be enabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    let generalStep = new RoleEditorGeneralStepDialog();
    let role = userItemsBuilder.buildRole({ displayName: ROLE_NAME });
    // 1. New: the editor opens on General.
    await rolesPage.clickOnNewButton();
    await generalStep.waitForLoaded();
    assert.equal(await generalStep.getStepTitle(), 'General');
    // 2. Empty: the inputs are there, nothing is reported yet, Next is disabled.
    assert.ok(await generalStep.isDisplayNameInputDisplayed(), 'Display name input');
    assert.ok(await generalStep.isIdInputDisplayed(), 'ID input');
    assert.ok(await generalStep.isDescriptionTextAreaDisplayed(), 'Description text area');
    assert.equal(await generalStep.getTextInDisplayNameInput(), '');
    assert.equal(await generalStep.getTextInIdInput(), '');
    assert.deepEqual(
      await generalStep.getValidationMessages(),
      [],
      'No message should be shown before an input is touched',
    );
    await generalStep.waitForNextButtonDisabled();
    // 3. The display name alone: the ID follows it, Next is enabled.
    await generalStep.typeInDisplayNameInput(role.displayName);
    assert.equal(
      await generalStep.getTextInIdInput(),
      role.id,
      'The ID should be derived from the display name',
    );
    await generalStep.waitForNextButtonEnabled();
    assert.deepEqual(
      await generalStep.getValidationMessages(),
      [],
      'No message should be shown for valid data',
    );
  });

  // The derived ID can be edited; emptied, it is required like any other. The message is shown
  // once the input has been left (Tab), and Next is disabled while it stands.
  it('GIVEN the display name has been typed on the General step WHEN the derived ID has been cleared AND the input left THEN a validation message should be shown AND Next should be disabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    let generalStep = new RoleEditorGeneralStepDialog();
    let role = userItemsBuilder.buildRole({ displayName: ROLE_NAME });
    // 1. New, then the display name: the ID is derived, Next is enabled.
    await rolesPage.clickOnNewButton();
    await generalStep.waitForLoaded();
    await generalStep.typeInDisplayNameInput(role.displayName);
    await generalStep.waitForNextButtonEnabled();
    // 2. Clear the ID and leave the input: the message appears, Next is disabled.
    await generalStep.clearIdInput();
    await settingsUtils.doPressTabKey();
    await generalStep.waitForNextButtonDisabled();
    await generalStep.waitForValidationMessage(ID_REQUIRED);
    assert.equal(
      await generalStep.getTextInDisplayNameInput(),
      role.displayName,
      'The display name should be untouched',
    );
    // 3. The ID again: the message goes, Next is enabled.
    await generalStep.typeInIdInput(role.id);
    await generalStep.waitForValidationMessageGone(ID_REQUIRED);
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
