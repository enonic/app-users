/**
 * Created on 17.01.2025
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');

describe('clear.password.spec: tests for Clear password button', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    let TEST_USER;
    const PASSWORD = appConst.PASSWORD.MEDIUM;

    it("GIVEN new user with a password(medium) has been saved WHEN 'Clear' password button has been clicked THEN confirmation dialog should appear",
        async () => {
            let userWizard = new UserWizard();
            let confirmationDialog = new ConfirmationDialog();
            let userName = userItemsBuilder.generateRandomName('user');
            TEST_USER = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), null);
            // 1. Select 'System' folder and open User Wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Insert the required data:
            await userWizard.typeData(TEST_USER);
            // 3. Save the user:
            await userWizard.waitAndClickOnSave();
            // 4. Verify that 'Change password' button is displayed:
            await userWizard.waitForChangePasswordButtonDisplayed();
            // 5. Verify that 'Clear password' button is displayed:
            await userWizard.waitForClearPasswordButtonDisplayed();
            // 6. Verify that 'Add public key' button is displayed:
            await userWizard.waitForAddPublicKeyButtonDisplayed();
            // 7. Click on 'Clear password' button:
            await userWizard.clickOnClearPasswordButton();
            // 8. Verify that confirmation dialog is displayed:
            await confirmationDialog.waitForDialogLoaded();
            let question = await confirmationDialog.getQuestionText();
            assert.ok(question.includes('Are you sure you want to clear the password?'), 'Expected question should be displayed');
            // 9. Click on button 'No':
            await confirmationDialog.clickOnNoButton();
            // 10. Verify that confirmation dialog is closed:
            await confirmationDialog.waitForDialogClosed();
            // 11. Verify that 'Change password' button remains displayed:
            await userWizard.waitForChangePasswordButtonDisplayed();
            await userWizard.waitForClearPasswordButtonDisplayed();
            await userWizard.waitForAddPublicKeyButtonDisplayed();
        });

    it("WHEN 'Clear password' button has been clicked THEN 'Set password' button gets visible AND Save button remains enabled",
        async () => {
            let userWizard = new UserWizard();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Open the existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Click on 'Clear Password' button:
            await userWizard.clickOnClearPasswordButton();
            await confirmationDialog.waitForDialogLoaded();
            // 3. Click on button 'Yes':
            await confirmationDialog.clickOnYesButton();
            await confirmationDialog.waitForDialogClosed();
            await testUtils.saveScreenshot('password_cleared');
            // 6. Verify that 'Set password' button is displayed
            await userWizard.waitForSetPasswordButtonDisplayed();
            // 5. Verify that 'Change password' button is not displayed now and 'Clear password' button is not displayed:
            await userWizard.waitForChangePasswordButtonNotDisplayed();
            await userWizard.waitForClearPasswordButtonNotDisplayed();
            await userWizard.waitForAddPublicKeyButtonDisplayed();
            await userWizard.waitForSaveButtonEnabled();
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});
