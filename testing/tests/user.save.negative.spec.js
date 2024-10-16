/**
 * Created on 25.09.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('User Wizard negative spec ', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let testUser;
    const MEDIUM_PASSWORD = appConst.PASSWORD.MEDIUM;
    const WEAK_PASSWORD = appConst.PASSWORD.WEAK;

    it("GIVEN wizard for new User is opened WHEN data with weak password has been typed THEN 'Save' button should be disabled",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, WEAK_PASSWORD, userItemsBuilder.generateEmail(userName), null);
            await testUtils.clickOnSystemOpenUserWizard();
            // 1. Type a data with weak password:
            await userWizard.typeData(testUser);
            // 2. Verify that Weak state of the password is displayed
            let status = await userWizard.getPasswordStatus();
            assert.equal(status, appConst.PASSWORD_STATE.WEAK, "Weak state of password should be displayed");
            // 3. Verify that 'Save' button is disabled:
            await userWizard.waitForSaveButtonDisabled();
            // 4. Verify that user is not valid:
            await userWizard.waitUntilInvalidIconAppears(testUser.displayName);
        });

    it("GIVEN wizard for new User is opened WHEN data with medium password has been typed THEN 'Save' button should be enabled",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, MEDIUM_PASSWORD, userItemsBuilder.generateEmail(userName), null);
            await testUtils.clickOnSystemOpenUserWizard();
            // 1. Type a data with medium password:
            await userWizard.typeData(testUser);
            // 2. Verify that 'Save' button is enabled:
            await userWizard.waitForSaveButtonEnabled();
            // 3. Verify that Medium state of the password is displayed
            let status = await userWizard.getPasswordStatus();
            assert.equal(status, appConst.PASSWORD_STATE.MEDIUM, "Medium state of password should be displayed");
            // 4. Verify that red icon is not visible and the user is valid
            await userWizard.waitUntilInvalidIconDisappears(testUser.displayName);
        });

    it("GIVEN wizard for new User is opened WHEN name and e-mail have been typed THEN red circle should be displayed in the wizard page",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, MEDIUM_PASSWORD, userItemsBuilder.generateEmail(userName), null);
            // 1. Open wizard for new user:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Type an email and displayName:
            await userWizard.typeEmail(testUser.email);
            await userWizard.typeDisplayName(testUser.displayName);
            // 3. Verify that red icon is not displayed in the tab:
            let isRedIconPresent = await userWizard.waitUntilInvalidIconAppears(testUser.displayName);
            assert.ok(isRedIconPresent, "red circle should be visible in the tab, because 'password' is empty");
        });

    it("GIVEN wizard for new User is opened WHEN all data has been typed THEN red circle gets not visible in the wizard page",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, MEDIUM_PASSWORD, userItemsBuilder.generateEmail(userName), null);
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(testUser);
            let isRedIconNotPresent = await userWizard.waitUntilInvalidIconDisappears(testUser.displayName);
            assert.ok(isRedIconNotPresent, "red circle gets not visible, because all required inputs are filled");
        });

    it("GIVEN wizard for new User is opened AND all required inputs has been filled in WHEN password has been cleared THEN red circle gets visible again",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, MEDIUM_PASSWORD, userItemsBuilder.generateEmail(userName), null);
            // 1. Wizard for new user is opened:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Fill in the name, email, password inputs:
            await userWizard.typeData(testUser);
            // 3. password input has been cleared:
            await userWizard.clearPasswordInput();
            // 4. Verify that red icon appears in the wizard page
            let isRedIconPresent = await userWizard.waitUntilInvalidIconAppears(testUser.displayName);
            assert.ok(isRedIconPresent, "red circle gets visible, because 'password' input has been cleared");
        });

    it("GIVEN wizard for new User is opened AND all data has been typed WHEN e-mail has been cleared THEN red circle gets visible",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName("user");
            testUser = userItemsBuilder.buildUser(userName, MEDIUM_PASSWORD, userItemsBuilder.generateEmail(userName), null);
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(testUser);
            // e-mail has been cleared:
            await userWizard.clearEmailInput();
            // Verify that red icon appears in the tab:
            let isRedIconPresent = await userWizard.waitUntilInvalidIconAppears(testUser.displayName);
            assert.ok(isRedIconPresent, "red circle gets visible, because 'email' input has been cleared");
        });

    it("GIVEN all data has been typed in new wizard WHEN e-mail is invalid THEN red circle should be visible",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, MEDIUM_PASSWORD, 'notvalid@@@mail.com', null);
            await testUtils.clickOnSystemOpenUserWizard();
            // email is invalid:
            await userWizard.typeData(testUser);
            // Verify that red icon is displayed in the tab:
            let result = await userWizard.waitUntilInvalidIconAppears(testUser.displayName);
            assert.ok(result, "red circle should be visible, because 'e-mail' is not valid");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});
