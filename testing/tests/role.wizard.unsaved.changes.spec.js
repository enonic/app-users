/**
 * Created on 09.11.2017.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const RoleWizard = require('../page_objects/wizardpanel/role.wizard');
const SaveBeforeClose = require('../page_objects/save.before.close.dialog');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe("Role Wizard - 'Save Before Close dialog' specification", function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let TEST_ROLE;

    it('GIVEN role-wizard is opened AND display name has been typed WHEN close button pressed THEN Save Before Close dialog should appear',
        async () => {
            let roleWizard = new RoleWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeClose = new SaveBeforeClose();
            //1. Open new role-wizard and type a name:
            await testUtils.clickOnRolesFolderAndOpenWizard();
            await roleWizard.typeDisplayName('test-role');
            //2. Click on close icon:
            await userBrowsePanel.doClickOnCloseTabButton('test-role');
            //3. Verify that dialog is loaded:
            await saveBeforeClose.waitForDialogOpened();
        });

    it('WHEN new role has been added THEN the role should be present in the grid',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleName = userItemsBuilder.generateRandomName('role');
            TEST_ROLE = userItemsBuilder.buildRole(roleName, 'description', null);
            //1. Save new role:
            await testUtils.openWizardAndSaveRole(TEST_ROLE);
            //2. Verify that the role is searchable:
            await testUtils.typeNameInFilterPanel(roleName);
            let isPresent = await userBrowsePanel.isItemDisplayed(roleName);
            assert.isTrue(isPresent, "New role should be present in the grid");
        });

    it('GIVEN existing role is opened WHEN display name has been changed AND `Close` button pressed THEN Save Before Close dialog should appear',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleWizard = new RoleWizard();
            let saveBeforeClose = new SaveBeforeClose();
            //1. Open existing role and update the name:
            await testUtils.selectRoleAndOpenWizard(TEST_ROLE.displayName);
            await roleWizard.typeDisplayName('new-name');
            //2. Click on close-icon
            await userBrowsePanel.doClickOnCloseTabButton('new-name');
            //Verify, the modal dialog should appear
            await saveBeforeClose.waitForDialogOpened();
        });

    it('GIVEN existing role is opened WHEN description has been changed AND `Close` button pressed THEN Save Before Close dialog should appear',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleWizard = new RoleWizard();
            let saveBeforeClose = new SaveBeforeClose();
            //1. Open existing role and update the description:
            await testUtils.selectRoleAndOpenWizard(TEST_ROLE.displayName);
            await roleWizard.typeDescription('new-description');
            //2. Click on close-icon
            await userBrowsePanel.doClickOnCloseTabButton(TEST_ROLE.displayName);
            //Verify, the modal dialog should appear
            await saveBeforeClose.waitForDialogOpened();
        });

    it('GIVEN existing role is opened WHEN member has been added AND `Close` button pressed THEN Save Before Close dialog should appear',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleWizard = new RoleWizard();
            let saveBeforeClose = new SaveBeforeClose();
            //1. Open existing role and update members:
            await testUtils.selectRoleAndOpenWizard(TEST_ROLE.displayName);
            await roleWizard.filterOptionsAndAddMember('Super User');
            await userBrowsePanel.doClickOnCloseTabButton(TEST_ROLE.displayName);
            await saveBeforeClose.waitForDialogOpened(appConst.TIMEOUT_3);
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});

