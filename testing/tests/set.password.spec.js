/**
 * Created on 03.01.2025
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const userItemsBuilder = require('../libs/userItems.builder');
const assert = require('node:assert');

describe('Tests for set password modal dialog', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it("GIVEN name, email are filled in WHEN Set password button has been clicked THEN empty password input gets visible AND 'Save' button should be disabled and the user is invalid",
        async () => {
            let userWizard = new UserWizard();
            let userName = appConst.generateRandomName('user');
            let email = userItemsBuilder.generateEmail(userName);
            // 1. Open wizard for new user:
            await testUtils.clickOnSystemOpenUserWizard();
            // 1. Type a user data(email and name):
            await userWizard.typeDisplayName(userName);
            await userWizard.typeEmail(email);
            // 2. Click on 'Set password' button:
            await userWizard.clickOnSetPasswordButton();
            // 3. Verify that Save button should be disabled now:
            await userWizard.waitForSaveButtonDisabled();
            await testUtils.saveScreenshot('user_wizard_opened_password_section');
            // 4. Verify that 'password input' button is displayed now:
            await userWizard.waitForPasswordInputDisplayed();
            // 5. Verify that user gets invalid now :
            await userWizard.waitUntilInvalidIconDisplayed(userName);
            // 6. Click on remove-icon. Password section gets not displayed:
            await userWizard.clickOnRemovePasswordSection();
            await userWizard.waitForPasswordInputNotDisplayed();
            await testUtils.saveScreenshot('user_wizard_closed_password_section');
            // 7. Verify that user is valid now :
            await userWizard.waitUntilInvalidIconDisappears(userName);
            await userWizard.waitForSetPasswordButtonDisplayed();
        });

    it("GIVEN a password has been generated WHEN RemovePasswordSection has been clicked THEN password section gets not displayed AND Save button is enabled",
        async () => {
            let userWizard = new UserWizard();
            let userName = appConst.generateRandomName('user');
            let email = userItemsBuilder.generateEmail(userName);
            // 1. Open wizard for new user:
            await testUtils.clickOnSystemOpenUserWizard();
            // 1. Type a user data(email and name):
            await userWizard.typeDisplayName(userName);
            await userWizard.typeEmail(email);
            // 2. Click on 'Set password' button:
            await userWizard.clickOnSetPasswordButton();
            await userWizard.waitForPasswordInputDisplayed();
            // 3. Verify that Save button should be disabled now:
            await userWizard.waitForSaveButtonDisabled();
            await userWizard.clickOnGenerateLink();
            await testUtils.saveScreenshot('user_wizard_opened_password_section_generated');
            // 6. Click on remove-icon. Password section gets not displayed:
            await userWizard.clickOnRemovePasswordSection();
            await userWizard.waitForPasswordInputNotDisplayed();
            // 7. Verify that user remains valid:
            await userWizard.waitUntilInvalidIconDisappears(userName);
            await userWizard.waitForSetPasswordButtonDisplayed();
        });

    it("GIVEN user-wizard is opened WHEN 'Generate' link has been pressed THEN new password should be generated",
        async () => {
            let userWizard = new UserWizard();
            // 1. Open new user-wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Click on 'Set password' button:
            await userWizard.clickOnSetPasswordButton();
            // 3. Click on 'generate':
            await userWizard.clickOnGenerateLink();
            await userWizard.clickOnShowPasswordLink();
            await testUtils.saveScreenshot('generate_password_link_clicked');
            let result = await userWizard.getTextInPasswordInput();
            assert.ok(result.length > 0, "new password should be generated");
        });

    it("GIVEN user-wizard is opened WHEN 'Show' password link has been clicked THEN 'Hide' link should appear",
        async () => {
            let userWizard = new UserWizard();
            // 1. Open new user-wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Click on 'Set password' button:
            await userWizard.clickOnSetPasswordButton();
            // 3. Click on 'Show Password' button:
            await userWizard.clickOnShowPasswordLink();
            await testUtils.saveScreenshot('show_password_link_clicked');
            // Verify that 'Hide' link gets displayed
            await userWizard.waitForHidePasswordLinkDisplayed();
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
