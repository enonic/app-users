/**
 * Created on 01.11.2018.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const GroupStatisticsPanel = require('../page_objects/browsepanel/group.statistics.panel');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');

describe("group.transitive.memberships.spec: checks transitive memberships", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    let group1;
    let group2;
    const TRANSITIVE_ROLE = 'Administration Console Login';

    it("Precondition: group1 should be created",
        async () => {
            let name = userItemsBuilder.generateRandomName('group');
            let roles = ['Users App'];
            let description = 'test group1';
            let groupWizard = new GroupWizard();
            group1 = userItemsBuilder.buildGroup(name, description, null, roles);
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeData(group1);
            await groupWizard.waitAndClickOnSave();
            await groupWizard.waitForNotificationMessage();
        });

    it("Precondition: group2 should be added, this group should have the group1 in members",
        async () => {
            let name = userItemsBuilder.generateRandomName('group');
            let members = [group1.displayName];
            let roles = [TRANSITIVE_ROLE];
            let description = 'test group2';
            let groupWizard = new GroupWizard();
            group2 = userItemsBuilder.buildGroup(name, description, members, roles);
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeData(group2);
            await groupWizard.waitAndClickOnSave();
            let message = await groupWizard.waitForNotificationMessage();
            await testUtils.saveScreenshot('group_saved');
            assert.equal(message, appConst.NOTIFICATION_MESSAGE.GROUP_WAS_CREATED, "Group was created - message is expected");
        });

    it("WHEN 'group 1' is selected and 'transitive checkbox' is not checked THEN 'transitive'-role should not be displayed",
        async () => {
            let groupStatisticsPanel = new GroupStatisticsPanel();
            //1. Select the first group:
            await testUtils.findAndSelectItem(group1.displayName);
            await testUtils.saveScreenshot('transitive_memberships_not_checked');
            let roles = await groupStatisticsPanel.getDisplayNameOfRoles();
            //2. One role should be present in Statistics Panel:
            assert.equal(roles.length, 1, "One role should be displayed in Statistics Panel");
            assert.equal(roles[0], appConst.ROLES_DISPLAY_NAME.USERS_APP, "expected role - 'Users App' should be present in the panel");
        });

    it("GIVEN group1 is selected WHEN 'transitive checkbox' has been checked THEN one transitive role should be added in roles-list",
        async () => {
            let groupStatisticsPanel = new GroupStatisticsPanel();
            // 1. The First group has been selected:
            await testUtils.findAndSelectItem(group1.displayName);
            // 2. Transitive checkbox has been checked:
            await groupStatisticsPanel.clickOnTransitiveCheckBox();
            await testUtils.saveScreenshot('transitive_memberships_checked');
            let roles = await groupStatisticsPanel.getDisplayNameOfRoles();
            // 3. Two roles should be displayed in the Statistics Panel:
            assert.equal(roles.length, 2, "Two roles should be displayed");
            assert.ok(roles.includes(appConst.ROLES_DISPLAY_NAME.USERS_APP), '`Users App` role should be present on the panel');
            assert.ok(roles.includes(appConst.ROLES_DISPLAY_NAME.ADMIN_CONSOLE),
                'Transitive role should be present on the panel as well');
            // 4. One group should be displayed
            let groups = await groupStatisticsPanel.getDisplayNamesInGroupList();
            assert.equal(groups.length, 1, "One group should be visible in the group-list in Statistics Panel");
            assert.ok(groups.includes(group2.displayName), 'Expected group-name should be in the group-list');
        });

    it("GIVEN group1 is selected AND group2 is opened WHEN group1 is removed in members of group2 THEN group1 stats should be updated in Inspect Panel",
        async () => {
            let groupStatisticsPanel = new GroupStatisticsPanel();
            let userBrowsePanel = new UserBrowsePanel();
            let groupWizard = new GroupWizard();
            // 1. The group2 is opened:
            await testUtils.selectGroupAndOpenWizard(group2.displayName);
            // 2. Go to grid and select the first group:
            await userBrowsePanel.clickOnAppHomeButton();
            await testUtils.findAndSelectItem(group1.displayName);
            // 3. Go to group2-wizard and remove the member:
            await userBrowsePanel.clickOnTabBarItem(group2.displayName);
            await groupWizard.removeMember(group1.displayName);
            await groupWizard.waitAndClickOnSave();
            await groupWizard.waitForNotificationMessage();
            // 4. Go to the grid
            await userBrowsePanel.clickOnAppHomeButton();
            await groupStatisticsPanel.waitForGroupListNotDisplayed();
            await testUtils.saveScreenshot('one_group_removed');
            let groups = await groupStatisticsPanel.getDisplayNamesInGroupList();
            // 5. Verify that group stats should be correctly updated:
            assert.equal(groups.length, 0, "Group list gets empty in Statistics Panel");
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
