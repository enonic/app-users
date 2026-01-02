/**
 * Created on 21.11.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const RoleWizard = require('../page_objects/wizardpanel/role.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const ConfirmationDialog = require("../page_objects/confirmation.dialog");
const GridContextMenu = require('../page_objects/browsepanel/grid.context.menu');

describe('Deleting of a role - confirm and delete it in wizard and in browse panel', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let TEST_ROLE;
    const SYSTEM_ROLE = 'Authenticated';

    it("GIVEN existing role is filtered WHEN 'Edit' menu item in context menu has been clicked THEN role wizard should be loaded",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let gridContextMenu = new GridContextMenu();
            let roleWizard = new RoleWizard();
            // 1. type 'Authenticated' role in the Filter Panel:
            await testUtils.typeNameInFilterPanel(SYSTEM_ROLE);
            // 2. Open the context menu for the user
            await userBrowsePanel.rightClickOnRowByDisplayName(SYSTEM_ROLE);
            await gridContextMenu.waitForContextMenuVisible();
            // 3. Click on 'Edit' menu item
            await gridContextMenu.clickOnMenuItem('Edit');
            // 4. Role Wizard should be loaded:
            await roleWizard.waitForLoaded();
            let roleDisplayName = await roleWizard.getDisplayName();
            assert.equal(roleDisplayName, SYSTEM_ROLE, 'Expected wizard should be loaded');
        });

    it("GIVEN role has been saved WHEN 'App home' button has been clicked and 'Roles' folder expanded THEN new role should be present",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleWizard = new RoleWizard();
            let roleName = userItemsBuilder.generateRandomName('role');
            // 1. Open new role-wizard and save the role:
            await testUtils.clickOnRolesFolderAndOpenWizard();
            await roleWizard.typeDisplayName(roleName);
            await roleWizard.waitAndClickOnSave();
            await roleWizard.waitForNotificationMessage();
            await userBrowsePanel.clickOnAppHomeButton();
            // 2. Expand Roles-folder:
            await userBrowsePanel.clickOnExpanderIcon('roles');
            let result = await userBrowsePanel.isItemDisplayed(roleName);
            assert.ok(result, 'new role should be present in the grid')
        });

    it("GIVEN new 'Role' is saved WHEN 'Delete' button in wizard-toolbar has been pressed THEN Confirmation dialog should appear",
        async () => {
            let name = userItemsBuilder.generateRandomName('role');
            TEST_ROLE = userItemsBuilder.buildRole(name, 'test role 2');
            let confirmationDialog = new ConfirmationDialog();
            let roleWizard = new RoleWizard();
            // 1. Open new role-wizard:
            await testUtils.clickOnRolesFolderAndOpenWizard();
            await roleWizard.typeData(TEST_ROLE);
            // 2. Save the role:
            await roleWizard.waitAndClickOnSave();
            await roleWizard.waitForNotificationMessage();
            // 3. Click on Delete button:
            await roleWizard.clickOnDelete();
            await testUtils.saveScreenshot('role_wizard_confirm_delete1');
            // "Confirmation Dialog" should be loaded:
            await confirmationDialog.waitForDialogLoaded();
        });

    it("GIVEN existing role is opened WHEN 'Ctrl+del' has been pressed THEN Confirmation dialog should appear",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleWizard = new RoleWizard();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Open an existing role:
            await testUtils.findAndSelectItem(TEST_ROLE.displayName);
            await userBrowsePanel.clickOnEditButton();
            await roleWizard.waitForLoaded();
            // 2. Click on Ctrl+Del
            await roleWizard.hotKeyDelete();
            await testUtils.saveScreenshot('role_wizard_shortcut_delete');
            // "Confirmation Dialog" should be loaded
            await confirmationDialog.waitForDialogLoaded();
        });

    it('GIVEN existing role is opened WHEN the role has been deleted in the wizard THEN expected notification message should appear',
        async () => {
            let roleWizard = new RoleWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let name = userItemsBuilder.generateRandomName('role');
            TEST_ROLE = userItemsBuilder.buildRole(name, 'test role 3');
            // 1. Save ne role:
            await testUtils.clickOnRolesFolderAndOpenWizard();
            await roleWizard.typeData(TEST_ROLE);
            await roleWizard.waitAndClickOnSave();
            await roleWizard.waitForNotificationMessage();
            // 2. Click on Delete and confirm the deleting:
            await roleWizard.clickOnDelete();
            await testUtils.confirmDelete();
            await testUtils.saveScreenshot('role_deleted_confirmation_mess1');
            //Wait for "Principal "role:${displayName}" is deleted"
            let expectedMessage = appConst.roleDeletedMessage(TEST_ROLE.displayName);
            await userBrowsePanel.waitForExpectedNotificationMessage(expectedMessage);
        });

    it('GIVEN `Role` is selected in browse panel WHEN `Delete` button has been pressed THEN Confirmation dialog should appear',
        async () => {
            let confirmationDialog = new ConfirmationDialog();
            let userBrowsePanel = new UserBrowsePanel();
            let name = userItemsBuilder.generateRandomName('role');
            TEST_ROLE = userItemsBuilder.buildRole(name, 'test role 2');
            // 1. Save new role:
            await testUtils.openWizardAndSaveRole(TEST_ROLE);
            // 2. select the role in browse-panel:
            await testUtils.findAndSelectItem(TEST_ROLE.displayName);
            await userBrowsePanel.waitForDeleteButtonEnabled();
            // 3. Click on Delete:
            await userBrowsePanel.clickOnDeleteButton();
            await testUtils.saveScreenshot('role_confirm_delete2');
            // "Confirmation Dialog" should be loaded:
            await confirmationDialog.waitForDialogLoaded();
        });

    it('GIVEN existing role WHEN the role has been deleted in browse panel THEN expected notification should appear',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Delete existing role:
            await testUtils.selectAndDeleteItem(TEST_ROLE.displayName);
            let message = await userBrowsePanel.waitForNotificationMessage();
            await testUtils.saveScreenshot('role_deleted_notification_mes2');
            // 2. Verify the notification message:
            let expectedMsg = appConst.roleDeletedMessage(TEST_ROLE.displayName);
            assert.strictEqual(message, expectedMsg, `'Principal "role:roleName" is deleted' this message should be displayed`);
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});
