/**
 * Created on 04.10.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const UserStatisticsPanel = require('../page_objects/browsepanel/user.statistics.panel');
const ChangePasswordDialog = require('../page_objects/wizardpanel/change.password.dialog');
const GridContextMenu = require('../page_objects/browsepanel/grid.context.menu');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');

describe('edit.user.spec: Edit an user - change e-mail, name and roles', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    let TEST_USER;
    const PASSWORD = appConst.PASSWORD.MEDIUM;
    const NEW_DISPLAY_NAME = appConst.generateRandomName('user');

    it("GIVEN 'User' with a role has been saved WHEN the user has been clicked THEN expected role should be displayed in the statistic panel",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let userStatisticsPanel = new UserStatisticsPanel();
            let userName = userItemsBuilder.generateRandomName('user');
            let roles = [appConst.ROLES_DISPLAY_NAME.CM_ADMIN, appConst.ROLES_DISPLAY_NAME.USERS_ADMINISTRATOR];
            TEST_USER = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), roles);
            // 1. Select 'System' folder and open User Wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Insert the required data:
            await userWizard.typeData(TEST_USER);
            // 3. Save the user:
            await testUtils.saveScreenshot('edit_user_wizard1');
            await userWizard.waitAndClickOnSave();
            // 4. Go to Browse Panel:
            await userBrowsePanel.clickOnAppHomeButton();
            // 5. Select the user in the grid
            await testUtils.typeNameInFilterPanel(userName);
            await userBrowsePanel.clickOnRowByName(userName);
            await testUtils.saveScreenshot('edit_user_statistics_panel');
            // 6. Expected roles should be displayed in Statistics Panel:
            let actualRoles = await userStatisticsPanel.getDisplayNameOfRoles();

            assert.equal(actualRoles[0], appConst.ROLES_DISPLAY_NAME.CM_ADMIN,
                "'Content Manager Administrator' role should be present in the panel");
            assert.equal(actualRoles[1], appConst.ROLES_DISPLAY_NAME.USERS_ADMINISTRATOR,
                "'Content Manager Administrator' role should be present in the panel");
            // 7. Expected user-name should be displayed in the Statistics Panel
            let actualName = await userStatisticsPanel.getItemName();
            assert.equal(actualName, userName, "Expected and actual name should be equal");
        });

    it("GIVEN existing user is filtered WHEN Delete menu item in context menu has been clicked THEN Confirmation dialog should be loaded",
        async () => {
            let confirmationDialog = new ConfirmationDialog();
            let userBrowsePanel = new UserBrowsePanel();
            let gridContextMenu = new GridContextMenu();
            // 1. type the display name in the Filter Panel:
            await testUtils.typeNameInFilterPanel(TEST_USER.displayName);
            // 2. Open the context menu for the user
            await userBrowsePanel.rightClickOnRowByDisplayName(TEST_USER.displayName);
            await gridContextMenu.waitForContextMenuVisible();
            await testUtils.saveScreenshot('user_context_menu_1');
            // 3. Click on Delete menu item
            await gridContextMenu.clickOnMenuItem('Delete');
            // 4. Confirmation dialog should be loaded:
            await confirmationDialog.waitForDialogLoaded();
        });

    it("GIVEN existing user is opened WHEN 'Edit' menu item in context menu has been clicked THEN the user-data should be loaded in the wizard",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let gridContextMenu = new GridContextMenu();
            // 1. type the display name in the Filter Panel:
            await testUtils.typeNameInFilterPanel(TEST_USER.displayName);
            await userBrowsePanel.rightClickOnRowByDisplayName(TEST_USER.displayName);
            // 2. Open the context menu for the user
            await gridContextMenu.waitForContextMenuVisible();
            // 3. Click on Edit menu item
            await gridContextMenu.clickOnMenuItem('Edit');
            // 4. User Wizard should be loaded:
            await userWizard.waitForOpened();
            let userDisplayName = await userWizard.getUserName();
            assert.equal(userDisplayName, TEST_USER.displayName, 'Expected wizard should be loaded');
        });

    it("GIVEN existing user is opened WHEN display name has been changed THEN user should be searchable with the new display name",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Select and open the existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Update the display name:
            await userWizard.typeDisplayName(NEW_DISPLAY_NAME);
            await userWizard.pause(300);
            // 3. Save new display name:
            await testUtils.saveAndCloseWizard(NEW_DISPLAY_NAME);
            // 4. Insert the new display name in Filter Panel:
            await testUtils.typeNameInFilterPanel(NEW_DISPLAY_NAME);
            // 5. Verify that the user's path is not updated (the initial display name is displayed):
            let isDisplayed = await userBrowsePanel.isItemDisplayed(TEST_USER.displayName);
            assert.ok(isDisplayed, "User with new display name should be searchable in the grid");
        });

    it("GIVEN existing user is opened WHEN one role has been removed THEN this role should not be present in the statistics panel",
        async () => {
            let userWizard = new UserWizard();
            let userStatisticsPanel = new UserStatisticsPanel();
            // 1. Open the existing user ( use the initial display name in Filter Panel):
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Remove the role:
            await userWizard.removeRole(appConst.ROLES_DISPLAY_NAME.USERS_ADMINISTRATOR);
            await testUtils.saveAndCloseWizard(NEW_DISPLAY_NAME);
            // 3. Number of roles should be reduced in the Statistics Panel:
            let actualRoles = await userStatisticsPanel.getDisplayNameOfRoles();
            assert.equal(actualRoles.length, 1, 'one role should be present on the statistics panel');
            assert.equal(actualRoles[0], appConst.ROLES_DISPLAY_NAME.CM_ADMIN,
                '`Content Manager Administrator` role should be present on the panel');
        });

    // Verifies Updating a password clears unsaved roles and groups #511
    // https://github.com/enonic/app-users/issues/511
    it("GIVEN existing user is opened WHEN new role has been added AND password has been changed THEN unsaved role should not be cleared after updating password",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            // 1. Open existing user ( use the initial display name in Filter Panel):
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Add new role:
            await userWizard.filterOptionsAndAddRole(appConst.ROLES_DISPLAY_NAME.USERS_ADMINISTRATOR);
            // 3. Change the password:
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            await changePasswordDialog.clickOnGeneratePasswordLink();
            await changePasswordDialog.waitForChangePasswordButtonEnabled();
            await changePasswordDialog.clickOnChangePasswordButton();
            await changePasswordDialog.waitForClosed();
            await userWizard.waitForChangePasswordButtonDisplayed();
            // 4. Click on Save button:
            await userWizard.waitAndClickOnSave();
            await userWizard.waitForNotificationMessage();
            // 5. Verify that unsaved role is not cleared in the form:
            let actualRoles = await userWizard.getSelectedRoles();
            assert.equal(actualRoles[1], appConst.ROLES_DISPLAY_NAME.USERS_ADMINISTRATOR,
                "Content Manager Administrator role should be present");
            assert.equal(actualRoles[0], appConst.ROLES_DISPLAY_NAME.CM_ADMIN, 'Content Manager Administrator role should be present');
        });

    it("GIVEN existing user is opened WHEN e-mail has been changed and saved THEN updated e-mail should be present in the statistics panel",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let userStatisticsPanel = new UserStatisticsPanel();
            let newEmail = userItemsBuilder.generateEmail(TEST_USER.displayName);
            // 1. Open existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            await userWizard.clearEmailInput();
            // 2. Type new email:
            await userWizard.typeEmail(newEmail);
            // 3. click on Save
            await userWizard.waitAndClickOnSave();
            // 4. Go to the browse-panel:
            await userBrowsePanel.clickOnAppHomeButton();
            let actualEmail = await userStatisticsPanel.getEmail();
            assert.equal(actualEmail[0], newEmail, 'email should be updated on the statistics panel as well');
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
