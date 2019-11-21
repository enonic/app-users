/**
 * Created on 17.11.2017.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const ConfirmationDialog = require("../page_objects/confirmation.dialog");

describe('`group.delete.spec`: confirm and delete a group in the wizard and in the browse panel', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testGroup;

    it('GIVEN new group is saved WHEN Delete button in toolbar(wizard) has been pressed THEN Confirmation dialog should appear',
        async () => {
            let groupWizard = new GroupWizard();
            let confirmationDialog = new ConfirmationDialog();
            testGroup = userItemsBuilder.buildGroup(userItemsBuilder.generateRandomName('group'), 'test group 2');
            //1. Group wizard has been opened:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeData(testGroup)
            //2. The Group has been saved:
            await groupWizard.waitAndClickOnSave();
            //3. Delete button in toolbar has been clicked:
            await groupWizard.clickOnDelete();
            testUtils.saveScreenshot("group_wizard_confirm_delete1");
            //`Confirmation Dialog` should be displayed
            await confirmationDialog.waitForDialogLoaded();
        });

    it('GIVEN new group is saved WHEN Delete button in wizard has been clicked and the deleting confirmed THEN expected notification message should appear',
        async () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            testGroup = userItemsBuilder.buildGroup(userItemsBuilder.generateRandomName('group'), 'test group 3');
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeData(testGroup)
            //1. Save new group:
            await groupWizard.waitAndClickOnSave();
            //2. Click on delete:
            await groupWizard.clickOnDelete();
            //3. Confirm:
            await testUtils.confirmDelete();
            testUtils.saveScreenshot("group_deleted_confirmation_mess1");
            let expectedMessage = appConst.groupDeletedMessage(testGroup.displayName);
            //Message : Principal "group:system:${displayName}" is deleted - should appear
            await userBrowsePanel.waitForExpectedNotificationMessage(expectedMessage);
        });

    it('GIVEN existing group is selected WHEN Delete button in toolbar(browse panel) has been pressed THEN Confirmation dialog should appear',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            testGroup = userItemsBuilder.buildGroup(userItemsBuilder.generateRandomName('group'), 'test group 2');
            await testUtils.openWizardAndSaveGroup(testGroup);
            //1. Select existing group in the grid:
            await testUtils.findAndSelectItem(testGroup.displayName);
            //2. Click on Delete button:
            await userBrowsePanel.waitForDeleteButtonEnabled();
            return userBrowsePanel.clickOnDeleteButton();
            testUtils.saveScreenshot("group_confirm_delete2");
            //`Confirmation Dialog` should be displayed
            await confirmationDialog.waitForDialogLoaded();
        });

    it('WHEN existing group has been deleted in browse panel THEN expected notification should appear',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            //Select and delete existing group:
            await testUtils.selectAndDeleteItem(testGroup.displayName);
            let message = await userBrowsePanel.waitForNotificationMessage();
            testUtils.saveScreenshot("group_deleted_notification_mes2");
            let expected = appConst.groupDeletedMessage(testGroup.displayName);
            assert.strictEqual(message, expected, 'Expected message should appear: Principal "group:system:${displayName}" is deleted');
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
