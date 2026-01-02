/**
 * Created on 09.11.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const RoleWizard = require('../page_objects/wizardpanel/role.wizard');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe("Role Wizard - 'Confirmation' dialog specification", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let TEST_ROLE;

    it('GIVEN role-wizard is opened AND display name has been typed WHEN close button pressed THEN Confirmation dialog should appear',
        async () => {
            let roleWizard = new RoleWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Open new role-wizard and type a name:
            await testUtils.clickOnRolesFolderAndOpenWizard();
            await roleWizard.typeDisplayName('test-role');
            // 2. Click on close icon:
            await userBrowsePanel.doClickOnCloseTabButton('test-role');
            // 3. Verify that dialog is loaded:
            await confirmationDialog.waitForDialogLoaded();
        });

    it('WHEN new role has been added THEN the role should be present in the grid',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleName = userItemsBuilder.generateRandomName('role');
            TEST_ROLE = userItemsBuilder.buildRole(roleName, 'description', null);
            // 1. Save new role:
            await testUtils.openWizardAndSaveRole(TEST_ROLE);
            // 2. Verify that the role is searchable:
            await testUtils.typeNameInFilterPanel(roleName);
            let isPresent = await userBrowsePanel.isItemDisplayed(roleName);
            assert.ok(isPresent, "New role should be present in the grid");
        });

    it('GIVEN existing role is opened WHEN display name has been changed AND `Close` button pressed THEN Confirmation dialog should appear',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleWizard = new RoleWizard();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Open existing role and update the name:
            await testUtils.selectRoleAndOpenWizard(TEST_ROLE.displayName);
            await roleWizard.typeDisplayName('new-name');
            // 2. Click on close-icon
            await userBrowsePanel.doClickOnCloseTabButton('new-name');
            // Verify, the modal dialog should appear
            await confirmationDialog.waitForDialogLoaded();
        });

    it('GIVEN existing role is opened WHEN description has been changed AND `Close` button pressed THEN Confirmation dialog should appear',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleWizard = new RoleWizard();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Open existing role and update the description:
            await testUtils.selectRoleAndOpenWizard(TEST_ROLE.displayName);
            await roleWizard.typeDescription('new-description');
            // 2. Click on close-icon
            await userBrowsePanel.doClickOnCloseTabButton(TEST_ROLE.displayName);
            // Verify, the modal dialog should appear
            await confirmationDialog.waitForDialogLoaded();
        });

    it('GIVEN existing role is opened WHEN new member has been added AND `Close` button pressed THEN Confirmation dialog should appear',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleWizard = new RoleWizard();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Open existing role and update members:
            await testUtils.selectRoleAndOpenWizard(TEST_ROLE.displayName);
            await roleWizard.filterOptionsAndAddMember('Super User');
            // 2. Click on Close-tab icon:
            await userBrowsePanel.doClickOnCloseTabButton(TEST_ROLE.displayName);
            // 3. Verify that Confirmation dialog is loaded:
            await confirmationDialog.waitForDialogLoaded();
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

