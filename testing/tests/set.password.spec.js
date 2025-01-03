/**
 * Created on 03.01.2025
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const ChangePasswordDialog = require('../page_objects/wizardpanel/change.password.dialog');

describe('Tests for set password modal dialog', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    const MEDIUM_PASSWORD = appConst.PASSWORD.MEDIUM;

    it("GIVEN wizard for new User is opened WHEN the only a valid password has been set THEN 'Save' button should be disabled in the wizard",
        async () => {
            let changePasswordDialog = new ChangePasswordDialog();
            let userWizard = new UserWizard();
            // 1. Open wizard for new user:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Click on 'Set password' button:
            await userWizard.clickOnSetPasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            // 3. Fill in the password input with a medium password:
            await changePasswordDialog.typePassword(MEDIUM_PASSWORD);
            // 4. Verify that 'Set password' button gets enabled, click on it and close the dialog:
            await changePasswordDialog.clickOnSetPasswordButton();
            await changePasswordDialog.waitForClosed();
            await testUtils.saveScreenshot('user_wizard_with_the_only_password');
            // 5. Verify that Weak state of the password is displayed
            await userWizard.waitUntilInvalidIconDisplayed('<Unnamed User>');
            // 6. Verify that 'Save' button is disabled in the wizard:
            await userWizard.waitForSaveButtonDisabled();
        });

    it("GIVEN 'Set password' modal dialog has been opened WHEN 'Cancel' button has been clicked THEN the dialog closes and 'Save' button should be disabled in the wizard",
        async () => {
            let changePasswordDialog = new ChangePasswordDialog();
            let userWizard = new UserWizard();
            // 1. Open wizard for new user:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Click on 'Set password' button:
            await userWizard.clickOnSetPasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            // 3. Click on Cancel button and close the dialog:
            await changePasswordDialog.clickOnCancelButton();
            // 4. Verify that 'Save' button is disabled in the wizard and the modal dialog is closed:
            await changePasswordDialog.waitForClosed();
            await userWizard.waitForSaveButtonDisabled();
            // 5. Verify that Weak state of the password is displayed
            await userWizard.waitUntilInvalidIconDisplayed('<Unnamed User>');
        });

    it("GIVEN 'Set password' modal dialog has been opened AND 'Generate' button has been clicked WHEN 'Cancel' button has been clicked THEN the dialog closes and 'Save' button should be disabled in the wizard",
        async () => {
            let changePasswordDialog = new ChangePasswordDialog();
            let userWizard = new UserWizard();
            // 1. Open wizard for new user:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Click on 'Set password' button:
            await userWizard.clickOnSetPasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            // 3. Click on 'Generate' button in the modal dialog:
            await changePasswordDialog.clickOnGeneratePasswordLink();
            // 4. Click on Cancel button and close the dialog:
            await changePasswordDialog.clickOnCancelButton();
            // 4. Verify that 'Save' button is disabled in the wizard and the modal dialog is closed:
            await changePasswordDialog.waitForClosed();
            await userWizard.waitForSaveButtonDisabled();
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});
