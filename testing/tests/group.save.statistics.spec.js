/**
 * Created on 09.10.2017.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const GroupStatisticsPanel = require('../page_objects/browsepanel/group.statistics.panel');

describe('`group.save.statistics.panel`: Save a Group and check the info in the Statistics Panel', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let groupWithRoleAndMember;
    let testGroup;

    it('GIVEN `Group` wizard is opened WHEN name, member and roles have been typed AND `Save` button pressed THEN message `Group was created` should appear',
        async () => {
            let groupName = userItemsBuilder.generateRandomName('group');
            groupWithRoleAndMember = userItemsBuilder.buildGroup(groupName, 'test group', ['Super User'], ['Users App']);
            let groupWizard = new GroupWizard();
            //1. Open new Group-wizard, type the data:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeData(groupWithRoleAndMember);
            //2. click on Save button
            await groupWizard.waitAndClickOnSave();
            // 3. wait for the notification message:
            let message = await groupWizard.waitForNotificationMessage();
            testUtils.saveScreenshot("group_is_saved");
            assert.equal(message, appConst.GROUP_WAS_CREATED, "Expected notification message should appear");
        })

    it('WHEN existing group is opened THEN expected description, role and members should be present',
        async () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            //1. Open existing group:
            await testUtils.findAndSelectItem(groupWithRoleAndMember.displayName);
            await userBrowsePanel.clickOnEditButton();
            await groupWizard.waitForOpened();
            //2. Expected description and roles should be present in the wizard:
            let description = await groupWizard.getDescription();
            assert.equal(description, groupWithRoleAndMember.description, "Expected description should be present in the wizard");
            let roles = await groupWizard.getRoles();
            assert.equal(roles[0], appConst.roles.USERS_APP, "Expected roles should be present");
        });

    it('GIVEN `Group` wizard is opened WHEN name and description has been typed AND `Save` button pressed THEN Group should be searchable',
        () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let groupName = userItemsBuilder.generateRandomName('group');
            testGroup = userItemsBuilder.buildGroup(groupName, 'test group', null, null);
            return testUtils.clickOnSystemAndOpenGroupWizard().then(() => {
                return groupWizard.typeData(testGroup);
            }).then(() => {
                return groupWizard.pause(300);
            }).then(() => {
                return groupWizard.waitAndClickOnSave();
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabAndWaitGrid(testGroup.displayName);
            }).then(() => {
                return testUtils.typeNameInFilterPanel(testGroup.displayName);
            }).then(() => {
                return expect(userBrowsePanel.isItemDisplayed(testGroup.displayName)).to.eventually.be.true;
            })
        });

    it(`GIVEN existing 'group'(has no roles) is opened WHEN 'Users App' role has been added THEN the role should be visible on the wizard page`,
        () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            return testUtils.findAndSelectItem(testGroup.displayName).then(() => {
                return userBrowsePanel.clickOnEditButton();
            }).then(() => {
                return groupWizard.waitForOpened();
            }).then(() => {
                // add 'Users App' role
                return groupWizard.filterOptionsAndAddRole(appConst.roles.USERS_APP);
            }).then(() => {
                return groupWizard.waitAndClickOnSave();
            }).then(() => {
                return groupWizard.getRoles();
            }).then(roles => {
                expect(roles[0]).to.equal(appConst.roles.USERS_APP);
            })
        });

    it(`GIVEN existing 'group' is opened WHEN new member has been added THEN the member should be present on the wizard page`, () => {
        let groupWizard = new GroupWizard();
        let userBrowsePanel = new UserBrowsePanel();
        return testUtils.findAndSelectItem(testGroup.displayName).then(() => {
            return userBrowsePanel.clickOnEditButton();
        }).then(() => {
            return groupWizard.waitForOpened();
        }).then(() => {
            return groupWizard.filterOptionsAndAddMember(appConst.SUPER_USER_DISPLAY_NAME);
        }).then(() => {
            return groupWizard.waitAndClickOnSave();
        }).then(() => {
            return groupWizard.pause(1000);
        }).then(() => {
            return groupWizard.getMembers();
        }).then(members => {
            testUtils.saveScreenshot("group_member_added");
            expect(members[0]).to.equal(appConst.SUPER_USER_DISPLAY_NAME);
        })
    });

    it(`WHEN existing group has been selected  in the grid THEN expected info should be present in the 'statistics panel'`,
        () => {
            let groupWizard = new GroupWizard();
            let groupStatisticsPanel = new GroupStatisticsPanel();
            return testUtils.findAndSelectItem(testGroup.displayName).then(() => {
                return groupStatisticsPanel.getDisplayNameOfMembers();
            }).then(members => {
                expect(members[0]).to.equal(appConst.SUPER_USER_DISPLAY_NAME);
            }).then(() => {
                return groupStatisticsPanel.getDisplayNameOfRoles();
            }).then(roles => {
                expect(roles[0]).to.equal(appConst.roles.USERS_APP);
            })
        });

    it(`GIVEN existing 'group' with the selected role is opened WHEN role has been removed THEN the role should not be present on the wizard page`,
        () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            return testUtils.findAndSelectItem(testGroup.displayName).then(() => {
                return userBrowsePanel.clickOnEditButton();
            }).then(() => {
                return groupWizard.waitForOpened();
            }).then(() => {
                return groupWizard.removeRole(appConst.roles.USERS_APP);
            }).then(() => {
                return groupWizard.waitAndClickOnSave();
            }).then(() => {
                return groupWizard.getRoles();
            }).then(roles => {
                testUtils.saveScreenshot("groupwizard_role_removed");
                expect(roles.length).to.equal(0);
            })
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
