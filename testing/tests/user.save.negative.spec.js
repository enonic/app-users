/**
 * Created on 25.09.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('Negative ui-tests for user wizard ', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let TEST_USER;
    const MEDIUM_PASSWORD = appConst.PASSWORD.MEDIUM;
    const WEAK_PASSWORD = appConst.PASSWORD.WEAK;
    const INVALID_EMAIL = 'invalid@@@mail.com';

    it("GIVEN wizard for new User is opened WHEN weak password has been typed THEN 'Save' button should be disabled",
        async () => {
            let userWizard = new UserWizard();
            let userName = appConst.generateRandomName('user');
            let email = userItemsBuilder.generateEmail(userName);
            await testUtils.clickOnSystemOpenUserWizard();
            // 1. Type a user data with a weak password:
            await userWizard.typeDisplayName(userName);
            await userWizard.typeEmail(email);
            await userWizard.clickOnSetPasswordButton();
            await userWizard.typePassword(WEAK_PASSWORD);
            // 3. Verify that 'Weak' state of the password is displayed
            let actualStatus = await userWizard.getPasswordStatus();
            assert.equal(actualStatus, appConst.PASSWORD_STATE.WEAK, "'Weak' state of the password should be displayed");
            // 4. Verify that user is invalid:
            await userWizard.waitUntilInvalidIconDisplayed(userName);
            await userWizard.waitForSaveButtonDisabled();
        });

    it("GIVEN a user's name and email has been filled in WHEN a medium password has been set THEN the red icon disappears in the wizard 'Save' button should be enabled",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            TEST_USER = userItemsBuilder.buildUser(userName, MEDIUM_PASSWORD, userItemsBuilder.generateEmail(userName), null);
            await testUtils.clickOnSystemOpenUserWizard();
            // 1. Type a user-name and email:
            await userWizard.typeDisplayName(userName);
            await userWizard.typeEmail(TEST_USER.email);
            // 2. Insert a medium password:
            await userWizard.clickOnSetPasswordButton();
            await userWizard.typePassword(MEDIUM_PASSWORD);
            // 3. Verify that 'Medium' state of the password is displayed:
            let actualStatus = await userWizard.getPasswordStatus();
            assert.equal(actualStatus, appConst.PASSWORD_STATE.MEDIUM, "'Medium' state of the password should be displayed");
            // 4. Verify that red icon is not visible and the user is valid
            await userWizard.waitUntilInvalidIconDisappears(TEST_USER.displayName);
            await userWizard.waitForSaveButtonEnabled();
        });

    // Password must be optional for Service Account 1808
    it("GIVEN wizard for new User is opened WHEN only the name and e-mail have been typed THEN red circle should not be displayed in the wizard page",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            TEST_USER = userItemsBuilder.buildUser(userName, MEDIUM_PASSWORD, userItemsBuilder.generateEmail(userName), null);
            // 1. Open wizard for new user:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Type an email and displayName:
            await userWizard.typeEmail(TEST_USER.email);
            await userWizard.typeDisplayName(TEST_USER.displayName);
            // 3. Verify that red icon should not be displayed in the tab, because Password must be optional for Service Account
            let isRedIconPresent = await userWizard.waitUntilInvalidIconDisappears(TEST_USER.displayName);
            assert.ok(isRedIconPresent, "red circle should not be displayed in the tab, because 'password' is optional");
        });

    it("GIVEN wizard for new User is opened WHEN all data has been typed THEN red circle gets not visible in the wizard page",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            TEST_USER = userItemsBuilder.buildUser(userName, MEDIUM_PASSWORD, userItemsBuilder.generateEmail(userName), null);
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(TEST_USER);
            let isRedIconNotPresent = await userWizard.waitUntilInvalidIconDisappears(TEST_USER.displayName);
            assert.ok(isRedIconNotPresent, "red circle gets not visible, because all required inputs are filled");
        });

    it("GIVEN wizard for new User is opened AND all data has been typed WHEN e-mail has been cleared THEN red circle gets visible",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            TEST_USER = userItemsBuilder.buildUser(userName, MEDIUM_PASSWORD, userItemsBuilder.generateEmail(userName), null);
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(TEST_USER);
            // e-mail has been cleared:
            await userWizard.clearEmailInput();
            // Verify that red icon appears in the tab:
            let isRedIconPresent = await userWizard.waitUntilInvalidIconDisplayed(TEST_USER.displayName);
            assert.ok(isRedIconPresent, "red circle gets visible, because 'email' input has been cleared");
        });

    it("GIVEN all user data has been typed in new wizard WHEN e-mail is invalid THEN red circle should be visible",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            TEST_USER = userItemsBuilder.buildUser(userName, MEDIUM_PASSWORD, INVALID_EMAIL, null);
            await testUtils.clickOnSystemOpenUserWizard();
            // email is invalid:
            await userWizard.typeData(TEST_USER);
            // Verify that red icon is displayed in the tab:
            let result = await userWizard.waitUntilInvalidIconDisplayed(TEST_USER.displayName);
            assert.ok(result, "red circle should be visible, because 'e-mail' is invalid");
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
