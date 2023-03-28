/**
 * Created on 04.10.2017.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const UserStatisticsPanel = require('../page_objects/browsepanel/user.statistics.panel');
const ChangePasswordDialog = require('../page_objects/wizardpanel/change.password.dialog');

describe('edit.user.spec: Edit an user - change e-mail, name and roles', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    let testUser;
    let PASSWORD = appConst.PASSWORD.MEDIUM;

    it("GIVEN 'User' with a role has been saved WHEN the user has been clicked THEN correct role should be displayed in the statistic panel",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let userStatisticsPanel = new UserStatisticsPanel();
            let userName = userItemsBuilder.generateRandomName('user');
            let roles = [appConst.ROLES_DISPLAY_NAME.CM_ADMIN, appConst.ROLES_DISPLAY_NAME.USERS_ADMINISTRATOR];
            testUser = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), roles);
            //1. Select System folder and open User Wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            testUtils.saveScreenshot('edit_user_wizard1');
            await userWizard.typeData(testUser);
            //2. Save the user:
            testUtils.saveScreenshot('edit_user_wizard2');
            await userWizard.waitAndClickOnSave();
            //3. Go to Browse Panel:
            await userBrowsePanel.clickOnAppHomeButton();
            //4. Select the user in the grid
            await testUtils.typeNameInFilterPanel(userName);
            await userBrowsePanel.clickOnRowByName(userName);
            testUtils.saveScreenshot('edit_user_wizard4');
            let actualRoles = await userStatisticsPanel.getDisplayNameOfRoles();

            assert.equal(actualRoles[0], appConst.ROLES_DISPLAY_NAME.CM_ADMIN,
                "'Content Manager Administrator' role should be present in the panel");
            assert.equal(actualRoles[1], appConst.ROLES_DISPLAY_NAME.USERS_ADMINISTRATOR,
                "'Content Manager Administrator' role should be present in the panel");

            let actualName = await userStatisticsPanel.getItemName();
            assert.equal(actualName, userName, "Expected and actual name should be equal");
        });

    it("GIVEN existing user is opened WHEN display name has been changed THEN user should be searchable with the new display name",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            await userWizard.typeDisplayName('new-name');
            await testUtils.saveAndCloseWizard('new-name');
            //Save new display name:
            await testUtils.typeNameInFilterPanel('new-name');
            let isDisplayed = await userBrowsePanel.isItemDisplayed(testUser.displayName);
            assert.isTrue(isDisplayed, "User with new display name should be searchable in the grid");
        });

    it("GIVEN existing user is opened WHEN one role has been removed THEN this role should not be present in the statistics panel",
        async () => {
            let userWizard = new UserWizard();
            let userStatisticsPanel = new UserStatisticsPanel();
            //1. Open existing user:
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            //2. Remove the role:
            await userWizard.removeRole(appConst.ROLES_DISPLAY_NAME.USERS_ADMINISTRATOR);
            await testUtils.saveAndCloseWizard('new-name');
            //3. Number of roles should be reduced in the Statistics Panel:
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
            // 1. Open existing user:
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            // 2. Add new role:
            await userWizard.filterOptionsAndAddRole(appConst.ROLES_DISPLAY_NAME.USERS_ADMINISTRATOR);
            // 3. Change the password:
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            await changePasswordDialog.clickOnGeneratePasswordLink();
            await changePasswordDialog.waitForChangePasswordButtonEnabled();
            await changePasswordDialog.clickOnChangePasswordButton();
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
            let newEmail = userItemsBuilder.generateEmail(testUser.displayName);
            // 1. Open existing user:
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
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
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});
