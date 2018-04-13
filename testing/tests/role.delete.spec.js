/**
 * Created on 21.11.2017.
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const roleWizard = require('../page_objects/wizardpanel/role.wizard');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const confirmationDialog = require("../page_objects/confirmation.dialog");

describe('Role - confirm and delete in wizard and in browse panel', function () {
    this.timeout(70000);
    webDriverHelper.setupBrowser();
    let testRole;

    it('GIVEN `Role` is saved in wizard WHEN Delete button on wizard-toolbar has been pressed THEN Confirmation dialog should appear',
        () => {
            testRole =
                userItemsBuilder.buildRole(userItemsBuilder.generateRandomName('role'), 'test role 2');
            return testUtils.clickOnRolesFolderAndOpenWizard().then(()=> {
                return roleWizard.typeData(testRole)
            }).then(()=> {
                return roleWizard.waitAndClickOnSave();
            }).then(()=> {
                return roleWizard.clickOnDelete();
            }).then(()=> {
                testUtils.saveScreenshot("role_wizard_confirm_delete1");
                return assert.eventually.isTrue(confirmationDialog.waitForDialogVisible(appConst.TIMEOUT_3),
                    "`Confirmation Dialog` should be displayed");
            });
        });

    it('GIVEN saved role is opened in the wizard WHEN the role has been deleted THEN correct notification message should appear',
        () => {
            testRole =
                userItemsBuilder.buildRole(userItemsBuilder.generateRandomName('role'), 'test role 3');
            return testUtils.clickOnRolesFolderAndOpenWizard().then(()=> {
                return roleWizard.typeData(testRole)
            }).then(()=> {
                return roleWizard.waitAndClickOnSave();
            }).then(()=> {
                return roleWizard.clickOnDelete();
            }).then(()=> {
                return testUtils.confirmDelete();
            }).then(result=> {
                testUtils.saveScreenshot("role_deleted_confirmation_mess1");
                var expectedMessage = appConst.roleDeletedMessage(testRole.displayName);
                return assert.eventually.isTrue(userBrowsePanel.waitForExpectedNotificationMessage(expectedMessage),
                    "Correct notification message should appear");
            });
        });

    it('GIVEN `Role` is selected WHEN Delete button on browse-toolbar has been pressed THEN Confirmation dialog should appear',
        () => {
            testRole =
                userItemsBuilder.buildRole(userItemsBuilder.generateRandomName('role'), 'test role 2');
            return testUtils.openWizardAndSaveRole(testRole).then(()=> {
                return testUtils.findAndSelectItem(testRole.displayName);
            }).then(()=> {
                return userBrowsePanel.waitForDeleteButtonEnabled();
            }).then(()=> {
                return userBrowsePanel.clickOnDeleteButton();
            }).then(()=> {
                testUtils.saveScreenshot("role_confirm_delete2");
                return assert.eventually.isTrue(confirmationDialog.waitForDialogVisible(appConst.TIMEOUT_3),
                    "`Confirmation Dialog` should be displayed");
            });
        });

    it('GIVEN existing role WHEN the role has been deleted in browse panel THEN correct notification should appear',
        () => {
            return testUtils.selectAndDeleteItem(testRole.displayName).then(()=> {
                return userBrowsePanel.waitForNotificationMessage();
            }).then(result=> {
                testUtils.saveScreenshot("role_deleted_notification_mes2");
                var msg = appConst.roleDeletedMessage(testRole.displayName);
                assert.strictEqual(result, msg, `'Principal "role:roleName" is deleted' the  message should be displayed`);
            });
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});
