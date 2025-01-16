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

    const MEDIUM_PASSWORD = appConst.PASSWORD.MEDIUM;

    it("GIVEN the password input is empty WHEN name, email has been filled in AND Save button clicked THEN 'Set password' button should appears but the user is valid",
        async () => {
            let userWizard = new UserWizard();
            let userName = appConst.generateRandomName('user');
            let email = userItemsBuilder.generateEmail(userName);
            // 1. Open wizard for new user:
            await testUtils.clickOnSystemOpenUserWizard();
            // 1. Type a user data with a weak password:
            await userWizard.typeDisplayName(userName);
            await userWizard.typeEmail(email);
            // 2. Click on 'Set password' button:
            await userWizard.clickOnSetPasswordButton();
            // 3. Do not type a password but save the user:
            await userWizard.waitAndClickOnSave();
            // 4. Verify that 'Set password' button is displayed:
            await userWizard.waitForSetPasswordButtonDisplayed();
            await testUtils.saveScreenshot('user_wizard_with_the_only_password');
            // 5. Verify that user is valid:
            await userWizard.waitUntilInvalidIconDisappears(userName);
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
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});
