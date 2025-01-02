/**
 * Created on 25.09.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const ChangePasswordDialog = require('../page_objects/wizardpanel/change.password.dialog');

describe('User Wizard negative spec ', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let testUser;
    const MEDIUM_PASSWORD = appConst.PASSWORD.MEDIUM;
    const WEAK_PASSWORD = appConst.PASSWORD.WEAK;

    it("GIVEN wizard for new User is opened WHEN weak password has been typed THEN 'Set password' button should be disabled",
        async () => {
            let changePasswordDialog = new ChangePasswordDialog();
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, WEAK_PASSWORD, userItemsBuilder.generateEmail(userName), null);
            await testUtils.clickOnSystemOpenUserWizard();
            // 1. Type a data with weak password:
            await userWizard.typeDisplayName(userName);
            await userWizard.typeEmail(testUser.email);

            await userWizard.clickOnSetPasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            await changePasswordDialog.typePassword(WEAK_PASSWORD);
            // 2. Verify that Weak state of the password is displayed
            await changePasswordDialog.waitForSetPasswordButtonDisabled();
            let actualStatus = await changePasswordDialog.getPasswordStatus();
            assert.equal(actualStatus, appConst.PASSWORD_STATE.WEAK);

        });

    it("GIVEN wizard for new User is opened WHEN medium password has been typed THEN 'Save' button should be enabled",
        async () => {
            let userWizard = new UserWizard();
            let changePasswordDialog = new ChangePasswordDialog();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, MEDIUM_PASSWORD, userItemsBuilder.generateEmail(userName), null);
            await testUtils.clickOnSystemOpenUserWizard();
            // 1. Type a data with medium password:
            await userWizard.typeDisplayName(userName);
            await userWizard.typeEmail(testUser.email);

            await userWizard.clickOnSetPasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            await changePasswordDialog.typePassword(MEDIUM_PASSWORD);
            // 3. Verify that Medium state of the password is displayed
            await changePasswordDialog.waitForSetPasswordButtonEnabled();
            let actualStatus = await changePasswordDialog.getPasswordStatus();
            assert.equal(actualStatus, appConst.PASSWORD_STATE.MEDIUM, "Medium state of the password should be displayed");
            await changePasswordDialog.clickOnSetPasswordButton();
            await changePasswordDialog.waitForClosed();
            // 4. Verify that red icon is not visible and the user is valid
            await userWizard.waitUntilInvalidIconDisappears(testUser.displayName);
        });

    // Password must be optional for Service Account 1808
    it("GIVEN wizard for new User is opened WHEN only the name and e-mail have been typed THEN red circle should not be displayed in the wizard page",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, MEDIUM_PASSWORD, userItemsBuilder.generateEmail(userName), null);
            // 1. Open wizard for new user:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Type an email and displayName:
            await userWizard.typeEmail(testUser.email);
            await userWizard.typeDisplayName(testUser.displayName);
            // 3. Verify that red icon should not be displayed in the tab, because Password must be optional for Service Account
            let isRedIconPresent = await userWizard.waitUntilInvalidIconDisappears(testUser.displayName);
            assert.ok(isRedIconPresent, "red circle should not be displayed in the tab, because 'password' is empty");
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
