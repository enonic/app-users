/**
 * Created on 24.10.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const ChangePasswordDialog = require('../page_objects/wizardpanel/change.password.dialog');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('User Wizard and Change Password dialog spec', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let TEST_USER;
    const MEDIUM_PASSWORD = appConst.PASSWORD.MEDIUM;
    const BAD_PASSWORD = '123';

    it("WHEN user-wizard is opened THEN red circle should be present in the wizard, because required inputs are empty",
        async () => {
            let userWizard = new UserWizard();
            await testUtils.clickOnSystemOpenUserWizard();
            let result = await userWizard.waitUntilInvalidIconDisplayed('<Unnamed User>');
            assert.ok(result, 'red circle should be present on the tab, because required inputs are empty');
        });

    it('WHEN user-wizard is opened THEN all required inputs should be present in the page',
        async () => {
            let userWizard = new UserWizard();
            await testUtils.clickOnSystemOpenUserWizard();
            // display name and e-mail inputs should be displayed:
            let isDisplayed = await userWizard.isDisplayNameInputVisible();
            assert.ok(isDisplayed, "Display name input should be displayed");
            isDisplayed = await userWizard.isEmailInputDisplayed();
            assert.ok(isDisplayed, "E-mail name input should be displayed");
            await testUtils.saveScreenshot('change_pass_button_should_not_be_displayed');
            // 'Set Password' button should be displayed:
            await userWizard.waitForSetPasswordButtonDisplayed();
            // Group and Role selectors should be displayed:
            isDisplayed = await userWizard.isGroupOptionsFilterInputDisplayed();
            assert.ok(isDisplayed, "'Groups' selector should be displayed");
            isDisplayed = await userWizard.isRoleOptionsFilterInputDisplayed();
            assert.ok(isDisplayed, "'Roles' selector should be displayed");
        });

    it('GIVEN `User` wizard is opened WHEN name, e-mail, password have been typed THEN red circle should not be present on the tab',
        async () => {
            let userWizard = new UserWizard();
            let displayName = userItemsBuilder.generateRandomName('user');
            let email = userItemsBuilder.generateEmail(displayName);
            TEST_USER = userItemsBuilder.buildUser(displayName, MEDIUM_PASSWORD, email, null, null);
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(TEST_USER);
            let result = await userWizard.waitUntilInvalidIconDisappears(TEST_USER.displayName);
            assert.ok(result, 'red circle should not be present in the tab, because all required inputs are filled');
            // 'Save' button gets enabled, otherwise exception will be thrown:
            await userWizard.waitForSaveButtonEnabled();
        });

    it("GIVEN name, e-mail, password have been typed WHEN 'Save' button has been pressed THEN 'Change Password' button gets visible",
        async () => {
            let userWizard = new UserWizard();
            let displayName = userItemsBuilder.generateRandomName('user');
            let email = userItemsBuilder.generateEmail(displayName);
            TEST_USER = userItemsBuilder.buildUser(displayName, MEDIUM_PASSWORD, email, null, null);
            // 1. Open the wizard for new user;
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Type the data:
            await userWizard.typeData(TEST_USER);
            // 3. Click on Save button:
            await userWizard.waitAndClickOnSave();
            await testUtils.saveScreenshot('user_change_password_button_displayed');
            // 4. Verify 'Change Password' button is displayed
            await userWizard.waitForChangePasswordButtonDisplayed();
            await userWizard.waitForClearPasswordButtonDisplayed();
            await userWizard.waitForAddPublicKeyButtonDisplayed();
        });

    it('GIVEN existing user is opened WHEN name input has been cleared THEN red circle should appears in the tab',
        async () => {
            let userWizard = new UserWizard();
            // 1. Open the existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Clear the name-input:
            await userWizard.clearDisplayNameInput();
            // 3. Verify that red icon appears in the wizard for unnamed user:
            let result = await userWizard.waitUntilInvalidIconDisplayed('<Unnamed User>');
            assert.ok(result, 'red circle should appears in the tab, because display-name input has been cleared');
            // 4. Verify that 'Save' button gets disabled now:
            await userWizard.waitForSaveButtonDisabled();
        });

    it('GIVEN existing user is opened WHEN `Change Password` button has been pressed THEN modal dialog should appear',
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            // 1. Open the existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Open 'Change Password' dialog:
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            let result = await changePasswordDialog.getUserPath();
            assert.ok(result[0].includes(TEST_USER.displayName), 'Display name of the user should be present in the path');
        });

    it("WHEN 'Change Password Dialog' is opened THEN required elements should be present",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            // 1. Open the user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Open 'Change Password Dialog'
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            await testUtils.saveScreenshot('change_password_dialog');
            let isDisplayed = await changePasswordDialog.isPasswordInputDisplayed();
            assert.ok(isDisplayed, 'Password Input should be displayed');
            // 'Generate' Link should be displayed
            isDisplayed = await changePasswordDialog.waitForGenerateLinkDisplayed();
            // 'Show Password' link should be displayed
            await changePasswordDialog.waitForShowPasswordLinkDisplayed()
            // Verify that 'Change Password' button is disabled:
            await changePasswordDialog.waitForChangePasswordButtonDisabled();
        });

    it("GIVEN 'Change Password Dialog' is opened WHEN '123' password has been typed THEN 'Bad' password status appears AND Change button is disabled",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 1. Open 'Change Password Dialog'
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            await testUtils.saveScreenshot('change_password_dialog_2');
            // 2. Insert an easy password:
            await changePasswordDialog.typePassword(BAD_PASSWORD);
            let status = await changePasswordDialog.getPasswordStatus();
            await testUtils.saveScreenshot('change_password_bad_status');
            assert.equal(status, appConst.PASSWORD_STATE.BAD, "bad password's status should be displayed");
            // Verify than 'Change Password' button is disabled if the state is BAD :
            await changePasswordDialog.waitForChangePasswordButtonDisabled();
        });

    it("GIVEN 'Change Password Dialog' is opened WHEN new password has been generated THEN 'Strong' password status appears AND Change button gets enabled",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 1. Open 'Change Password Dialog'
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            // 2. Generate new password:
            await changePasswordDialog.clickOnGeneratePasswordLink();
            // 3. Check the password's status:
            let status = await changePasswordDialog.getPasswordStatus();
            await testUtils.saveScreenshot('change_password_strong_status');
            assert.ok(status === appConst.PASSWORD_STATE.STRONG || status === appConst.PASSWORD_STATE.EXCELLENT,
                "Strong or Excellent password's status should be displayed");
            // 4. Verify that 'Change Password' button is enabled:
            await changePasswordDialog.waitForChangePasswordButtonEnabled();
        });

    it("WHEN 'Change Password Dialog' is opened THEN 'Show password' link has been clicked THEN 'Hide' button should appear",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            // 1. Existing user is opened:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Click on Set Password button:
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            // 3. Click on 'Show Password':
            await changePasswordDialog.clickOnShowPasswordLink();
            // Verify that 'Hide' button should appear
            await changePasswordDialog.waitForHideLinkDisplayed();
        });

    it("WHEN 'Change Password Dialog' is opened THEN 'Generate password' link has been clicked THEN generated 'password' should appear",
        async () => {
            let changePasswordDialog = new ChangePasswordDialog();
            let userWizard = new UserWizard();
            // 1. Open the existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Click on Change password button:
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            // 3. Click on 'Generate' button:
            await changePasswordDialog.clickOnGeneratePasswordLink();
            await testUtils.saveScreenshot('change_password_generated');
            // 4. Verify that password is generated:
            let password = await changePasswordDialog.getPasswordText();
            assert.ok(password.length > 4, 'password should be generated');
        });

    it("GIVEN 'Change Password Dialog' is opened WHEN 'Cancel' button has been clicked THEN the dialog should be closed",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            // 1. Open an existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Click on 'Change password' button
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            // 3. Click on Cancel button in the modal dialog:
            await changePasswordDialog.clickOnCancelButton();
            await changePasswordDialog.waitForClosed();
        });

    it("GIVEN 'Change Password Dialog' is opened WHEN 'Cancel-top' button has been clicked THEN the dialog should be closed",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 1. Open 'Change Password Dialog'
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            // 2. Click on Cancel-top button:
            await changePasswordDialog.clickOnCancelButtonTop();
            await changePasswordDialog.waitForClosed();
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
