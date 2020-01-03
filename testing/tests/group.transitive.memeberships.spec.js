/**
 * Created on 01.11.2018.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const GroupStatisticsPanel = require('../page_objects/browsepanel/group.statistics.panel');

describe('group.transitive.memberships.spec: checks transitive memberships', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    let group1;
    let group2;
    let TRANSITIVE_ROLE = 'Administration Console Login';

    it('Precondition: group1 should be created',
        async () => {
            let name = userItemsBuilder.generateRandomName('group');
            let roles = ['Users App'];
            let description = 'test group1';
            let groupWizard = new GroupWizard();
            group1 = userItemsBuilder.buildGroup(name, description, null, roles);
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeData(group1);
            await groupWizard.waitAndClickOnSave();
            let message = await groupWizard.waitForNotificationMessage();
            testUtils.saveScreenshot("group1_saved");
            assert.equal(message, appConst.GROUP_WAS_CREATED, "Group was created - message is expected");
        });

    it('Precondition: group2 should be added, this group should have the group1 in members',
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
            testUtils.saveScreenshot("group2_saved");
            assert.equal(message, appConst.GROUP_WAS_CREATED, "Group was created - message is expected");
        });

    it("WHEN 'group 1' is selected and 'transitive checkbox' is not checked THEN 'transitive'-role should not be displayed",
        async () => {
            let groupStatisticsPanel = new GroupStatisticsPanel();
            //1. Select the first group:
            await testUtils.findAndSelectItem(group1.displayName);
            testUtils.saveScreenshot("transitive_memberships_not_checked");
            let roles = await groupStatisticsPanel.getDisplayNameOfRoles();
            //2. One role should be present in Statistics Panel:
            assert.isTrue(roles.length === 1, "One role should be displayed");
            assert.equal(roles[0], appConst.roles.USERS_APP, "Only 'Users App' role should be present on the panel");
        });

    it("GIVEN group1 is selected WHEN 'transitive checkbox' has been checked THEN one transitive role should be added in roles-list",
        async () => {
            let groupStatisticsPanel = new GroupStatisticsPanel();
            //1. The First group has been selected:
            await testUtils.findAndSelectItem(group1.displayName);
            //2. Transitive checkbox has been checked:
            await groupStatisticsPanel.clickOnTransitiveCheckBox();
            testUtils.saveScreenshot("transitive_memberships_checked");
            let roles = await groupStatisticsPanel.getDisplayNameOfRoles();
            //3. Two roles should be displayed in the Statistics Panel:
            assert.isTrue(roles.length == 2, "Two roles should be displayed");
            assert.isTrue(roles.includes(appConst.roles.USERS_APP), '`Users App` role should be present on the panel');
            assert.isTrue(roles.includes(appConst.roles.ADMIN_CONSOLE), 'Transitive role should be present on the panel as well');
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
