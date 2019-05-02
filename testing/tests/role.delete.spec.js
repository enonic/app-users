/**
 * Created on 21.11.2017.
 */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const RoleWizard = require('../page_objects/wizardpanel/role.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const ConfirmationDialog = require("../page_objects/confirmation.dialog");

describe('Deleting of a role - confirm and delete it in wizard and in browse panel', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testRole;

    it('GIVEN role has been saved WHEN `App home` button has been clicked and `Roles` folder expanded THEN new role should be present',
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleWizard = new RoleWizard();
            let roleName = userItemsBuilder.generateRandomName('role');
            return testUtils.clickOnRolesFolderAndOpenWizard().then(() => {
                return roleWizard.typeDisplayName(roleName);
            }).then(() => {
                return roleWizard.waitAndClickOnSave();
            }).then(() => {
                return userBrowsePanel.clickOnAppHomeButton();
            }).then(() => {
                return userBrowsePanel.clickOnExpanderIcon("roles");
            }).then(() => {
                return assert.eventually.isTrue(userBrowsePanel.isItemDisplayed(roleName), 'new role should be present in the grid');
            });
        });

    it('GIVEN `Role` is saved in wizard WHEN Delete button on wizard-toolbar has been pressed THEN Confirmation dialog should appear',
        () => {
            let name = userItemsBuilder.generateRandomName('role');
            testRole = userItemsBuilder.buildRole(name, 'test role 2');
            let confirmationDialog = new ConfirmationDialog();
            let roleWizard = new RoleWizard();
            return testUtils.clickOnRolesFolderAndOpenWizard().then(() => {
                return roleWizard.typeData(testRole)
            }).then(() => {
                return roleWizard.waitAndClickOnSave();
            }).then(() => {
                return roleWizard.clickOnDelete();
            }).then(() => {
                testUtils.saveScreenshot("role_wizard_confirm_delete1");

                return assert.eventually.isTrue(confirmationDialog.waitForDialogLoaded(), "`Confirmation Dialog` should be displayed");
            });
        });

    it('GIVEN existing role is opened WHEN `Ctrl+del`  has been pressed THEN Confirmation dialog should appear',
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleWizard = new RoleWizard();
            let confirmationDialog = new ConfirmationDialog();
            return testUtils.findAndSelectItem(testRole.displayName).then(() => {
                return userBrowsePanel.clickOnEditButton();
            }).then(() => {
                return roleWizard.waitForLoaded();
            }).then(() => {
                return roleWizard.hotKeyDelete();
            }).then(() => {
                testUtils.saveScreenshot("role_wizard_shortcut_delete");
                return assert.eventually.isTrue(confirmationDialog.waitForDialogLoaded(), "`Confirmation Dialog` should be displayed");
            });
        });

    it('GIVEN saved role is opened in the wizard WHEN the role has been deleted THEN correct notification message should appear',
        () => {
            let roleWizard = new RoleWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let name = userItemsBuilder.generateRandomName('role');
            testRole = userItemsBuilder.buildRole(name, 'test role 3');
            return testUtils.clickOnRolesFolderAndOpenWizard().then(() => {
                return roleWizard.typeData(testRole)
            }).then(() => {
                return roleWizard.waitAndClickOnSave();
            }).then(() => {
                return roleWizard.clickOnDelete();
            }).then(() => {
                return testUtils.confirmDelete();
            }).then(result => {
                testUtils.saveScreenshot("role_deleted_confirmation_mess1");
                let expectedMessage = appConst.roleDeletedMessage(testRole.displayName);
                return assert.eventually.isTrue(userBrowsePanel.waitForExpectedNotificationMessage(expectedMessage),
                    "Correct notification message should appear");
            });
        });

    it('GIVEN `Role` is selected WHEN `Delete` button on browse-toolbar has been pressed THEN Confirmation dialog should appear',
        () => {
            let confirmationDialog = new ConfirmationDialog();
            let userBrowsePanel = new UserBrowsePanel();
            let name = userItemsBuilder.generateRandomName('role');
            testRole = userItemsBuilder.buildRole(name, 'test role 2');
            return testUtils.openWizardAndSaveRole(testRole).then(() => {
                return testUtils.findAndSelectItem(testRole.displayName);
            }).then(() => {
                return userBrowsePanel.waitForDeleteButtonEnabled();
            }).then(() => {
                return userBrowsePanel.clickOnDeleteButton();
            }).then(() => {
                testUtils.saveScreenshot("role_confirm_delete2");
                return assert.eventually.isTrue(confirmationDialog.waitForDialogLoaded(), "`Confirmation Dialog` should be displayed");
            });
        });

    it('GIVEN existing role WHEN the role has been deleted in browse panel THEN correct notification should appear',
        () => {
            let userBrowsePanel = new UserBrowsePanel();
            return testUtils.selectAndDeleteItem(testRole.displayName).then(() => {
                return userBrowsePanel.waitForNotificationMessage();
            }).then(result => {
                testUtils.saveScreenshot("role_deleted_notification_mes2");
                let msg = appConst.roleDeletedMessage(testRole.displayName);
                assert.strictEqual(result, msg, `'Principal "role:roleName" is deleted' the  message should be displayed`);
            });
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
