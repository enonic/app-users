/**
 * Created on 14.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const UserEditorCredentialStepDialog = require('../../page_objects/users/user-dialog/user.editor.credentials.step.dialog');
const UserEditorRolesStepDialog = require('../../page_objects/users/user-dialog/user.editor.roles.step.dialog');
const UserEditorGroupsStepDialog = require('../../page_objects/users/user-dialog/user.editor.groups.step.dialog');
const UserEditorSummaryStepDialog = require('../../page_objects/users/user-dialog/user.editor.summary.step.dialog');
const userItemsBuilder = require('../../libs/users.items.builder');

describe("user.editor.roles.group.summary.step.spec - the user editor's Roles, Groups and Summary steps: a role is picked and unpicked in the picker's list", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  const PROVIDER_NAME = userItemsBuilder.generateRandomName('provider');
  const USER_NAME = userItemsBuilder.generateRandomName('user');
  const GROUP_ROLES = ['role:system.user.admin'];
  // A system role every instance has, picked on the Roles step by its display name.
  const ROLE = appConst.SYSTEM_ROLES.AUDIT_LOG;
  let USER = userItemsBuilder.buildUser({
    displayName: USER_NAME,
    idProvider: PROVIDER_NAME,
    email: userItemsBuilder.generateEmail(USER_NAME),
  });
  let ID_PROVIDER;
  let GROUP;
  let GROUP_SYSTEM;

  // The ID provider, General and Credentials steps come before Roles: a provider to pick on the
  // first, the display name the second requires. The groups are for the Groups step: one in the
  // user's provider, one in the system's.
  it('GIVEN the suite starts THEN an ID provider for its user AND two groups should be created via the API', async () => {
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

    GROUP_SYSTEM = await settingsUtils.createGroupViaApi(
      userItemsBuilder.buildGroup({
        idProvider: userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME,
        displayName: userItemsBuilder.generateRandomName('sys_group'),
        roles: GROUP_ROLES,
      }),
    );

    GROUP = await settingsUtils.createGroupViaApi(
      userItemsBuilder.buildGroup({
        idProvider: PROVIDER_NAME,
        displayName: userItemsBuilder.generateRandomName('group'),
        roles: GROUP_ROLES,
      }),
    );
  });

  // The picker stages a tick until Apply: a role ticked in the list and applied is picked; the same
  // option clicked again unticks it, and Apply takes the role out again.
  it("GIVEN the Roles step is opened WHEN the list has been dropped down AND 'Audit Log' has been clicked AND applied THEN the role should be picked AND WHEN the same option has been clicked again AND applied THEN no role should be picked", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let credentialsStep = new UserEditorCredentialStepDialog();
    let rolesStep = new UserEditorRolesStepDialog();
    // 1. Open the editor and get to Roles: the provider is picked, the display name and the email
    //    typed, Credentials skipped - a password is optional.
    await settingsUtils.openNewUserEditorOnCredentials(USER);
    await credentialsStep.clickOnNextButton();
    await rolesStep.waitForLoaded();
    assert.equal(await rolesStep.getStepTitle(), 'Roles');
    assert.deepEqual(await rolesStep.getSelectedRoles(), [], 'No role should be picked yet');
    // 2. Drop the list down: the system roles are offered, none ticked.
    await rolesStep.clickOnRolesDropdownHandle();
    let roleOptions = await rolesStep.getRoleOptions();
    assert.ok(roleOptions.includes(ROLE), `'${ROLE}' should be offered`);
    await rolesStep.combobox.waitForOptionChecked(ROLE, false);
    // 3. Tick the role, then Apply: the role is listed under the input.
    await rolesStep.clickOnRoleOption(ROLE);
    await rolesStep.combobox.waitForOptionChecked(ROLE);
    await rolesStep.clickOnApplyButton();
    await rolesStep.waitForRoleSelected(ROLE);
    assert.deepEqual(await rolesStep.getSelectedRoles(), [ROLE], 'The role should be picked');
    // 4. Drop the list down again: the picked role is shown ticked. Click it to untick, then Apply:
    //    nothing is picked any more.
    await rolesStep.clickOnRolesDropdownHandle();
    await rolesStep.combobox.waitForOptionChecked(ROLE);
    await rolesStep.clickOnRoleOption(ROLE);
    await rolesStep.combobox.waitForOptionChecked(ROLE, false);
    await rolesStep.clickOnApplyButton();
    await rolesStep.combobox.waitForOptionNotSelected(ROLE);
    assert.deepEqual(await rolesStep.getSelectedRoles(), [], 'No role should be picked');
    // 5. Roles are optional: Next is still enabled.
    await rolesStep.waitForNextButtonEnabled();
  });

  // The other way in and out: the role is found by typing its name into the filter and applied,
  // and taken out with the Remove icon of its row under the input - no list this time.
  it("GIVEN the Roles step is opened WHEN 'Audit Log' has been picked by filtering AND applied THEN the role should be picked AND WHEN its Remove icon has been clicked THEN no role should be picked", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let credentialsStep = new UserEditorCredentialStepDialog();
    let rolesStep = new UserEditorRolesStepDialog();
    // 1. Open the editor and get to Roles: the provider is picked, the display name and the email
    //    typed, Credentials skipped - a password is optional.
    await settingsUtils.openNewUserEditorOnCredentials(USER);
    await credentialsStep.clickOnNextButton();
    await rolesStep.waitForLoaded();
    assert.deepEqual(await rolesStep.getSelectedRoles(), [], 'No role should be picked yet');
    // 2. Filter by the role's name, tick the match, Apply: the role is listed under the input.
    await rolesStep.addRole(ROLE);
    await rolesStep.waitForRoleSelected(ROLE);
    assert.deepEqual(await rolesStep.getSelectedRoles(), [ROLE], 'The role should be picked');
    assert.ok(
      await rolesStep.combobox.isRemoveButtonEnabled(ROLE),
      'The picked role should have an enabled Remove icon',
    );
    // 3. Remove: the row goes, nothing is picked.
    await rolesStep.removeRole(ROLE);
    await rolesStep.combobox.waitForOptionNotSelected(ROLE);
    assert.deepEqual(await rolesStep.getSelectedRoles(), [], 'No role should be picked');
    // 4. Roles are optional: Next is still enabled.
    await rolesStep.waitForNextButtonEnabled();
  });

  // The picker offers the groups of the user's ID provider; 'Show groups from all ID providers' widens
  // it to every provider, the system's included.
  it("GIVEN the Groups step is opened WHEN the list has been dropped down THEN only the group of the user's ID provider should be offered AND WHEN 'Show groups from all ID providers' has been pressed THEN the system group should be offered too", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let credentialsStep = new UserEditorCredentialStepDialog();
    let rolesStep = new UserEditorRolesStepDialog();
    let groupsStep = new UserEditorGroupsStepDialog();
    // 1. Open the editor and get to Roles: the provider is picked, the display name and the email
    //    typed, Credentials skipped - a password is optional.
    await settingsUtils.openNewUserEditorOnCredentials(USER);
    await credentialsStep.clickOnNextButton();
    await rolesStep.waitForLoaded();
    // 2. No role: on to Groups.
    await rolesStep.clickOnNextButton();
    await groupsStep.waitForLoaded();
    assert.equal(await groupsStep.getStepTitle(), 'Groups');
    assert.ok(
      !(await groupsStep.isShowAllGroupsTogglePressed()),
      "'Show groups from all ID providers' should not be pressed to begin with",
    );
    // 3. Drop the list down: only the group of the user's ID provider is offered - the provider was
    //    made for this suite, so that group is its only one. The groups come from the server after
    //    the click, so the list is read once the group is shown.
    await groupsStep.clickOnGroupsDropdownHandle();
    await groupsStep.waitForGroupOptionDisplayed(GROUP.displayName);
    assert.deepEqual(
      await groupsStep.getGroupOptions(),
      [GROUP.displayName],
      "Only the group of the user's ID provider should be offered",
    );
    // 4. 'Show groups from all ID providers': the system group is offered too, the user's is still
    //    there. The click lands outside the popup and closes it; the wait opens it again.
    await groupsStep.clickOnShowAllGroupsToggle();
    await groupsStep.waitForShowAllGroupsTogglePressed();
    await groupsStep.waitForGroupOptionDisplayed(GROUP_SYSTEM.displayName);
    let groupOptions = await groupsStep.getGroupOptions();
    assert.ok(
      groupOptions.includes(GROUP.displayName),
      "The user's group should still be offered with every provider shown",
    );
  });

  // The Summary step reads the answers back: the provider, 'Display name (id)', the email, the role
  // and the group. A row with nothing to say is absent - no password was set, so there is no
  // Credentials row. Create is offered but not clicked: the suite leaves no user behind.
  it('GIVEN a role AND a group have been picked WHEN the Summary step is opened THEN the ID provider, the user, the email, the role AND the group should be read back AND no Credentials row should be shown AND Create should be enabled', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.USERS);
    let credentialsStep = new UserEditorCredentialStepDialog();
    let rolesStep = new UserEditorRolesStepDialog();
    let groupsStep = new UserEditorGroupsStepDialog();
    let summaryStep = new UserEditorSummaryStepDialog();
    // 1. Open the editor and get to Roles: the provider is picked, the display name and the email
    //    typed, Credentials skipped - a password is optional.
    await settingsUtils.openNewUserEditorOnCredentials(USER);
    await credentialsStep.clickOnNextButton();
    await rolesStep.waitForLoaded();
    // 2. Pick the role by filtering, then on to Groups.
    await rolesStep.addRole(ROLE);
    await rolesStep.waitForRoleSelected(ROLE);
    await rolesStep.clickOnNextButton();
    await groupsStep.waitForLoaded();
    // 3. Pick the group of the user's provider by filtering, then on to Summary.
    await groupsStep.addGroup(GROUP.displayName);
    await groupsStep.waitForGroupSelected(GROUP.displayName);
    await groupsStep.clickOnNextButton();
    await summaryStep.waitForLoaded();
    assert.equal(await summaryStep.getStepTitle(), 'Summary');
    // 4. The rows read the steps back.
    assert.equal(await summaryStep.getIdProvider(), PROVIDER_NAME);
    assert.equal(await summaryStep.getUser(), `${USER.displayName} (${USER.id})`);
    assert.equal(await summaryStep.getEmail(), USER.email);
    assert.ok(
      !(await summaryStep.isRowDisplayed(UserEditorSummaryStepDialog.LABEL.CREDENTIALS)),
      'The Credentials row should be absent when no password is set',
    );
    assert.deepEqual(await summaryStep.getRoles(), [ROLE], 'The role should be read back');
    assert.deepEqual(
      await summaryStep.getGroups(),
      [GROUP.displayName],
      'The group should be read back',
    );
    // 5. The last step: Create instead of Next, Previous still there. Nothing is created here.
    await summaryStep.waitForCreateButtonEnabled();
    assert.ok(await summaryStep.isPreviousButtonEnabled(), 'Previous should be enabled');
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
  // No user was created in the provider - every editor here was closed without Create. The groups
  // go first: a provider that still holds one cannot be deleted.
  after(async () => {
    for (const group of [GROUP, GROUP_SYSTEM]) {
      if (group !== undefined) {
        await settingsUtils.deleteGroupViaApi(group).catch((err) => {
          console.log(`The group '${group.displayName}' was not cleaned up: ` + err);
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
