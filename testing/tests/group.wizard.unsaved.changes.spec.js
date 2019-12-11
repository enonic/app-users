/**
 * Created on 10.11.2017.
 */
const chai = require('chai');
const assert = chai.assert;
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
        async () => {
            let groupWizard = new GroupWizard();
            let saveBeforeClose = new SaveBeforeClose();
            let userBrowsePanel = new UserBrowsePanel();
            //1. Select System folder and open new Group Wizard:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeDisplayName('test-group');
            //2. Click on close icon:
            await userBrowsePanel.doClickOnCloseTabButton('test-group');
            //3. Save before dialog should appear( unsaved changes)
            await saveBeforeClose.waitForDialogOpened(appConst.TIMEOUT_3);
        });

    it('WHEN new group has been added THEN the group should be present in the grid',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let groupName = userItemsBuilder.generateRandomName('group');
            testGroup = userItemsBuilder.buildGroup(groupName, 'description', null);
            await testUtils.openWizardAndSaveGroup(testGroup);
            await testUtils.typeNameInFilterPanel(groupName);
            let result = await userBrowsePanel.isItemDisplayed(groupName);
            assert.isTrue(result, "New group should be present in grid");
        });

    it('GIVEN existing group is opened WHEN display name has been changed AND `Close` button pressed THEN Save Before Close dialog should appear',
        async () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeClose = new SaveBeforeClose();
            //1. Open existing group and change the display name:
            await testUtils.selectGroupAndOpenWizard(testGroup.displayName);
            await groupWizard.typeDisplayName('new-name');
            //2. Click on Close-icon:
            await userBrowsePanel.doClickOnCloseTabButton('new-name');
            await saveBeforeClose.waitForDialogOpened(appConst.TIMEOUT_3);
        });

    it('GIVEN existing group is opened WHEN description has been changed AND `Close` button pressed THEN Save Before Close dialog should appear',
        async () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeClose = new SaveBeforeClose();
            await testUtils.selectGroupAndOpenWizard(testGroup.displayName);
            await groupWizard.typeDescription('new-description');
            await userBrowsePanel.doClickOnCloseTabButton(testGroup.displayName);
            await saveBeforeClose.waitForDialogOpened(appConst.TIMEOUT_3);
        });

    it('GIVEN existing group is opened WHEN member has been added AND `Close` button pressed THEN Save Before Close dialog should appear',
        async () => {
            let groupWizard = new GroupWizard();
            let saveBeforeClose = new SaveBeforeClose();
            let userBrowsePanel = new UserBrowsePanel();
            //1. Open existing group:
            await testUtils.selectGroupAndOpenWizard(testGroup.displayName);
            //2. Add the member:
            await groupWizard.filterOptionsAndAddMember('Super User');
            //3. Click on Close icon:
            await userBrowsePanel.doClickOnCloseTabButton(testGroup.displayName);
            await saveBeforeClose.waitForDialogOpened(appConst.TIMEOUT_3);
        });

    before(() => {
        return console.log('specification starting: ' + this.title);
    });
    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
});