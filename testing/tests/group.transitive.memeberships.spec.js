/**
 * Created on 01.11.2018.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const GroupStatisticsPanel = require('../page_objects/browsepanel/group.statistics.panel');

describe('`group.transitive.memberships.spec`: checks transitive memberships', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    let group1;
    let group2;
    let TRANSITIVE_ROLE = 'Administration Console Login';

    it('Precondition: WHEN group1 has been created THEN message `Group was created` should appear',
        () => {
            let name = userItemsBuilder.generateRandomName('group');
            let roles = ['Users App'];
            let description = 'test group1';
            let groupWizard= new  GroupWizard();
            group1 = userItemsBuilder.buildGroup(name, description, null, roles);
            return testUtils.clickOnSystemAndOpenGroupWizard().then(() => {
                return groupWizard.typeData(group1);
            }).then(() => {
                return groupWizard.waitAndClickOnSave();
            }).then(() => {
                return groupWizard.waitForNotificationMessage();
            }).then(result => {
                testUtils.saveScreenshot("group1_saved");
                expect(result).to.equal(appConst.GROUP_WAS_CREATED);
            })
        });
    it('Precondition: creating of group2, this group should have the group1 in members',
        () => {
            let name = userItemsBuilder.generateRandomName('group');
            let members = [group1.displayName];
            let roles = [TRANSITIVE_ROLE];
            let description = 'test group2';
            let groupWizard= new  GroupWizard();
            group2 = userItemsBuilder.buildGroup(name, description, members, roles);
            return testUtils.clickOnSystemAndOpenGroupWizard().then(() => {
                return groupWizard.typeData(group2);
            }).then(() => {
                return groupWizard.waitAndClickOnSave();
            }).then(() => {
                return groupWizard.waitForNotificationMessage();
            }).then(result => {
                testUtils.saveScreenshot("group2_saved");
                expect(result).to.equal(appConst.GROUP_WAS_CREATED);
            })
        });

    it('WHEN `group 1` is selected and `transitive checkbox` is not checked THEN `transitive`-role should not be displayed',
        () => {
            let groupStatisticsPanel = new GroupStatisticsPanel();
            return testUtils.findAndSelectItem(group1.displayName).then(() => {
                testUtils.saveScreenshot("transitive_memberships_not_checked");
                return groupStatisticsPanel.getDisplayNameOfRoles();
            }).then(roles => {
                assert.isTrue(roles.length == 1, "One role should be displayed");
                assert.equal(roles[0], appConst.roles.USERS_APP, 'Only `Users App` role should be present on the panel');
            });
        });

    it('GIVEN group1 is selected WHEN `transitive checkbox` has been checked THEN one transitive role should be added in roles-list',
        () => {
        let groupStatisticsPanel = new GroupStatisticsPanel();
            return testUtils.findAndSelectItem(group1.displayName).then(() => {
                return groupStatisticsPanel.clickOnTransitiveCheckBox();
            }).then(() => {
                testUtils.saveScreenshot("transitive_memberships_checked");
                return groupStatisticsPanel.getDisplayNameOfRoles();
            }).then(roles => {
                assert.isTrue(roles.length == 2, "Two roles should be displayed");
                assert.isTrue(roles.includes(appConst.roles.USERS_APP), '`Users App` role should be present on the panel');
                assert.isTrue(roles.includes(appConst.roles.ADMIN_CONSOLE), 'Transitive role should be present on the panel as well');
            });
        });
    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
