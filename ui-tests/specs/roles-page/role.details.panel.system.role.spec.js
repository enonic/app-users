/**
 * Created on 23.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const RolesPage = require('../../page_objects/roles/roles.page');
const RoleDetails = require('../../page_objects/roles/role.details');
const RoleEditorUsersStepDialog = require('../../page_objects/roles/role-dialog/role.editor.users.step.dialog');

describe('role.details.panel.system.role.spec - the details panel of Administrator: the platform owns the role, so the panel says so and its Edit is locked, and the membership the platform refuses to end keeps its Remove button disabled in the editor', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const ADMINISTRATOR = appConst.SYSTEM_ROLES.ADMINISTRATOR;
  const SUPER_USER = appConst.systemUsersDisplayName.SUPER_USER;

  // A platform role shows two fields an operator's own role never does: the Type it is recognised by
  // and the Editing line that says why nothing here can change it.
  it('WHEN the Administrator role has been clicked THEN the details panel should show it as a locked system role', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    let roleDetails = new RoleDetails();
    // 1. Select the role: the panel opens with the display name and the name under it.
    await rolesPage.clickOnRowByDisplayName(ADMINISTRATOR);
    await roleDetails.waitForTitle(ADMINISTRATOR);
    assert.equal(await roleDetails.getName(), appConst.roleName.ADMINISTRATOR);
    // 2. Verify the three fields of the Role section.
    assert.equal(
      await roleDetails.getType(),
      RoleDetails.SYSTEM_TYPE,
      "A role the platform ships with is typed 'System'",
    );
    assert.equal(
      await roleDetails.getDescription(),
      RoleDetails.NO_DESCRIPTION,
      'Administrator carries no description',
    );
    assert.equal(
      await roleDetails.getEditing(),
      RoleDetails.EDITING.PLATFORM,
      'The Editing field should say the platform manages the role',
    );
    // 3. The Edit button of the section stays, disabled with a lock on it: the platform owns the
    //    role's name and description.
    assert.ok(
      await roleDetails.isEditButtonDisplayed(),
      'The Edit button of a locked role is shown, not removed',
    );
    assert.ok(
      !(await roleDetails.isEditButtonEnabled()),
      'The Edit button should be disabled for a platform role',
    );
    // 4. `su` is a user of the system ID provider, which is what a service account is: it is listed
    //    under Service accounts and the Users section stays empty.
    assert.ok(
      (await roleDetails.getServiceAccounts()).includes(SUPER_USER),
      `'${SUPER_USER}' should be listed under Service accounts`,
    );
    assert.equal(await roleDetails.getUsersCount(), 0, 'Administrator holds no ordinary user');
  });

  // The members are the operator's to change - 'Edit users' is enabled - but one of them is not:
  // the platform refuses to part `su` and Administrators, so that row's Remove button is disabled.
  it("GIVEN the Administrator role is selected WHEN 'Edit users' has been clicked THEN the Users step should list Super User with its Remove button disabled", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    let roleDetails = new RoleDetails();
    let usersStep = new RoleEditorUsersStepDialog();
    await rolesPage.clickOnRowByDisplayName(ADMINISTRATOR);
    await roleDetails.waitForTitle(ADMINISTRATOR);
    // 1. 'Edit users': the editor opens on the Users step alone, titled by the role.
    await roleDetails.clickOnEditUsersButton();
    await usersStep.waitForLoaded();
    assert.equal(await usersStep.getTitle(), ADMINISTRATOR, 'The dialog is titled by the role');
    assert.equal(await usersStep.getStepTitle(), 'Users');
    assert.ok(await usersStep.isStepView(), 'One step, no stepper dots');
    // 2. The members arrive with a read of their own, so the picked row is waited for.
    await usersStep.waitForUserSelected(SUPER_USER);
    // 3. Verify that the Remove button of the pinned member is disabled.
    assert.ok(
      !(await usersStep.combobox.isRemoveButtonEnabled(SUPER_USER)),
      `The Remove button of '${SUPER_USER}' should be disabled in Administrator`,
    );
    // 4. Nothing changed, so Save is disabled and Cancel closes the dialog outright.
    await usersStep.waitForSaveButtonDisabled();
    await usersStep.clickOnCancelButtonAndWaitForClosed();
  });

  // Users and service accounts are both users of the role, kept in one list: the two sections of the
  // panel open the same step of the editor, so it answers the same way from either.
  it("GIVEN the Administrator role is selected WHEN 'Edit service accounts' has been clicked THEN the same Users step should open with Super User's Remove button disabled", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let rolesPage = new RolesPage();
    let roleDetails = new RoleDetails();
    let usersStep = new RoleEditorUsersStepDialog();
    await rolesPage.clickOnRowByDisplayName(ADMINISTRATOR);
    await roleDetails.waitForTitle(ADMINISTRATOR);
    // 1. 'Edit service accounts' opens the Users step, not a step of its own.
    await roleDetails.clickOnEditServiceAccountsButton();
    await usersStep.waitForLoaded();
    assert.equal(await usersStep.getTitle(), ADMINISTRATOR, 'The dialog is titled by the role');
    assert.equal(await usersStep.getStepTitle(), 'Users');
    assert.ok(await usersStep.isStepView(), 'One step, no stepper dots');
    // 2. The service account is listed among the picked users, with the same locked Remove button.
    await usersStep.waitForUserSelected(SUPER_USER);
    assert.ok(
      !(await usersStep.combobox.isRemoveButtonEnabled(SUPER_USER)),
      `The Remove button of '${SUPER_USER}' should be disabled from this step too`,
    );
    // 3. Nothing changed, so Save is disabled and Cancel closes the dialog outright.
    await usersStep.waitForSaveButtonDisabled();
    await usersStep.clickOnCancelButtonAndWaitForClosed();
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
