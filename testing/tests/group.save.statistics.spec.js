/**
 * Created on 09.10.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const GroupStatisticsPanel = require('../page_objects/browsepanel/group.statistics.panel');

describe('group.save.statistics.spec: Save a group and check the info in Statistics Panel', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let groupWithRoleAndMember;
    let TEST_GROUP;
    const MEMBERS = ['Super User'];
    const ROLES = ['Users App'];

    it("GIVEN 'Group' wizard is opened WHEN name, member and roles have been typed AND `Save` button pressed THEN message 'Group was created' should appear",
        async () => {
            let groupName = userItemsBuilder.generateRandomName('group');
            groupWithRoleAndMember = userItemsBuilder.buildGroup(groupName, 'test group', MEMBERS, ROLES);
            let groupWizard = new GroupWizard();
            // 1. Open new Group-wizard, type the data:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeData(groupWithRoleAndMember);
            // 2. click on Save button
            await groupWizard.waitAndClickOnSave();
            // 3. wait for the notification message:
            let message = await groupWizard.waitForNotificationMessage();
            await testUtils.saveScreenshot('group_is_saved');
            assert.equal(message, appConst.NOTIFICATION_MESSAGE.GROUP_WAS_CREATED, "Expected notification message should appear");
        });

    it("WHEN existing group is opened THEN expected description, role and members should be present",
        async () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Open the existing group:
            await testUtils.findAndSelectItem(groupWithRoleAndMember.displayName);
            await userBrowsePanel.clickOnEditButton();
            await groupWizard.waitForOpened();
            // 2. Expected description and roles should be present in the wizard:
            let description = await groupWizard.getDescription();
            assert.equal(description, groupWithRoleAndMember.description, "Expected description should be present in the wizard");
            let roles = await groupWizard.getSelectedRoles();
            assert.equal(roles.length, ROLES.length, "The only one role should be present in the selected options");
            assert.equal(roles[0], appConst.ROLES_DISPLAY_NAME.USERS_APP, "Expected roles should be present");
            let members = await groupWizard.getSelectedMembers();
            assert.equal(members.length, MEMBERS.length, "The only one member should be present in the selected options");
            assert.equal(members[0], 'Super User', "Expected member should be displayed");
        });

    it("GIVEN 'Group' wizard is opened WHEN name and description has been typed AND 'Save' button pressed THEN that new group should be searchable",
        async () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let groupName = userItemsBuilder.generateRandomName('group');
            TEST_GROUP = userItemsBuilder.buildGroup(groupName, 'test group', null, null);
            // 1. Open user-wizard, type a data and save all:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeData(TEST_GROUP);
            await groupWizard.pause(300);
            await groupWizard.waitAndClickOnSave();
            await groupWizard.waitForNotificationMessage();
            // 2. Close the wizard:
            await userBrowsePanel.closeTabAndWaitForGrid(TEST_GROUP.displayName);
            // 3. Type the name in Filter Panel:
            await testUtils.typeNameInFilterPanel(TEST_GROUP.displayName);
            // 4. Verify that new group is filtered:
            let isPresent = await userBrowsePanel.isItemDisplayed(TEST_GROUP.displayName);
            assert.ok(isPresent, "new group should be filtered in the rid");
        });

    it("GIVEN existing 'group'(has no roles) is opened WHEN 'Users App' role has been added THEN this role gets visible in roles-step",
        async () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. open existing group:
            await testUtils.findAndSelectItem(TEST_GROUP.displayName);
            await userBrowsePanel.clickOnEditButton();
            await groupWizard.waitForOpened();
            // 2. Add 'Users App' role
            await groupWizard.filterOptionsAndAddRole(appConst.ROLES_DISPLAY_NAME.USERS_APP);
            await groupWizard.waitAndClickOnSave();
            await groupWizard.waitForNotificationMessage();
            // 3. Verify that new role should be added in roles-step:
            let actualRoles = await groupWizard.getSelectedRoles();
            assert.equal(actualRoles[0], appConst.ROLES_DISPLAY_NAME.USERS_APP, "Expected role gets visible in roles-step");
        });

    it("GIVEN existing 'group' is opened WHEN new member has been added THEN the member should be displayed in members-step",
        async () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. open existing group:
            await testUtils.findAndSelectItem(TEST_GROUP.displayName);
            await userBrowsePanel.clickOnEditButton();
            await groupWizard.waitForOpened();
            // 2. Add 'Super User' in members:
            await groupWizard.filterOptionsAndAddMember(appConst.SUPER_USER_DISPLAY_NAME);
            await groupWizard.waitAndClickOnSave();
            await groupWizard.waitForNotificationMessage();
            // 3. Verify that actual members and expected are equal:
            let actualMembers = await groupWizard.getSelectedMembers();
            await testUtils.saveScreenshot('group_member_added');
            assert.equal(actualMembers[0], appConst.SUPER_USER_DISPLAY_NAME);
        });

    it("WHEN existing group has been selected THEN expected roles and members should be loaded in Statistics Panel",
        async () => {
            let groupStatisticsPanel = new GroupStatisticsPanel();
            // 1. Select the existing group:
            await testUtils.findAndSelectItem(TEST_GROUP.displayName);
            let actualMembers = await groupStatisticsPanel.getDisplayNameOfMembers();
            // 2. Verify the data in Statistics Panel
            assert.equal(actualMembers.length, 1, "One member should be loaded");
            assert.equal(actualMembers[0], appConst.SUPER_USER_DISPLAY_NAME, "Expected members should be loaded");

            let actualRoles = await groupStatisticsPanel.getDisplayNameOfRoles();
            assert.equal(actualRoles.length, 1, 'One roles should be loaded');
            assert.equal(actualRoles[0], appConst.ROLES_DISPLAY_NAME.USERS_APP, "Expected roles should be loaded");

        });

    it("GIVEN existing 'group'(with role) is opened WHEN role has been removed THEN the role should not be present in the roles-step",
        async () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. open existing group and remove the role:
            await testUtils.findAndSelectItem(TEST_GROUP.displayName);
            await userBrowsePanel.clickOnEditButton();
            await groupWizard.waitForOpened();
            await groupWizard.removeRole(appConst.ROLES_DISPLAY_NAME.USERS_APP);
            await groupWizard.waitAndClickOnSave();
            await groupWizard.waitForNotificationMessage();
            // 2. Verify roles:
            let actualRoles = await groupWizard.getSelectedRoles();
            await testUtils.saveScreenshot('group_wizard_role_removed');
            assert.equal(actualRoles.length, 0, "Empty list of roles should be in the wizard-step");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        if (typeof browser !== 'undefined') {
            await testUtils.getBrowser().setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
        }
        return console.log('specification starting: ' + this.title);
    });
});
