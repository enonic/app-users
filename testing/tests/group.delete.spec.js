/**
 * Created on 17.11.2017.
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const groupWizard = require('../page_objects/wizardpanel/group.wizard');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const confirmationDialog = require("../page_objects/confirmation.dialog");

describe('`group.delete.spec`: confirm and delete it in the wizard and in the browse panel', function () {
    this.timeout(70000);
    webDriverHelper.setupBrowser();
    let testGroup;

    it('GIVEN `Group` is saved WHEN Delete button on toolbar has been pressed THEN Confirmation dialog should appear',
        () => {
            this.bail(1);
            testGroup =
                userItemsBuilder.buildGroup(userItemsBuilder.generateRandomName('group'), 'test group 2');
            return testUtils.clickOnSystemAndOpenGroupWizard().then(()=> {
                return groupWizard.typeData(testGroup)
            }).then(()=> {
                return groupWizard.waitAndClickOnSave();
            }).then(()=> {
                return groupWizard.clickOnDelete();
            }).then(result=> {
                testUtils.saveScreenshot("group_wizard_confirm_delete1");
                return assert.eventually.isTrue(confirmationDialog.waitForDialogVisible(appConst.TIMEOUT_3),
                    "`Confirmation Dialog` should be displayed");
            });
        });

    it('GIVEN saved group is opened in the wizard WHEN the group has been deleted THEN correct notification message should appear',
        () => {
            testGroup =
                userItemsBuilder.buildGroup(userItemsBuilder.generateRandomName('group'), 'test group 3');
            return testUtils.clickOnSystemAndOpenGroupWizard().then(()=> {
                return groupWizard.typeData(testGroup)
            }).then(()=> {
                return groupWizard.waitAndClickOnSave();
            }).then(()=> {
                return groupWizard.clickOnDelete();
            }).then(()=> {
                return testUtils.confirmDelete();
            }).then(result=> {
                testUtils.saveScreenshot("group_deleted_confirmation_mess1");
                var expectedMessage = appConst.groupDeletedMessage(testGroup.displayName);
                return assert.eventually.isTrue(userBrowsePanel.waitForExpectedNotificationMessage(expectedMessage),
                    "Correct notification message should appear");
            });
        });

    it('GIVEN `Group` is selected WHEN Delete button on toolbar has been pressed THEN Confirmation dialog should appear',
        () => {
            testGroup =
                userItemsBuilder.buildGroup(userItemsBuilder.generateRandomName('group'), 'test group 2');
            return testUtils.openWizardAndSaveGroup(testGroup).then(()=> {
                return testUtils.findAndSelectItem(testGroup.displayName);
            }).then(()=> {
                return userBrowsePanel.waitForDeleteButtonEnabled();
            }).then(()=> {
                return userBrowsePanel.clickOnDeleteButton();
            }).then(()=> {
                testUtils.saveScreenshot("group_confirm_delete2");
                return assert.eventually.isTrue(confirmationDialog.waitForDialogVisible(appConst.TIMEOUT_3),
                    "`Confirmation Dialog` should be displayed");
            });
        });

    it('GIVEN existing group WHEN the group has been deleted in browse panel THEN correct notification should appear',
        () => {
            return testUtils.selectAndDeleteItem(testGroup.displayName).then(()=> {
                return userBrowsePanel.waitForNotificationMessage();
            }).then(result=> {
                testUtils.saveScreenshot("group_deleted_notification_mes2");
                var msg = appConst.groupDeletedMessage(testGroup.displayName);
                assert.strictEqual(result, msg, 'expected notification message should be displayed');
            });
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});
