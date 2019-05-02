/**
 * Created on 10.11.2017.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const webDriverHelper = require('../libs/WebDriverHelper');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');
const SaveBeforeClose = require('../page_objects/save.before.close.dialog');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('Group Wizard and `Save Before Close dialog`', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testGroup;

    it('GIVEN group-wizard is opened AND display name has been typed WHEN close button pressed THEN Save Before Close dialog should appear',
        () => {
            let groupWizard = new GroupWizard();
            let saveBeforeClose = new SaveBeforeClose();
            let userBrowsePanel = new UserBrowsePanel();
            return testUtils.clickOnSystemAndOpenGroupWizard().then(() => {
                return groupWizard.typeDisplayName('test-group');
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton('test-group');
            }).then(() => {
                return saveBeforeClose.waitForDialogOpened(appConst.TIMEOUT_3);
            });
        });

    it('WHEN new group has been added THEN the group should be present in the grid',
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            let groupName = userItemsBuilder.generateRandomName('group');
            testGroup = userItemsBuilder.buildGroup(groupName, 'description', null);
            return testUtils.openWizardAndSaveGroup(testGroup).then(() => {
                return testUtils.typeNameInFilterPanel(groupName);
            }).then(() => {
                return expect(userBrowsePanel.isItemDisplayed(groupName)).to.eventually.be.true;
            })
        });

    it('GIVEN existing group is opened WHEN display name has been changed AND `Close` button pressed THEN Save Before Close dialog should appear',
        () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeClose = new SaveBeforeClose();
            return testUtils.selectGroupAndOpenWizard(testGroup.displayName).then(() => {
                return groupWizard.typeDisplayName('new-name');
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton('new-name');
            }).then(() => {
                return saveBeforeClose.waitForDialogOpened(appConst.TIMEOUT_3);
            });
        });

    it('GIVEN existing group is opened WHEN description has been changed AND `Close` button pressed THEN Save Before Close dialog should appear',
        () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeClose = new SaveBeforeClose();
            return testUtils.selectGroupAndOpenWizard(testGroup.displayName).then(() => {
                return groupWizard.typeDescription('new-description');
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton(testGroup.displayName);
            }).then(() => {
                return saveBeforeClose.waitForDialogOpened(appConst.TIMEOUT_3);
            });
        });

    it('GIVEN existing group is opened WHEN member has been added AND `Close` button pressed THEN Save Before Close dialog should appear',
        () => {
            let groupWizard = new GroupWizard();
            let saveBeforeClose = new SaveBeforeClose();
            let userBrowsePanel = new UserBrowsePanel();
            return testUtils.selectGroupAndOpenWizard(testGroup.displayName).then(() => {
                return groupWizard.filterOptionsAndAddMember('Super User');
            }).then(() => {
                return userBrowsePanel.doClickOnCloseTabButton(testGroup.displayName);
            }).then(() => {
                return saveBeforeClose.waitForDialogOpened(appConst.TIMEOUT_3);
            });
        });

    before(() => {
        return console.log('specification starting: ' + this.title);
    });
    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
});

