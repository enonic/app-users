/**
 * Created on 28.05.2020.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const BrowseFilterPanel = require('../page_objects/browsepanel/principal.filter.panel');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');

describe("Check 'Selection Controller' and 'Show Selection' elements in filtered grid", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let GROUP_1;
    let GROUP_2;

    it('Preconditions - two groups should be saved',
        async () => {
            const groupName1 = userItemsBuilder.generateRandomName('group');
            const groupName2 = userItemsBuilder.generateRandomName('group');
            GROUP_1 = userItemsBuilder.buildGroup(groupName1, 'description', null);
            GROUP_2 = userItemsBuilder.buildGroup(groupName2, 'description', null);
            await testUtils.openWizardAndSaveGroup(GROUP_1);
            await testUtils.openWizardAndSaveGroup(GROUP_2);
        });

    // Verifies  https://github.com/enonic/app-users/issues/2247
    // Incorrect behaviour of ListSelectionController checkbox #2247
    it("WHEN 'Show Selection' and 'Hide Selection' sequentially clicked in filtered grid THEN 'Selection Controller' checkbox gets partial AND initial state of the grid is restored",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let browseFilterPanel = new BrowseFilterPanel();
            await testUtils.openFilterPanel();
            // 1. Click on Group aggregation checkbox:
            await browseFilterPanel.clickOnGroupAggregation();
            // 2. Scroll the panel and check 2 groups:
            await userBrowsePanel.scrollListBoxPanelAndFindItem(GROUP_1.displayName, 300, 10);
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName(GROUP_1.displayName);
            await userBrowsePanel.scrollListBoxPanelAndFindItem(GROUP_2.displayName, 300, 10);
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName(GROUP_2.displayName);
            // 3. Click on 'Show Selection' button:
            await userBrowsePanel.clickOnSelectionToggler();
            await testUtils.saveScreenshot('groups_selection_toggle_checkbox_partial_issue_1');
            await userBrowsePanel.pause(1000);
            // 4. Click on Selection Toggle (circle, Hide Selection), initial state of the grid should be restored:
            await userBrowsePanel.clickOnSelectionToggler();
            await userBrowsePanel.pause(1000);
            await testUtils.saveScreenshot('groups_selection_toggle_checkbox_partial_issue_2');
            // 5. Verify that 'Selection Controller' checkBox shows that the selection is partial:
            //let result = await userBrowsePanel.waitForSelectionControllerPartial();
            // TODO uncomment the line below when the issue(#2247) is fixed
            //assert.ok(result, "'Selection Controller' shows that selection is partial");
        });

    // Verifies  issue#334 Incorrect behaviour of Show Selection button and Selection Controller gets irresponsive
    it("WHEN 'Show Selection', 'Hide Selection', Show Selection sequentially clicked in filtered grid THEN expected group should be present and Selection Controller should be selected",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let browseFilterPanel = new BrowseFilterPanel();
            await testUtils.openFilterPanel();
            // 1. Click ib Group aggregation checkbox:
            await browseFilterPanel.clickOnGroupAggregation();
            // 2. Select 2 groups:
            await userBrowsePanel.scrollListBoxPanelAndFindItem(GROUP_1.displayName, 300, 10);
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName(GROUP_1.displayName);
            await userBrowsePanel.scrollListBoxPanelAndFindItem(GROUP_2.displayName, 300, 10);
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName(GROUP_2.displayName);
            await testUtils.saveScreenshot('issue_show_selection');
            // 3. Click on 'Show Selection'
            await userBrowsePanel.clickOnSelectionToggler();
            await userBrowsePanel.pause(1000);
            // 4. Click on 'Hide Selection', initial state of thr grid is restored:
            await userBrowsePanel.clickOnSelectionToggler();
            await userBrowsePanel.pause(1000);
            // 5. Click on 'Show Selection'
            await userBrowsePanel.clickOnSelectionToggler();
            await testUtils.saveScreenshot('issue_selection_toggle_checkbox_selected');
            // 6. Verify - 'Selection Controller' checkBox should be selected:
            let isSelected = await userBrowsePanel.isSelectionControllerSelected();
            assert.ok(isSelected, "'Selection Controller' shows that selection is partial");
            // 7. Verify that only 2 items(groups) are displayed:
            let gridItems = await userBrowsePanel.getGridItemDisplayNames();
            assert.equal(gridItems.length, 2, "Two groups should be present in User Browse Panel");
            assert.ok(gridItems.includes(GROUP_1.displayName), "The first group should be present in User Browse Panel");
            assert.ok(gridItems.includes(GROUP_2.displayName), "The second group should be present in User Browse Panel");
        });


    // Verify the bug: Error notification message appears after deleting selection items #2228
    // https://github.com/enonic/app-users/issues/2228
    it("GIVEN existing group has been filtered then checked WHEN 'clear filter' button has been pressed and the group has been deleted THEN 'Show Selection' button should be hidden",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let browseFilterPanel = new BrowseFilterPanel();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Open Filter Panel and type the group's name:
            await testUtils.openFilterPanel();
            await browseFilterPanel.typeSearchText(GROUP_1.displayName);
            // 2. Check the group:
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName(GROUP_1.displayName);
            // 3. Click on 'Clear Filter' button(link):
            await browseFilterPanel.clickOnClearFilterLink();
            // 4. Verify that 'Show Selection' button(link) remains visible yet:
            await userBrowsePanel.waitForSelectionToggleDisplayed();
            // 5. Delete the checked group
            await userBrowsePanel.waitForDeleteButtonEnabled();
            await userBrowsePanel.clickOnDeleteButton();
            await confirmationDialog.waitForDialogLoaded();
            await confirmationDialog.clickOnYesButton();
            await confirmationDialog.waitForDialogClosed();
            await testUtils.saveScreenshot('groups_deleted_show_selection');
            // 5. Verify that only one expected notification message appears:
            let messages = await userBrowsePanel.waitForNotificationMessages();
            assert.equal(messages.length, 1, 'The only one notification message should appear');
            assert.equal(messages[0], appConst.groupDeletedMessage(GROUP_1.displayName), 'Expected notification message should appear');

            await userBrowsePanel.waitForSelectionToggleNotDisplayed();
        });

    before(async () => {
        if (typeof browser !== 'undefined') {
            await testUtils.getBrowser().setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
        }
        return console.log('specification starting: ' + this.title);
    });
    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
});
