/**
 * Created on 21.11.2017.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const ConfirmationDialog = require("../page_objects/confirmation.dialog");

describe('`user.delete.spec`:User - confirm and delete it in the wizard and in the browse panel', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testUser;

    it('GIVEN `User` is saved WHEN Delete button on toolbar has been pressed THEN Confirmation dialog should appear',
        () => {
            let userWizard = new UserWizard();
            let userName = userItemsBuilder.generateRandomName('user');
            let confirmationDialog = new ConfirmationDialog();
            testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName), null);
            return testUtils.clickOnSystemOpenUserWizard().then(() => {
                return userWizard.typeData(testUser);
            }).then(() => {
                return userWizard.waitAndClickOnSave();
            }).then(() => {
                return userWizard.clickOnDelete();
            }).then(() => {
                testUtils.saveScreenshot("user_wizard_confirm_delete1");
                return assert.eventually.isTrue(confirmationDialog.waitForDialogLoaded(), "`Confirmation Dialog` should be displayed");
            });
        });

    it('GIVEN saved User is opened in the wizard WHEN the User has been deleted THEN correct notification message should appear',
        () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName), null);
            return testUtils.clickOnSystemOpenUserWizard().then(() => {
                return userWizard.typeData(testUser)
            }).then(() => {
                return userWizard.waitAndClickOnSave();
            }).then(() => {
                return userWizard.clickOnDelete();
            }).then(() => {
                return testUtils.confirmDelete();
            }).then(result => {
                testUtils.saveScreenshot("user_deleted_confirmation_mess1");
                let expectedMessage = appConst.userDeletedMessage(testUser.displayName);
                return assert.eventually.isTrue(userBrowsePanel.waitForExpectedNotificationMessage(expectedMessage),
                    `Principal "user:system:userName" is deleted - notification message should appear`);
            });
        });

    it('GIVEN `User` is selected WHEN Delete button on toolbar has been pressed THEN Confirmation dialog should appear',
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            let userName = userItemsBuilder.generateRandomName('user');
            let confirmationDialog = new ConfirmationDialog();
            testUser = userItemsBuilder.buildUser(userName, '1q2w3e', userItemsBuilder.generateEmail(userName), null);
            return testUtils.addSystemUser(testUser).then(() => {
                return testUtils.findAndSelectItem(testUser.displayName);
            }).then(() => {
                return userBrowsePanel.waitForDeleteButtonEnabled();
            }).then(() => {
                return userBrowsePanel.clickOnDeleteButton();
            }).then(() => {
                testUtils.saveScreenshot("user_confirm_delete2");
                return assert.eventually.isTrue(confirmationDialog.waitForDialogLoaded(), "`Confirmation Dialog` should be displayed");
            });
        });

    it('GIVEN existing User WHEN the User has been deleted in the browse panel THEN correct notification should appear',
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            return testUtils.selectAndDeleteItem(testUser.displayName).then(() => {
                return userBrowsePanel.waitForNotificationMessage();
            }).then(result => {
                testUtils.saveScreenshot("user_deleted_notification_mes2");
                let msg = appConst.userDeletedMessage(testUser.displayName);
                assert.strictEqual(result, msg, `'Principal "user:system:userName" is deleted' the  message should be displayed`);
            });
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
