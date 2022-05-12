/**
 * Created on 24.10.2017.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const ChangePasswordDialog = require('../page_objects/wizardpanel/change.password.dialog');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('User Wizard and Change Password dialog spec', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === "undefined") {
        webDriverHelper.setupBrowser();
    }
    let testUser;
    const MEDIUM_PASSWORD = appConst.PASSWORD.MEDIUM;
    const BAD_PASSWORD = "123";

    it("WHEN user-wizard is opened THEN red circle should be present in the wizard, because required inputs are empty",
        async () => {
            let userWizard = new UserWizard();
            await testUtils.clickOnSystemOpenUserWizard();
            let result = await userWizard.waitUntilInvalidIconAppears('<Unnamed User>');
            assert.isTrue(result, 'red circle should be present on the tab, because required inputs are empty');
        });

    it('WHEN user-wizard is opened THEN all required inputs should be present in the page',
        async () => {
            let userWizard = new UserWizard();
            await testUtils.clickOnSystemOpenUserWizard();
            let isDisplayed = await userWizard.isDisplayNameInputVisible();
            assert.isTrue(isDisplayed, "Display name input should be displayed");
            isDisplayed = await userWizard.isEmailInputDisplayed();
            assert.isTrue(isDisplayed, "E-mail name input should be displayed");
            testUtils.saveScreenshot('change_pass_button_should_not_be_displayed');
            isDisplayed = await userWizard.isPasswordInputDisplayed();
            assert.isTrue(isDisplayed, "Password-input should be displayed");
            isDisplayed = await userWizard.isGroupOptionsFilterInputDisplayed();
            assert.isTrue(isDisplayed, "'Groups' selector should be displayed");
            isDisplayed = await userWizard.isRoleOptionsFilterInputDisplayed();
            assert.isTrue(isDisplayed, "'Roles' selector should be displayed");
            isDisplayed = await userWizard.isChangePasswordButtonDisplayed();
            assert.isFalse(isDisplayed, "'Change Password' button should not be displayed");
        });

    it('GIVEN `User` wizard is opened WHEN name, e-mail, password have been typed THEN red circle should not be present on the tab',
        async () => {
            let userWizard = new UserWizard();
            let displayName = userItemsBuilder.generateRandomName('user');
            let email = userItemsBuilder.generateEmail(displayName);
            testUser = userItemsBuilder.buildUser(displayName, MEDIUM_PASSWORD, email, null, null);
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(testUser);
            let result = await userWizard.waitUntilInvalidIconDisappears(testUser.displayName);
            assert.isTrue(result, 'red circle should not be present in the tab, because all required inputs are filled');
            //'Save' button gets enabled, otherwise exception will be thrown:
            await userWizard.waitForSaveButtonEnabled();
        });

    it("GIVEN name, e-mail, password have been typed WHEN 'Save' button has been pressed THEN 'Change Password' button gets visible",
        async () => {
            let userWizard = new UserWizard();
            let displayName = userItemsBuilder.generateRandomName('user');
            let email = userItemsBuilder.generateEmail(displayName);
            testUser = userItemsBuilder.buildUser(displayName, MEDIUM_PASSWORD, email, null, null);
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(testUser);
            await userWizard.waitAndClickOnSave();
            await testUtils.saveScreenshot("user_change_password_button_displayed");
            //Verify 'Change Password' button is visible
            await userWizard.waitForChangePasswordButtonDisplayed();
        });

    it('GIVEN existing user is opened WHEN name input has been cleared THEN red circle should appears in the tab',
        async () => {
            let userWizard = new UserWizard();
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            //Clear the name-input:
            await userWizard.clearDisplayNameInput();
            let result = await userWizard.waitUntilInvalidIconAppears('<Unnamed User>');
            assert.isTrue(result, 'red circle should appears in the tab, because display-name input has been cleared');
            //'Save' button gets disabled now:
            await userWizard.waitForSaveButtonDisabled();
        });

    it('GIVEN existing user is opened WHEN `Change Password` button has been pressed THEN modal dialog should appear',
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            //1. Open the existing user:
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            //2. Open Change Password dialog:
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            let result = await changePasswordDialog.getUserPath();
            assert.isTrue(result[0].includes(testUser.displayName), 'Display name of the user should be present in the path');
        });

    it("WHEN 'Change Password Dialog' is opened THEN required elements should be present",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            //Open 'Change Password Dialog'
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            let isDisplayed = await changePasswordDialog.isPasswordInputDisplayed();
            assert.isTrue(isDisplayed, 'Password Input should be displayed');
            isDisplayed = await changePasswordDialog.isGenerateLinkDisplayed();
            assert.isTrue(isDisplayed, 'Generate Link should be displayed');
            isDisplayed = await changePasswordDialog.isShowLinkDisplayed();
            assert.isTrue(isDisplayed, 'Show Password Link should be displayed');
            //Verify that 'Change Password' button is disabled:
            await changePasswordDialog.waitForChangePasswordButtonDisabled();
        });

    it("GIVEN 'Change Password Dialog' is opened WHEN '123' password has been typed THEN 'Bad' password status appears AND Change button is disabled",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            //1. Open 'Change Password Dialog'
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            //2. Insert an easy password:
            await changePasswordDialog.typePassword(BAD_PASSWORD);
            let status = await changePasswordDialog.getPasswordStatus();
            testUtils.saveScreenshot('change_password_bad_status');
            assert.equal(status, appConst.PASSWORD_STATE.BAD, "bad password's status should be displayed");
            //Verify than 'Change Password' button is disabled:
            await changePasswordDialog.waitForChangePasswordButtonDisabled();
        });

    it("GIVEN 'Change Password Dialog' is opened WHEN new password has been generated THEN 'Strong' password status appears AND Change button gets enabled",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            //1. Open 'Change Password Dialog'
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            //2. Generate new password:
            await changePasswordDialog.clickOnGeneratePasswordLink();
            //3. Check the password's status:
            let status = await changePasswordDialog.getPasswordStatus();
            await testUtils.saveScreenshot('change_password_strong_status');
            assert.isTrue(status == appConst.PASSWORD_STATE.STRONG || status == appConst.PASSWORD_STATE.EXCELLENT,
                "Strong or Excellent password's status should be displayed");
            //4. Verify that 'Change Password' button is enabled:
            await changePasswordDialog.waitForChangePasswordButtonEnabled();
        });

    it("WHEN 'Change Password Dialog' is opened THEN 'Show password' link has been clicked THEN 'Hide' button should appear",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            //Existing user is opened:
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            //Click on Show Password:
            await changePasswordDialog.clickOnShowPasswordLink();
            let result = await changePasswordDialog.isHideLinkDisplayed();
            await assert.isTrue(result, "'Hide' button should appear");
        });

    it("WHEN 'Change Password Dialog' is opened THEN 'Generate password' link has been clicked THEN generated 'password' should appear",
        async () => {
            let changePasswordDialog = new ChangePasswordDialog();
            let userWizard = new UserWizard();
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            //Click on 'Generate' button:
            await changePasswordDialog.clickOnGeneratePasswordLink();
            let password = await changePasswordDialog.getPasswordString();
            assert.isTrue(password.length > 0, 'password should be generated');
        });

    it("GIVEN 'Change Password Dialog' is opened WHEN 'Cancel' button has been clicked THEN the dialog should be closed",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            //Click on Cancel button:
            await changePasswordDialog.clickOnCancelButton();
            await changePasswordDialog.waitForClosed();
        });

    it("GIVEN 'Change Password Dialog' is opened WHEN 'Cancel-top' button has been clicked THEN the dialog should be closed",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            //1. Open 'Change Password Dialog'
            await userWizard.clickOnChangePasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            //2. Click on Cancel-top:
            await changePasswordDialog.clickOnCancelButtonTop();
            await changePasswordDialog.waitForClosed();
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});
