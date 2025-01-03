/**
 * Created on 12.04.2018.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const ChangePasswordDialog = require('../page_objects/wizardpanel/change.password.dialog');

describe("User Wizard generate password spec", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it("GIVEN 'User' wizard is opened WHEN 'Set password' modal dialog has been opened THEN 'Show' 'Generate' links should be displayed",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            // 1. Open new user-wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.waitForSetPasswordButtonDisplayed();
            // 2. Click on 'Set password' button:
            await userWizard.clickOnSetPasswordButton();
            await testUtils.saveScreenshot('generate_password_link');
            await changePasswordDialog.waitForDialogLoaded();
            // 3. Verify that 'Show' and 'Generate' links are displayed:
            await changePasswordDialog.waitForGenerateLinkDisplayed();
            await changePasswordDialog.waitForShowPasswordLinkDisplayed();
            // 4. Verify that 'Set password' button is disabled:
            await changePasswordDialog.waitForSetPasswordButtonDisabled();
        });

    it("GIVEN 'Set password' modal dialog has been opened WHEN 'Generate' link has been pressed THEN new password should be generated",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            // 1. Open new user-wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Click on 'Set password' button:
            await userWizard.clickOnSetPasswordButton();
            // 3. Click on 'generate' link in the dialog:
            await changePasswordDialog.clickOnGeneratePasswordLink();
            await testUtils.saveScreenshot('generate_password_link_clicked');
            let result = await changePasswordDialog.getPasswordText();
            assert.ok(result.length > 0, "new password should be generated");
            let passwordState = await changePasswordDialog.getPasswordStatus();
            assert.ok(passwordState === appConst.PASSWORD_STATE.STRONG || passwordState === appConst.PASSWORD_STATE.EXCELLENT,
                "Strong or Excellent password's status should be displayed");
            // 4. Verify that 'Set password' button is enabled now :
            await changePasswordDialog.waitForSetPasswordButtonEnabled();
        });

    it("GIVEN 'Set password' modal dialog has been opened WHEN 'Show' password link has been clicked THEN 'Hide' link should appear",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            // 1. Open new user-wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Click on 'Set password' button:
            await userWizard.clickOnSetPasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            // 3. Click on 'Show' Password button:
            await changePasswordDialog.clickOnShowPasswordLink();
            await testUtils.saveScreenshot('show_password_link_clicked');
            // 4. Verify that 'Hide' link should appear:
            await changePasswordDialog.waitForHidePasswordLinkDisplayed();
            await changePasswordDialog.waitForSetPasswordButtonDisabled();
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});
