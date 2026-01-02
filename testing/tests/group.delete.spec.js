/**
 * Created on 17.11.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const ConfirmationDialog = require("../page_objects/confirmation.dialog");
const FilterPanel = require('../page_objects/browsepanel/principal.filter.panel');

describe('group.delete.spec: confirm and delete a group in wizard and in Browse Panel', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let TEST_GROUP;

    it("GIVEN new group is saved WHEN 'Delete' button in toolbar(wizard) has been pressed THEN Confirmation dialog should appear",
        async () => {
            let groupWizard = new GroupWizard();
            let confirmationDialog = new ConfirmationDialog();
            let testGroup = userItemsBuilder.buildGroup(userItemsBuilder.generateRandomName('group'), 'test group 0');
            // 1. Group wizard has been opened:
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeData(testGroup);
            // 2. The Group has been saved:
            await groupWizard.waitAndClickOnSave();
            await groupWizard.waitForNotificationMessage();
            // 3. Delete button in toolbar has been clicked:
            await groupWizard.clickOnDelete();
            await testUtils.saveScreenshot('group_wizard_confirm_delete1');
            // 4.`Verify that Confirmation Dialog` is loaded
            await confirmationDialog.waitForDialogLoaded();
            await confirmationDialog.pause(200);
            // 5. Press 'Esc' key
            await groupWizard.pressEscKey();
            await testUtils.saveScreenshot('group_wizard_confirm_dialog_closed');
            // 6. Verify that confirmation dialog is closed:
            await confirmationDialog.waitForDialogClosed();
            // 7. Verify that Group wizard remains opened after canceling the deleting
            await groupWizard.waitForOpened();
        });

    it("GIVEN new group is saved WHEN 'Delete' button in wizard has been clicked and the deleting confirmed THEN the group should be deleted",
        async () => {
            let groupWizard = new GroupWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let groupToDelete = userItemsBuilder.buildGroup(userItemsBuilder.generateRandomName('group'), 'test group 1');
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeData(groupToDelete);
            // 1. Save new group:
            await groupWizard.waitAndClickOnSave();
            await groupWizard.waitForNotificationMessage();
            // 2. Click on delete:
            await groupWizard.clickOnDelete();
            // 3. Confirm:
            await testUtils.confirmDelete();
            await testUtils.saveScreenshot('group_deleted_confirmation_mess1');
            let expectedMessage = appConst.groupDeletedMessage(groupToDelete.displayName);
            // Message : Principal "group:system:${displayName}" is deleted - should appear
            await userBrowsePanel.waitForExpectedNotificationMessage(expectedMessage);
        });

    it("GIVEN new group is saved AND selected WHEN 'Delete' button in toolbar(browse panel) has been pressed THEN 'Confirmation dialog' should appear",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            TEST_GROUP = userItemsBuilder.buildGroup(userItemsBuilder.generateRandomName('group'), 'test group 2');
            await testUtils.openWizardAndSaveGroup(TEST_GROUP);
            // 1. Select existing group in the grid:
            await testUtils.findAndSelectItem(TEST_GROUP.displayName);
            // 2. Click on Delete button:
            await userBrowsePanel.waitForDeleteButtonEnabled();
            await userBrowsePanel.clickOnDeleteButton();
            await testUtils.saveScreenshot('group_confirm_dialog_appears');
            // Verify that Confirmation Dialog appears:
            await confirmationDialog.waitForDialogLoaded();
        });

    it("WHEN existing group has been deleted in browse panel THEN expected notification should appear",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            // Select and delete the existing group:
            await testUtils.selectAndDeleteItem(TEST_GROUP.displayName);
            let message = await userBrowsePanel.waitForNotificationMessage();
            await testUtils.saveScreenshot('group_deleted_notification_mes2');
            let expected = appConst.groupDeletedMessage(TEST_GROUP.displayName);
            assert.strictEqual(message, expected, 'Expected message should appear: Principal "group:system:${displayName}" is deleted');
        });

    // Verifies https://github.com/enonic/app-users/issues/656
    // Grid is not refreshed after recreating group, role or user
    it("WHEN deleted group has been recreated THEN this group should be present in Groups folder",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let groupWizard = new GroupWizard();
            let filterPanel = new FilterPanel();
            // 1. Open Filter Panel:
            await testUtils.openFilterPanel();
            await testUtils.saveScreenshot('group_number_before_recreating');
            // 2. Get the initial number of roles:
            let initialNumber = await filterPanel.getNumberInGroupAggregationCheckbox();
            // 3. Open Group Wizard and recreate the group
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeData(TEST_GROUP);
            await groupWizard.waitAndClickOnSave();
            await groupWizard.waitForNotificationMessage();
            await groupWizard.pause(1000);
            // 4. Go to browse panel:
            await userBrowsePanel.clickOnAppHomeButton();
            await testUtils.saveScreenshot('group_number_after_recreating');
            // 5. Verify that the number of groups is increased
            let newNumberOfGroup = await filterPanel.getNumberInGroupAggregationCheckbox();
            assert.ok(newNumberOfGroup - initialNumber === 1,
                "Number of group in Filter panel should be increased after recreating the group");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});
