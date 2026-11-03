/**
 * Created on 02.11.2026
 */
const webDriverHelper = require('../../libs/WebDriverHelper');
const settingsUtils = require('../../libs/settings.utils');
const appConst = require('../../libs/app_const');
const assert = require('node:assert');
const GroupsPage = require('../../page_objects/groups/groups.page');
const GroupDetails = require('../../page_objects/groups/group.details');
const GroupEditorMembersStepDialog = require('../../page_objects/groups/group-dialog/group.editor.members.step.dialog');
const userItemsBuilder = require('../../libs/users.items.builder');

describe("group.transitive.memberships.spec - the details panel of a group: 'Transitive memberships' adds the roles and the groups inherited through the group's parents, and is not offered once the group has no parent", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }
  // group1 is a member of group2, group2 of group3: group2 is group1's direct parent, group3 the
  // one it is a member of transitively.
  const GROUP1_NAME = userItemsBuilder.generateRandomName('group1');
  const GROUP2_NAME = userItemsBuilder.generateRandomName('group2');
  const GROUP3_NAME = userItemsBuilder.generateRandomName('group3');
  // Both are system roles every instance has. group1 holds the first itself; the second it may
  // inherit through group2.
  const GROUP1_ROLE = appConst.SYSTEM_ROLES.USERS_APP;
  const TRANSITIVE_ROLE = appConst.SYSTEM_ROLES.ADMIN_CONSOLE;
  // What the createGroupViaApi() calls return, with the keys the deletes at the end need.
  let GROUP1;
  let GROUP2;
  let GROUP3;

  it("GIVEN the suite starts THEN three groups should be created via the API: group1 with the 'Users App' role, group2 with the 'Administration Console Login' role and group1 as its member, group3 with group2 as its member", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    GROUP1 = await settingsUtils.createGroupViaApi(
      userItemsBuilder.buildGroup({
        idProvider: userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME,
        displayName: GROUP1_NAME,
        description: 'test group1',
        roles: [GROUP1_ROLE],
      }),
    );
    // The API grants membership to a key, so group1 goes in by the key it was created with.
    GROUP2 = await settingsUtils.createGroupViaApi(
      userItemsBuilder.buildGroup({
        idProvider: userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME,
        displayName: GROUP2_NAME,
        description: 'test group2',
        members: [GROUP1.key],
        roles: [TRANSITIVE_ROLE],
      }),
    );
    GROUP3 = await settingsUtils.createGroupViaApi(
      userItemsBuilder.buildGroup({
        idProvider: userItemsBuilder.SYSTEM_ID_PROVIDER_DISPLAY_NAME,
        displayName: GROUP3_NAME,
        description: 'test group3',
        members: [GROUP2.key],
      }),
    );
  });

  it("WHEN group1 is selected THEN 'Transitive memberships' should be offered unchecked AND only the group's own role should be listed AND only its direct parent group2 should be listed under 'Member of'", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    let groupDetails = new GroupDetails();
    // 1. Select group1:
    await groupsPage.clickOnRowByDisplayName(GROUP1_NAME);
    await groupDetails.waitForTitle(GROUP1_NAME);
    await settingsUtils.saveScreenshot('transitive_memberships_not_checked');
    // 2. The checkbox is offered - group1 is a member of group2 - and is not checked to begin with.
    assert.ok(
      await groupDetails.isMembershipsSectionDisplayed(),
      "The 'Memberships' section should be displayed for a group that is a member of another",
    );
    assert.ok(
      !(await groupDetails.isTransitiveMembershipsChecked()),
      "'Transitive memberships' should not be checked to begin with",
    );
    // 3. Only the group's own role is listed:
    assert.equal(await groupDetails.getRolesCount(), 1, 'One role should be listed');
    assert.deepEqual(
      await groupDetails.getRoles(),
      [GROUP1_ROLE],
      `Only the group's own role '${GROUP1_ROLE}' should be listed`,
    );
    // 4. 'Member of' lists the direct parent alone - group3, which group1 is a member of through
    //    group2, is not shown until the checkbox is checked:
    assert.equal(
      await groupDetails.getMemberOfCount(),
      1,
      "One group should be listed under 'Member of'",
    );
    assert.deepEqual(
      await groupDetails.getMemberOf(),
      [GROUP2_NAME],
      "Only the direct parent group2 should be listed under 'Member of'",
    );
  });

  it("GIVEN group1 is selected WHEN 'Transitive memberships' has been checked THEN the role inherited through group2 should be listed too AND group3 should be listed under 'Member of' beside group2 AND WHEN it has been unchecked THEN both should be gone again", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    let groupDetails = new GroupDetails();
    // 1. Select group1:
    await groupsPage.clickOnRowByDisplayName(GROUP1_NAME);
    await groupDetails.waitForTitle(GROUP1_NAME);
    // 2. Check 'Transitive memberships':
    await groupDetails.clickOnTransitiveMembershipsCheckbox();
    assert.ok(
      await groupDetails.isTransitiveMembershipsChecked(),
      "'Transitive memberships' should be checked",
    );
    // 3. The full memberships come from the server after the click: the inherited role is listed
    //    once they are here, beside the group's own one.
    await groupDetails.waitForRole(TRANSITIVE_ROLE);
    await settingsUtils.saveScreenshot('transitive_memberships_checked');
    assert.equal(
      await groupDetails.getMembershipsErrorNotice(),
      undefined,
      'The memberships should be loaded without an error',
    );
    let roles = await groupDetails.getRoles();
    assert.equal(await groupDetails.getRolesCount(), 2, 'Two roles should be listed');
    assert.ok(
      roles.includes(GROUP1_ROLE),
      `The group's own role '${GROUP1_ROLE}' should stay listed`,
    );
    assert.ok(
      roles.includes(TRANSITIVE_ROLE),
      `The role '${TRANSITIVE_ROLE}' inherited through group2 should be listed`,
    );
    // 4. 'Member of' lists group3 - reached through group2 - beside group2, and nothing else:
    await groupDetails.waitForSectionCount(GroupDetails.SECTION.MEMBER_OF, 2);
    assert.deepEqual(
      new Set(await groupDetails.getMemberOf()),
      new Set([GROUP2_NAME, GROUP3_NAME]),
      "group2 and group3 should be listed under 'Member of'",
    );
    // 5. Uncheck the checkbox: the inherited role and group3 are gone, the own role and the direct
    //    parent stay.
    await groupDetails.clickOnTransitiveMembershipsCheckbox();
    assert.ok(
      !(await groupDetails.isTransitiveMembershipsChecked()),
      "'Transitive memberships' should be unchecked",
    );
    await groupDetails.waitForSectionCount(GroupDetails.SECTION.ROLES, 1);
    assert.deepEqual(await groupDetails.getRoles(), [GROUP1_ROLE]);
    await groupDetails.waitForSectionCount(GroupDetails.SECTION.MEMBER_OF, 1);
    assert.deepEqual(
      await groupDetails.getMemberOf(),
      [GROUP2_NAME],
      "Only the direct parent group2 should be listed under 'Member of' once the checkbox is unchecked",
    );
  });

  // The editor is a dialog over the browse screen, opened from the details of the selected group:
  // 'Edit groups' in group2's Groups section opens the Members step on its saved members.
  it("GIVEN group2 is selected WHEN group1 has been removed from its members in the editor AND saved THEN group1's details should not offer 'Transitive memberships' any more AND should list its own role alone", async () => {
    await settingsUtils.navigateToExtension(appConst.EXTENSIONS.GROUPS);
    let groupsPage = new GroupsPage();
    let groupDetails = new GroupDetails();
    let membersStep = new GroupEditorMembersStepDialog();
    // 1. Select group2: its details list group1 as a member group.
    await groupsPage.clickOnRowByDisplayName(GROUP2_NAME);
    await groupDetails.waitForTitle(GROUP2_NAME);
    await groupDetails.waitForGroup(GROUP1_NAME);
    assert.equal(await groupDetails.getGroupsCount(), 1, 'group2 should have one member group');
    // 2. 'Edit groups': the Members step opens in step view with group1 picked.
    await groupDetails.clickOnEditGroupsButton();
    await membersStep.waitForLoaded();
    assert.equal(await membersStep.getStepTitle(), 'Members');
    assert.ok(await membersStep.isStepView(), 'One step, no stepper dots');
    await membersStep.waitForMemberSelected(GROUP1_NAME);
    // 3. Remove group1, then Save: the dialog closes, the notification message reports the update.
    await membersStep.removeMember(GROUP1_NAME);
    await membersStep.waitForSaveButtonEnabled();
    await membersStep.clickOnSaveButtonAndWaitForClosed();
    await groupsPage.waitForExpectedNotificationMessage(appConst.groupUpdatedMessage(GROUP2_NAME));
    // 4. group2's details re-read the group: no member group is left.
    await groupDetails.waitForSectionCount(GroupDetails.SECTION.GROUPS, 0);
    // 5. Select group1: with no parent to inherit through, the checkbox is not offered, there is
    //    no 'Member of' and the group's own role is listed alone.
    await groupsPage.clickOnRowByDisplayName(GROUP1_NAME);
    await groupDetails.waitForTitle(GROUP1_NAME);
    await settingsUtils.saveScreenshot('transitive_memberships_parent_removed');
    assert.ok(
      !(await groupDetails.isMembershipsSectionDisplayed()),
      "The 'Memberships' section should not be displayed for a group that is a member of no group",
    );
    assert.ok(
      !(await groupDetails.isMemberOfSectionDisplayed()),
      "The 'Member of' section should not be displayed",
    );
    assert.equal(await groupDetails.getRolesCount(), 1, 'One role should be listed');
    assert.deepEqual(await groupDetails.getRoles(), [GROUP1_ROLE]);
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
  // The parents go first: group3 holds group2 as a member, group2 held group1.
  after(async () => {
    for (const group of [GROUP3, GROUP2, GROUP1]) {
      if (group !== undefined) {
        await settingsUtils.deletePrincipalsViaApi(group).catch((err) => {
          console.log(`'${group.displayName}' was not cleaned up: ` + err);
        });
      }
    }
  });
});
