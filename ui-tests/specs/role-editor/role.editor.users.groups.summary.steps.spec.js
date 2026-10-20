/**
 * Created on 20.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const userItemsBuilder = require('../../libs/users.items.builder');
const RoleEditorStepDialog = require('../../page_objects/roles/role-dialog/role.editor.step.dialog');
const RoleEditorGeneralStepDialog = require('../../page_objects/roles/role-dialog/role.editor.general.step.dialog');
const RoleEditorUsersStepDialog = require('../../page_objects/roles/role-dialog/role.editor.users.step.dialog');
const RoleEditorGroupsStepDialog = require('../../page_objects/roles/role-dialog/role.editor.groups.step.dialog');
const RoleEditorSummaryStepDialog = require('../../page_objects/roles/role-dialog/role.editor.summary.step.dialog');

describe("role.editor.users.groups.summary.steps.spec - the role editor's Users, Groups and Summary steps: both pickers span every ID provider, both steps are optional, a step walked back to still holds what was picked on it, and Summary reads every answer back", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  const PROVIDER_NAME = userItemsBuilder.generateRandomName('provider');
  const USER_NAME = userItemsBuilder.generateRandomName('user');
  const SERVICE_ACCOUNT_NAME = userItemsBuilder.generateRandomName('account');
  // Both are system roles every instance has.
  const ACCOUNT_ROLES = [appConst.SYSTEM_ROLES.ADMIN_CONSOLE, appConst.SYSTEM_ROLES.USERS_APP];
  const GROUP_ROLES = ['role:system.user.admin'];
  const NO_MATCHES = 'Nothing matches the search';
  // The role the editor is opened for. It is never created: every editor here is closed without
  // Create.
  const NEW_ROLE = userItemsBuilder.buildRole({
    displayName: userItemsBuilder.generateRandomName('role'),
  });
  // What the create*ViaApi() calls return, with the keys the deletes at the end need.
  let ID_PROVIDER;
  let USER;
  let GROUP;
  let GROUP_SYSTEM;
  let SERVICE_ACCOUNT;

  // A role lives in the system store and its members may come from anywhere, so both of its pickers
  // span every ID provider: a user and a group are made in a provider of the suite's own, a service
  // account and a group in the system's.
  it('GIVEN the suite starts THEN an ID provider with a user and a group in it AND a service account and a group in the system ID provider should be created via the API', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
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
        idProvider: PROVIDER_NAME,
        displayName: userItemsBuilder.generateRandomName('group'),
        roles: GROUP_ROLES,
      }),
    );
    GROUP_SYSTEM = await settingsUtils.createGroupViaApi(
      userItemsBuilder.buildGroup({
        idProvider: userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME,
        displayName: userItemsBuilder.generateRandomName('sys_group'),
        roles: GROUP_ROLES,
      }),
    );
    SERVICE_ACCOUNT = await settingsUtils.createServiceAccountViaApi(
      userItemsBuilder.buildServiceAccount({
        displayName: SERVICE_ACCOUNT_NAME,
        email: userItemsBuilder.generateEmail(SERVICE_ACCOUNT_NAME),
        roles: ACCOUNT_ROLES,
      }),
    );
  });

  // The Users step offers the users of every provider, a service account among them - an account is
  // a user of the system provider - but no group: that is what the Groups step is for.
  it("GIVEN the role editor stands on Users WHEN the service account's name has been typed THEN its option should be offered with the system ID provider beside it AND WHEN the user's name has been typed THEN its option should name the provider it was made in AND WHEN a group's name has been typed THEN nothing should match", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let usersStep = new RoleEditorUsersStepDialog();
    // 1. The editor opens on General; the helper fills it and clicks Next.
    await settingsUtils.openNewRoleEditorOnUsers(NEW_ROLE);
    assert.equal(await usersStep.getStepTitle(), 'Users');
    assert.deepEqual(await usersStep.getSelectedUsers(), [], 'No user should be picked yet');
    // 2. Users are optional: Next is enabled with nothing picked.
    await usersStep.waitForNextButtonEnabled();
    // 3. The service account is a user of the system ID provider, so the picker offers it.
    await usersStep.typeInUsersFilterInput(SERVICE_ACCOUNT_NAME);
    await usersStep.waitForUserOptionDisplayed(SERVICE_ACCOUNT_NAME);
    assert.equal(
      await usersStep.getUserOptionIdProvider(SERVICE_ACCOUNT_NAME),
      userItemsBuilder.SYSTEM_ID_PROVIDER,
      "The service account's option should name the system ID provider",
    );
    await usersStep.clickOnUserOption(SERVICE_ACCOUNT_NAME);
    // 4. The user lives in the provider the suite made, and the picker spans every provider.
    await usersStep.clearUsersFilterInput();
    await usersStep.typeInUsersFilterInput(USER_NAME);
    await usersStep.waitForUserOptionDisplayed(USER_NAME);
    assert.equal(
      await usersStep.getUserOptionIdProvider(USER_NAME),
      ID_PROVIDER.key,
      "The user's option should name the ID provider it was made in",
    );
    await usersStep.clickOnUserOption(USER_NAME);
    // 5. Apply hands both over at once - the ticks were staged until now - and the picked rows
    //    appear under the input.
    await usersStep.clickOnApplyButton();
    await usersStep.waitForUserSelected(SERVICE_ACCOUNT_NAME);
    await usersStep.waitForUserSelected(USER_NAME);
    assert.deepEqual(
      new Set(await usersStep.getSelectedUsers()),
      new Set([SERVICE_ACCOUNT_NAME, USER_NAME]),
      'The service account and the user should be picked',
    );
    // 6. A group is not a user: the Users picker never offers one, whichever provider it is in.
    await usersStep.clearUsersFilterInput();
    await usersStep.typeInUsersFilterInput(GROUP.displayName);
    await usersStep.combobox.waitForPopupMessage(NO_MATCHES);
    assert.deepEqual(
      await usersStep.getUserOptions(),
      [],
      'A group should not be offered in the Users step',
    );
    // 7. Picking changed nothing about Next: it was enabled before and it still is.
    await usersStep.waitForNextButtonEnabled();
  });

  // The Groups step comes after Users. The groups picked there are listed under its own picker, and
  // the dots walk back to a step that still holds what was picked on it.
  it('GIVEN a service account and a user have been picked on Users WHEN two groups have been picked on Groups THEN both should be listed on that step AND WHEN the Users dot has been clicked and Next pressed again THEN what was picked on each step should still be there AND Next should stay enabled all the way', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let usersStep = new RoleEditorUsersStepDialog();
    let groupsStep = new RoleEditorGroupsStepDialog();
    // 1. Users: the service account and the user.
    await settingsUtils.openNewRoleEditorOnUsers(NEW_ROLE);
    await usersStep.addUsers([SERVICE_ACCOUNT_NAME, USER_NAME]);
    await usersStep.waitForUserSelected(SERVICE_ACCOUNT_NAME);
    await usersStep.waitForUserSelected(USER_NAME);
    await usersStep.waitForNextButtonEnabled();
    await usersStep.clickOnNextButton();
    // 2. Groups are optional too: Next is enabled before anything is picked there.
    await groupsStep.waitForLoaded();
    assert.equal(await groupsStep.getStepTitle(), 'Groups');
    assert.deepEqual(await groupsStep.getSelectedGroups(), [], 'No group should be picked yet');
    await groupsStep.waitForNextButtonEnabled();
    // 3. The group made in the suite's provider and the one made in the system's: both are listed
    //    on the step once they have been picked.
    await groupsStep.addGroups([GROUP.displayName, GROUP_SYSTEM.displayName]);
    await groupsStep.waitForGroupSelected(GROUP.displayName);
    await groupsStep.waitForGroupSelected(GROUP_SYSTEM.displayName);
    assert.deepEqual(
      new Set(await groupsStep.getSelectedGroups()),
      new Set([GROUP.displayName, GROUP_SYSTEM.displayName]),
      'Both groups should be listed on the Groups step',
    );
    await groupsStep.waitForNextButtonEnabled();
    // 4. The dots walk back to Users: the two users picked there are still picked.
    await groupsStep.clickOnStepDot(RoleEditorStepDialog.STEP.USERS);
    await usersStep.waitForLoaded();
    assert.equal(
      await usersStep.getSelectedStep(),
      RoleEditorStepDialog.STEP.USERS,
      'The Users dot should be the selected one',
    );
    assert.deepEqual(
      new Set(await usersStep.getSelectedUsers()),
      new Set([SERVICE_ACCOUNT_NAME, USER_NAME]),
      'The users picked before should still be picked',
    );
    // 5. Next leads on to Groups again, which still holds its own two.
    await usersStep.waitForNextButtonEnabled();
    await usersStep.clickOnNextButton();
    await groupsStep.waitForLoaded();
    assert.deepEqual(
      new Set(await groupsStep.getSelectedGroups()),
      new Set([GROUP.displayName, GROUP_SYSTEM.displayName]),
      'The groups picked before should still be picked',
    );
    await groupsStep.waitForNextButtonEnabled();
  });

  // Summary reads the wizard's answers back: the role as 'Display name (id)', the description under
  // it, and the users and groups picked on the two steps before, one icon and name per line. The
  // footer's primary button is 'Create' there rather than 'Next'.
  it("GIVEN the role editor has been walked through with a service account, a user and two groups picked WHEN the Summary step has been reached THEN the role's display name, its description, the users and the groups should be read back AND Create and Previous should be displayed and enabled", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let usersStep = new RoleEditorUsersStepDialog();
    let groupsStep = new RoleEditorGroupsStepDialog();
    let summaryStep = new RoleEditorSummaryStepDialog();
    // 1. General (the helper fills it), Users, Groups, then Summary.
    await settingsUtils.openNewRoleEditorOnUsers(NEW_ROLE);
    await usersStep.addUsers([SERVICE_ACCOUNT_NAME, USER_NAME]);
    await usersStep.waitForUserSelected(SERVICE_ACCOUNT_NAME);
    await usersStep.waitForUserSelected(USER_NAME);
    await usersStep.clickOnNextButton();
    await groupsStep.waitForLoaded();
    await groupsStep.addGroups([GROUP.displayName, GROUP_SYSTEM.displayName]);
    await groupsStep.waitForGroupSelected(GROUP.displayName);
    await groupsStep.waitForGroupSelected(GROUP_SYSTEM.displayName);
    await groupsStep.clickOnNextButton();
    await summaryStep.waitForLoaded();
    assert.equal(await summaryStep.getStepTitle(), 'Summary');
    // 2. What was typed on General: the role is read back as 'Display name (id)', the description
    //    as it was typed.
    assert.equal(
      await summaryStep.getRole(),
      `${NEW_ROLE.displayName} (${NEW_ROLE.id})`,
      'The Role row should read back the display name and the ID typed on General',
    );
    assert.equal(
      await summaryStep.getDescription(),
      NEW_ROLE.description,
      'The Description row should read back the description typed on General',
    );
    // 3. The service account is listed among the users - it is a user of the system ID provider -
    //    and both groups are listed under their own label.
    assert.deepEqual(
      new Set(await summaryStep.getUsers()),
      new Set([SERVICE_ACCOUNT_NAME, USER_NAME]),
      'The Users row should list the service account and the user',
    );
    assert.deepEqual(
      new Set(await summaryStep.getGroups()),
      new Set([GROUP.displayName, GROUP_SYSTEM.displayName]),
      'The Groups row should list both groups',
    );
    // 4. The last step's primary button is Create, not Next, and the role is ready to be made: the
    //    only answers a role needs were given on General. The role itself is never created here.
    await summaryStep.waitForCreateButtonDisplayed();
    await summaryStep.waitForCreateButtonEnabled();
    assert.equal(
      await summaryStep.getNextButtonLabel(),
      'Create',
      "The footer's primary button should be Create on the last step",
    );
    // 5. Previous is there and leads back to Groups, which still holds what was picked on it.
    assert.ok(
      await summaryStep.isPreviousButtonDisplayed(),
      'Previous should be displayed on the Summary step',
    );
    assert.ok(
      await summaryStep.isPreviousButtonEnabled(),
      'Previous should be enabled on the Summary step',
    );
    await summaryStep.clickOnPreviousButton();
    await groupsStep.waitForLoaded();
    assert.deepEqual(
      new Set(await groupsStep.getSelectedGroups()),
      new Set([GROUP.displayName, GROUP_SYSTEM.displayName]),
      'Previous should lead from Summary back to Groups with its groups still picked',
    );
  });

  // Neither step answers a required field, so removing every pick leaves Next where it was; and
  // Previous walks the same way back, down to General, where it is the first step and disabled.
  it('GIVEN users and groups have been picked WHEN every picked user and group has been removed THEN the picked rows should be gone AND Next should stay enabled AND WHEN Previous has been pressed on each step THEN the editor should walk back to General', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.ROLES);
    let generalStep = new RoleEditorGeneralStepDialog();
    let usersStep = new RoleEditorUsersStepDialog();
    let groupsStep = new RoleEditorGroupsStepDialog();
    // 1. Users: the picked rows name the provider each user lives in - the system's for the service
    //    account, the suite's for the user.
    await settingsUtils.openNewRoleEditorOnUsers(NEW_ROLE);
    await usersStep.addUsers([SERVICE_ACCOUNT_NAME, USER_NAME]);
    await usersStep.waitForUserSelected(SERVICE_ACCOUNT_NAME);
    await usersStep.waitForUserSelected(USER_NAME);
    assert.equal(
      await usersStep.getSelectedUserIdProvider(SERVICE_ACCOUNT_NAME),
      userItemsBuilder.SYSTEM_ID_PROVIDER,
      'The picked service account should name the system ID provider',
    );
    assert.equal(
      await usersStep.getSelectedUserIdProvider(USER_NAME),
      ID_PROVIDER.key,
      'The picked user should name the ID provider it was made in',
    );
    // 2. Removing both leaves the step empty, and Next where it was: users are optional.
    await usersStep.removeUser(SERVICE_ACCOUNT_NAME);
    await usersStep.waitForUserNotSelected(SERVICE_ACCOUNT_NAME);
    await usersStep.waitForNextButtonEnabled();
    await usersStep.removeUser(USER_NAME);
    await usersStep.waitForUserNotSelected(USER_NAME);
    assert.deepEqual(await usersStep.getSelectedUsers(), [], 'No user should be picked any more');
    await usersStep.waitForNextButtonEnabled();
    // 3. Groups: the picked rows name their providers the same way.
    await usersStep.clickOnNextButton();
    await groupsStep.waitForLoaded();
    await groupsStep.addGroups([GROUP.displayName, GROUP_SYSTEM.displayName]);
    await groupsStep.waitForGroupSelected(GROUP.displayName);
    await groupsStep.waitForGroupSelected(GROUP_SYSTEM.displayName);
    assert.equal(
      await groupsStep.getSelectedGroupIdProvider(GROUP_SYSTEM.displayName),
      userItemsBuilder.SYSTEM_ID_PROVIDER,
      'The picked group of the system ID provider should name it',
    );
    assert.equal(
      await groupsStep.getSelectedGroupIdProvider(GROUP.displayName),
      ID_PROVIDER.key,
      'The picked group should name the ID provider it was made in',
    );
    // 4. Removing both leaves that step empty too, and Next enabled.
    await groupsStep.removeGroup(GROUP.displayName);
    await groupsStep.waitForGroupNotSelected(GROUP.displayName);
    await groupsStep.waitForNextButtonEnabled();
    await groupsStep.removeGroup(GROUP_SYSTEM.displayName);
    await groupsStep.waitForGroupNotSelected(GROUP_SYSTEM.displayName);
    assert.deepEqual(
      await groupsStep.getSelectedGroups(),
      [],
      'No group should be picked any more',
    );
    await groupsStep.waitForNextButtonEnabled();
    // 5. Previous walks back one step at a time: Groups → Users → General.
    await groupsStep.clickOnPreviousButton();
    await usersStep.waitForLoaded();
    assert.equal(
      await usersStep.getSelectedStep(),
      RoleEditorStepDialog.STEP.USERS,
      'Previous should lead from Groups back to Users',
    );
    await usersStep.clickOnPreviousButton();
    await generalStep.waitForLoaded();
    assert.equal(
      await generalStep.getSelectedStep(),
      RoleEditorStepDialog.STEP.GENERAL,
      'Previous should lead from Users back to General',
    );
    // 6. General is the first step, so there is nowhere further back. What was typed on it is still
    //    there, and Next leads on to Users again.
    assert.ok(
      !(await generalStep.isPreviousButtonEnabled()),
      'Previous should be disabled on the first step',
    );
    assert.equal(
      await generalStep.getTextInDisplayNameInput(),
      NEW_ROLE.displayName,
      'The display name typed on General should still be there',
    );
    await generalStep.clickOnNextButton();
    await usersStep.waitForLoaded();
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
  // No role was created in the editor - every one here was closed without Create. The principals go
  // first: a provider that still holds a user or a group cannot be deleted.
  after(async () => {
    for (const principal of [USER, SERVICE_ACCOUNT, GROUP, GROUP_SYSTEM]) {
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
