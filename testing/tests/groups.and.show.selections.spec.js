/**
 * Created on 28.05.2020.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const BrowseFilterPanel = require('../page_objects/browsepanel/principal.filter.panel');

describe("Check 'Selection Controller' and 'Show Selection' elements in filtered grid", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === "undefined") {
        webDriverHelper.setupBrowser();
    }
    let GROUP_1;
    let GROUP_2;

    it('Preconditions - two groups should be saved',
        async () => {
            let groupName1 = userItemsBuilder.generateRandomName('group');
            let groupName2 = userItemsBuilder.generateRandomName('group');
            GROUP_1 = userItemsBuilder.buildGroup(groupName1, 'description', null);
            GROUP_2 = userItemsBuilder.buildGroup(groupName2, 'description', null);
            await testUtils.openWizardAndSaveGroup(GROUP_1);
            await testUtils.openWizardAndSaveGroup(GROUP_2);
        });

    it("WHEN 'Show Selection' and 'Hide Selection' sequentially clicked in filtered grid THEN 'Selection Controller' checkbox gets partial AND initial state of the grid is restored",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let browseFilterPanel = new BrowseFilterPanel();
            await testUtils.openFilterPanel();
            await browseFilterPanel.clickOnGroupAggregation();
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName(GROUP_1.displayName);
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName(GROUP_2.displayName);
            // Click on Show Selection
            await userBrowsePanel.clickOnSelectionToggler();
            await userBrowsePanel.pause(1000);
            //4. Click on Selection Toggle (circle, Hide Selection), initial state of thr grid is restored:
            await userBrowsePanel.clickOnSelectionToggler();
            await userBrowsePanel.pause(500);
            testUtils.saveScreenshot("selection_toggle_checkbox_partial");
            //5. Verify that 'Selection Controller' checkBox shows that the selection is partial:
            let result = await userBrowsePanel.waitForSelectionControllerPartial();
            assert.isTrue(result, "'Selection Controller' shows that selection is partial");
        });

    //Verifies  issue#334 Incorrect behaviour of Show Selection button and Selection Controller gets irresponsive
    it("WHEN 'Show Selection', 'Hide Selection',Show Selection sequentially clicked in filtered grid THEN expected group should be present and Selection Controller should be selected",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let browseFilterPanel = new BrowseFilterPanel();
            await testUtils.openFilterPanel();
            //1. Click ib Group aggregation checkbox:
            await browseFilterPanel.clickOnGroupAggregation();
            //2. Select 2 groups:
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName(GROUP_1.displayName);
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName(GROUP_2.displayName);
            //3. Click on 'Show Selection'
            await userBrowsePanel.clickOnSelectionToggler();
            await userBrowsePanel.pause(1000);
            //4. Click on 'Hide Selection', initial state of thr grid is restored:
            await userBrowsePanel.clickOnSelectionToggler();
            await userBrowsePanel.pause(500);
            //5. Click on 'Show Selection'
            await userBrowsePanel.clickOnSelectionToggler();
            testUtils.saveScreenshot("selection_toggle_checkbox_selected");
            //6. Verify that 'Selection Controller' checkBox should be selected:
            let isSelected = await userBrowsePanel.isSelectionControllerSelected();
            assert.isTrue(isSelected, "'Selection Controller' shows that selection is partial");
            //7. Verify that only 2 items(groups) are displayed:
            let gridItems = await userBrowsePanel.getGridItemDisplayNames();
            assert.equal(gridItems.length, 2, "Two groups should be present in User Browse Panel");
            assert.isTrue(gridItems.includes(GROUP_1.displayName), "The first group should be present in User Browse Panel");
            assert.isTrue(gridItems.includes(GROUP_1.displayName), "The second group should be present in User Browse Panel");
        });

    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
});
