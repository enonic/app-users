/**
 * Created on 09.10.2017.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const groupWizard = require('../page_objects/wizardpanel/group.wizard');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const groupStatisticsPanel = require('../page_objects/browsepanel/group.statistics.panel');

describe('`group.save.statistics.panel`: Save a Group and check the info in the Statistics Panel', function () {
    this.timeout(70000);
    webDriverHelper.setupBrowser();
    let groupWithRoleAndMember;
    let testGroup;
    it('GIVEN `Group` wizard is opened WHEN name, member and roles has been typed AND `Save` button pressed THEN message `Group was created` should appear',
        () => {
            groupWithRoleAndMember =
                userItemsBuilder.buildGroup(userItemsBuilder.generateRandomName('group'), 'test group', ['Super User'], ['Users App']);
            return testUtils.clickOnSystemAndOpenGroupWizard().then(()=> {
                return groupWizard.typeData(groupWithRoleAndMember);
            }).then(()=> {
                return groupWizard.waitAndClickOnSave();
            }).then(()=> {
                return groupWizard.waitForNotificationMessage();
            }).then(result=> {
                testUtils.saveScreenshot("group_is_saved");
                expect(result).to.equal(appConst.GROUP_WAS_CREATED);
            })
        });

    it('WHEN existing group is opened THEN description, role and members should be present',
        () => {
            return testUtils.findAndSelectItem(groupWithRoleAndMember.displayName).then(()=> {
                return userBrowsePanel.clickOnEditButton();
            }).then(()=> {
                return groupWizard.waitForOpened();
            }).then(()=> {
                return expect(groupWizard.getDescription()).to.eventually.be.equal(groupWithRoleAndMember.description);
            }).then(()=> {
                return groupWizard.getRoles();
            }).then((roles)=> {
                expect(roles[0]).to.equal(appConst.roles.USERS_APP);
            })
        });

    it('GIVEN `Group` wizard is opened WHEN name and description has been typed AND `Save` button pressed THEN Group should be searchable',
        () => {
            testGroup = userItemsBuilder.buildGroup(userItemsBuilder.generateRandomName('group'), 'test group', null, null);
            return testUtils.clickOnSystemAndOpenGroupWizard().then(()=> {
                return groupWizard.typeData(testGroup);
            }).then(()=> {
                return groupWizard.waitAndClickOnSave();
            }).then(()=> {
                return userBrowsePanel.doClickOnCloseTabAndWaitGrid(testGroup.displayName);
            }).then(()=> {
                return testUtils.typeNameInFilterPanel(testGroup.displayName);
            }).then(()=> {
                return expect(userBrowsePanel.isItemDisplayed(testGroup.displayName)).to.eventually.be.true;
            })
        });

    it(`GIVEN existing 'group' WHEN new role has been added THEN the role should be present on the wizard page`, () => {
        return testUtils.findAndSelectItem(testGroup.displayName).then(()=> {
            return userBrowsePanel.clickOnEditButton();
        }).then(()=> {
            return groupWizard.waitForOpened();
        }).then(()=> groupWizard.filterOptionsAndAddRole(appConst.roles.USERS_APP)).then(()=>groupWizard.waitAndClickOnSave()).then(()=> {
            return groupWizard.getRoles();
        }).then((roles)=> {
            expect(roles[0]).to.equal(appConst.roles.USERS_APP);
        })
    });

    it(`GIVEN existing 'group' WHEN new member has been added THEN the member should be present on the wizard page`, () => {
        return testUtils.findAndSelectItem(testGroup.displayName).then(()=> {
            return userBrowsePanel.clickOnEditButton();
        }).then(()=> {
            return groupWizard.waitForOpened();
        }).then(()=> groupWizard.filterOptionsAndAddMember(appConst.SUPER_USER_DISPLAY_NAME)).then(
            ()=>groupWizard.waitAndClickOnSave()).then(()=> {
            return groupWizard.getMembers();
        }).then((members)=> {
            expect(members[0]).to.equal(appConst.SUPER_USER_DISPLAY_NAME);
        })
    });

    it(`GIVEN existing 'Group' with a member and role WHEN it has been selected THEN correct info should be present in the 'statistics panel'`,
        () => {
            return testUtils.findAndSelectItem(testGroup.displayName).then(()=> {
                return groupStatisticsPanel.getDisplayNameOfMembers();
            }).then((members)=> {
                expect(members[0]).to.equal(appConst.SUPER_USER_DISPLAY_NAME);
            }).then(()=> {
                return groupStatisticsPanel.getDisplayNameOfRoles();
            }).then(roles=> {
                expect(roles[0]).to.equal(appConst.roles.USERS_APP);
            })
        });

    it(`GIVEN existing 'group' with the selected role is opened WHEN role has been removed THEN the role should not be present on the wizard page`,
        () => {
            return testUtils.findAndSelectItem(testGroup.displayName).then(()=> {
                return userBrowsePanel.clickOnEditButton();
            }).then(()=> {
                return groupWizard.waitForOpened();
            }).pause(400).then(()=> groupWizard.removeRole(appConst.roles.USERS_APP)).then(()=>groupWizard.waitAndClickOnSave()).then(()=> {
                return groupWizard.getRoles();
            }).then((roles)=> {
                expect(roles.length).to.equal(0);
            })
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});
