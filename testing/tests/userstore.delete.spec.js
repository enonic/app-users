/**
 * Created on 21.11.2017.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userStoreWizard = require('../page_objects/wizardpanel/userstore.wizard');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const confirmationDialog = require("../page_objects/confirmation.dialog");

describe('User Store confirm and delete in wizard and in browse panel', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let userStore;

    it('GIVEN `UserStore` is saved WHEN Delete button on toolbar has been pressed THEN Confirmation dialog should appear',
        () => {
            userStore = userItemsBuilder.buildUserStore(userItemsBuilder.generateRandomName('store'), 'test user store1');
            return testUtils.clickOnNewOpenUserStoreWizard().then(()=> {
                return userStoreWizard.typeData(userStore)
            }).then(()=> {
                return userStoreWizard.waitAndClickOnSave();
            }).then(()=> {
                return userStoreWizard.clickOnDelete();
            }).then(()=> {
                testUtils.saveScreenshot("userstore_wizard_confirm_delete1");
                return assert.eventually.isTrue(confirmationDialog.waitForDialogVisible(2000), "`Confirmation Dialog` should be displayed");
            });
        });

    it('GIVEN UserStore is opened WHEN the UserStore has been deleted THEN correct notification message should appear',
        () => {
            userStore = userItemsBuilder.buildUserStore(userItemsBuilder.generateRandomName('store'), 'test user store2');
            return testUtils.clickOnNewOpenUserStoreWizard().then(()=> {
                return userStoreWizard.typeData(userStore)
            }).then(()=> {
                return userStoreWizard.waitAndClickOnSave();
            }).then(()=> {
                return userStoreWizard.clickOnDelete();
            }).then(()=> {
                return testUtils.confirmDelete();
            }).then(result=> {
                testUtils.saveScreenshot("userstore_deleted_confirmation_mess1");
                var expectedMessage = appConst.storeDeletedMessage(userStore.displayName);
                return assert.eventually.isTrue(userBrowsePanel.waitForExpectedNotificationMessage(expectedMessage),
                    "Correct notification message should appear");
            });
        });

    it('GIVEN `UserStore` is selected WHEN Delete button on the browse-toolbar has been pressed THEN Confirmation dialog should appear',
        () => {
            userStore = userItemsBuilder.buildUserStore(userItemsBuilder.generateRandomName('store'), 'test user store3');
            return testUtils.openWizardAndSaveUserStore(userStore).then(()=> {
                return userBrowsePanel.doClickOnCloseTabAndWaitGrid(userStore.displayName);
            }).pause(1000).then(()=> {
                return testUtils.findAndSelectItem(userStore.displayName);
            }).then(()=> {
                return userBrowsePanel.waitForDeleteButtonEnabled();
            }).then(()=> {
                return userBrowsePanel.clickOnDeleteButton();
            }).then(()=> {
                testUtils.saveScreenshot("store_confirm_delete2");
                return assert.eventually.isTrue(confirmationDialog.waitForDialogVisible(2000), "`Confirmation Dialog` should be displayed");
            });
        });

    it('GIVEN existing UserStore WHEN the store has been deleted in the browse panel THEN correct notification should appear',
        () => {
            return testUtils.selectAndDeleteItem(userStore.displayName).then(()=> {
                return userBrowsePanel.waitForNotificationMessage();
            }).then(result=> {
                testUtils.saveScreenshot("store_deleted_notification_mes2");
                var msg = appConst.storeDeletedMessage(userStore.displayName);
                assert.strictEqual(result, msg, 'expected notification message should be displayed');
            });
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});

