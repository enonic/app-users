/**
 * Created on 14.10.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const GroupsPage = require('../../page_objects/groups/groups.page');
const GroupEditorIdProviderStepDialog = require('../../page_objects/groups/group-dialog/group.editor.id.provider.step.dialog');
const GroupEditorGeneralStepDialog = require('../../page_objects/groups/group-dialog/group.editor.general.step.dialog');
const GroupEditorMembersStepDialog = require('../../page_objects/groups/group-dialog/group.editor.members.step.dialog');
const userItemsBuilder = require('../../libs/users.items.builder');

describe("group.editor.members.roles.summary.step.spec - the group editor's Members, Roles and Summary steps: the members offered are those of the group's ID provider until 'Show members from all ID providers' is pressed", function () {
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
  // The group the editor is opened for. It is never created: every editor here is closed without
  // Create.
  const NEW_GROUP = userItemsBuilder.buildGroup({
    idProvider: PROVIDER_NAME,
    displayName: userItemsBuilder.generateRandomName('newgroup'),
  });
  // What the create*ViaApi() calls return, with the keys the deletes at the end need.
  let ID_PROVIDER;
  let USER;
  let GROUP;
  let GROUP_SYSTEM;
  let SERVICE_ACCOUNT;

  // The Members step offers the users and groups of the group's ID provider: a user and a group are
  // made in a provider of the suite's own. 'Show members from all ID providers' widens the offer to
  // every provider: a service account and a group are made in the system's.
  it('GIVEN the suite starts THEN an ID provider with a user and a group in it AND a service account and a group in the system ID provider should be created via the API', async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
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

  // The picker offers the users and groups of the group's ID provider; 'Show members from all ID
  // providers' widens it to every provider, the system's included.
  it("GIVEN the Members step is opened WHEN the list has been dropped down THEN only the user and the group of the group's ID provider should be offered AND WHEN 'Show members from all ID providers' has been pressed THEN the service account and the group of the system ID provider should be offered too", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    let idProviderStep = new GroupEditorIdProviderStepDialog();
    let generalStep = new GroupEditorGeneralStepDialog();
    let membersStep = new GroupEditorMembersStepDialog();
    // 1. Open the editor and get to Members: the provider is picked, the display name typed.
    await groupsPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    await idProviderStep.doFilterAndSelectIdProviderByDisplayName(PROVIDER_NAME);
    await idProviderStep.clickOnNextAndWaitForGeneralStep();
    await generalStep.typeDataAndClickOnNext(NEW_GROUP);
    await membersStep.waitForLoaded();
    assert.equal(await membersStep.getStepTitle(), 'Members');
    assert.ok(
      !(await membersStep.isShowAllMembersTogglePressed()),
      "'Show members from all ID providers' should not be pressed to begin with",
    );
    assert.deepEqual(await membersStep.getSelectedMembers(), [], 'No member should be picked yet');
    // 2. Drop the list down: the user and the group of the group's ID provider are offered, and
    //    nothing else - the provider was made for this suite. The members come from the server
    //    after the click, so the list is read once both are shown.
    await membersStep.clickOnMembersDropdownHandle();
    await membersStep.waitForMemberOptionDisplayed(USER_NAME);
    await membersStep.waitForMemberOptionDisplayed(GROUP.displayName);
    assert.deepEqual(
      new Set(await membersStep.getMemberOptions()),
      new Set([USER_NAME, GROUP.displayName]),
      "Only the user and the group of the group's ID provider should be offered",
    );
    // 3. 'Show members from all ID providers': the service account and the group of the system ID
    //    provider are offered too, the provider's own user and group still there. The click lands
    //    outside the popup and closes it; the wait opens it again.
    await membersStep.clickOnShowAllMembersToggle();
    await membersStep.waitForShowAllMembersTogglePressed();
    await membersStep.waitForMemberOptionDisplayed(SERVICE_ACCOUNT_NAME);
    await membersStep.waitForMemberOptionDisplayed(GROUP_SYSTEM.displayName);
    let memberOptions = await membersStep.getMemberOptions();
    for (const displayName of [USER_NAME, GROUP.displayName]) {
      assert.ok(
        memberOptions.includes(displayName),
        `'${displayName}' should still be offered with every provider shown`,
      );
    }
    // 4. Members are optional: Next is still enabled.
    await membersStep.waitForNextButtonEnabled();
  });

  // Each option carries the key of its ID provider beside its label: 'system' for the service
  // account, the suite's provider for the group made in it. The filter finds a principal in any
  // provider once 'Show members from all ID providers' is pressed.
  it("GIVEN the Members step is opened AND 'Show members from all ID providers' has been pressed WHEN the service account's name has been typed THEN its option should show 'system' as its ID provider AND WHEN the group's name has been typed THEN its option should show the group's ID provider", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    let idProviderStep = new GroupEditorIdProviderStepDialog();
    let generalStep = new GroupEditorGeneralStepDialog();
    let membersStep = new GroupEditorMembersStepDialog();
    // 1. Open the editor and get to Members: the provider is picked, the display name typed.
    await groupsPage.clickOnNewButton();
    await idProviderStep.waitForLoaded();
    await idProviderStep.doFilterAndSelectIdProviderByDisplayName(PROVIDER_NAME);
    await idProviderStep.clickOnNextAndWaitForGeneralStep();
    await generalStep.typeDataAndClickOnNext(NEW_GROUP);
    await membersStep.waitForLoaded();
    // 2. Every provider: the service account lives in the system's.
    await membersStep.clickOnShowAllMembersToggle();
    await membersStep.waitForShowAllMembersTogglePressed();
    // 3. Filter by the service account's name: its option names the system ID provider.
    await membersStep.typeInMembersFilterInput(SERVICE_ACCOUNT_NAME);
    await membersStep.waitForMemberOptionDisplayed(SERVICE_ACCOUNT_NAME);
    assert.equal(
      await membersStep.getMemberOptionIdProvider(SERVICE_ACCOUNT_NAME),
      userItemsBuilder.SYSTEM_ID_PROVIDER,
      "The service account's option should name the system ID provider",
    );
    // 4. Filter by the group's name: its option names the provider the group was made in.
    await membersStep.clearMembersFilterInput();
    await membersStep.typeInMembersFilterInput(GROUP.displayName);
    await membersStep.waitForMemberOptionDisplayed(GROUP.displayName);
    assert.equal(
      await membersStep.getMemberOptionIdProvider(GROUP.displayName),
      ID_PROVIDER.key,
      "The group's option should name the ID provider it was made in",
    );
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
  // No group was created in the editor - every one here was closed without Create. The principals
  // go first: a provider that still holds a user or a group cannot be deleted.
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
