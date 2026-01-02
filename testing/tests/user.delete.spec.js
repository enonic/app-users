/**
 * Created on 21.11.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const ConfirmationDialog = require("../page_objects/confirmation.dialog");

describe("user.delete.spec:User - confirm and delete an user in wizard and in browse panel", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let TEST_USER;
    let PASSWORD = appConst.PASSWORD.MEDIUM;

    it("GIVEN new user is saved WHEN Delete button in toolbar has been pressed THEN Confirmation dialog should appear",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            let confirmationDialog = new ConfirmationDialog();
            TEST_USER = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), null);
            // 1. Open new user-wizard, save the data:
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(TEST_USER);
            await userWizard.waitAndClickOnSave();
            // 2. Click on Delete button:
            await userWizard.clickOnDelete();
            // "Confirmation Dialog" should be loaded:
            await confirmationDialog.waitForDialogLoaded();
            await testUtils.saveScreenshot('user_wizard_confirm_delete1');
        });

    it("GIVEN new User is saved  WHEN the User has been deleted in Wizard panel THEN expected notification message should appear",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let userName = userItemsBuilder.generateRandomName('user');
            TEST_USER = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), null);
            // 1. Save the user:
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(TEST_USER);
            await userWizard.waitAndClickOnSave();
            await userWizard.waitForNotificationMessage();
            // 2. click on Delete and confirm:
            await userWizard.clickOnDelete();
            await testUtils.confirmDelete();
            await testUtils.saveScreenshot('user_deleted_confirmation_mess1');
            // 3. Verify the notification message:
            let expectedMessage = appConst.userDeletedMessage(TEST_USER.displayName);
            // `Principal "user:system:userName" is deleted - notification message should appear`
            await userBrowsePanel.waitForExpectedNotificationMessage(expectedMessage);
        });

    it("GIVEN existing user is selected WHEN Delete button in browse-toolbar has been pressed THEN Confirmation dialog should appear",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let userName = userItemsBuilder.generateRandomName('user');
            let confirmationDialog = new ConfirmationDialog();
            TEST_USER = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), null);
            // 1. Add and select new user:
            await testUtils.addSystemUser(TEST_USER);
            await testUtils.findAndSelectItem(TEST_USER.displayName);
            await userBrowsePanel.waitForDeleteButtonEnabled();
            // 2. Click on Delete button:
            await userBrowsePanel.clickOnDeleteButton();
            await testUtils.saveScreenshot('user_confirm_delete2');
            // 3. "Confirmation Dialog" should be loaded
            await confirmationDialog.waitForDialogLoaded();
        });

    it("GIVEN existing User WHEN the User has been deleted in the browse panel THEN expected notification should appear",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            // Select and Delete existing user in browse panel:
            await testUtils.selectAndDeleteItem(TEST_USER.displayName);
            let result = await userBrowsePanel.waitForNotificationMessage();
            await testUtils.saveScreenshot('user_deleted_notification_mes2');
            let expectedMsg = appConst.userDeletedMessage(TEST_USER.displayName);
            assert.strictEqual(result, expectedMsg, "'Principal 'user:system:userName' is deleted' the  message should appear");
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
