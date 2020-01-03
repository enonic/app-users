/**
 * Created on 21.11.2017.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const ConfirmationDialog = require("../page_objects/confirmation.dialog");

describe("user.delete.spec:User - confirm and delete it in the wizard and in the browse panel", function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testUser;

    it("GIVEN new user is saved WHEN Delete button in toolbar has been pressed THEN Confirmation dialog should appear",
        async () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName("user");
            let confirmationDialog = new ConfirmationDialog();
            testUser = userItemsBuilder.buildUser(userName, "1q2w3e", userItemsBuilder.generateEmail(userName), null);
            //1. Open new user-wizard, save the data:
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(testUser);
            await userWizard.waitAndClickOnSave();
            //2. Click on Delete button:
            await userWizard.clickOnDelete();
            //"Confirmation Dialog" should be loaded:
            await confirmationDialog.waitForDialogLoaded();
            testUtils.saveScreenshot("user_wizard_confirm_delete1");
        });

    it("GIVEN new User is saved  WHEN the User has been deleted THEN expected notification message should appear",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let userName = userItemsBuilder.generateRandomName("user");
            testUser = userItemsBuilder.buildUser(userName, "1q2w3e", userItemsBuilder.generateEmail(userName), null);
            //1. Save the user:
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(testUser);
            await userWizard.waitAndClickOnSave();
            //2. click on Delete and confirm:
            await userWizard.clickOnDelete();
            await testUtils.confirmDelete();
            testUtils.saveScreenshot("user_deleted_confirmation_mess1");
            let expectedMessage = appConst.userDeletedMessage(testUser.displayName);
            //`Principal "user:system:userName" is deleted - notification message should appear`
            await userBrowsePanel.waitForExpectedNotificationMessage(expectedMessage);
        });

    it("GIVEN existing user is selected WHEN Delete button in browse-toolbar has been pressed THEN Confirmation dialog should appear",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let userName = userItemsBuilder.generateRandomName("user");
            let confirmationDialog = new ConfirmationDialog();
            testUser = userItemsBuilder.buildUser(userName, "1q2w3e", userItemsBuilder.generateEmail(userName), null);
            //1. Add and select new user:
            await testUtils.addSystemUser(testUser);
            await testUtils.findAndSelectItem(testUser.displayName);
            await userBrowsePanel.waitForDeleteButtonEnabled();
            //2. Click on Delete button:
            await userBrowsePanel.clickOnDeleteButton();
            testUtils.saveScreenshot("user_confirm_delete2");
            //3. "Confirmation Dialog" should be loaded
            await confirmationDialog.waitForDialogLoaded();
        });

    it("GIVEN existing User WHEN the User has been deleted in the browse panel THEN correct notification should appear",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            //Delete existing user:
            await testUtils.selectAndDeleteItem(testUser.displayName);
            let result = await userBrowsePanel.waitForNotificationMessage();
            testUtils.saveScreenshot("user_deleted_notification_mes2");
            let expectedMsg = appConst.userDeletedMessage(testUser.displayName);
            assert.strictEqual(result, expectedMsg, "'Principal 'user:system:userName' is deleted' the  message should appear");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log("specification starting: " + this.title);
    });
});
