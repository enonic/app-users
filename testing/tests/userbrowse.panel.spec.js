const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const BrowseFilterPanel = require('../page_objects/browsepanel/principal.filter.panel');
const appConst = require('../libs/app_const');

describe('User Browse Panel specification', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === "undefined") {
        webDriverHelper.setupBrowser();
    }

    it("WHEN Browse panel is opened THEN 'roles' and '/system' folders should be present",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let result = await userBrowsePanel.isItemDisplayed('roles');
            assert.isTrue(result, 'roles folder should be present in the root directory');
            result = await userBrowsePanel.isItemDisplayed('/system');
            assert.isTrue(result, '`/system` folder should be present in the root directory');
            result = await userBrowsePanel.isSelectionTogglerVisible();
            assert.isFalse(result, "'Selection toggler' should not be displayed");
        });

    it("GIVEN Browse panel is opened WHEN 'Roles' folder has been expanded THEN required system roles should be listed",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.clickOnExpanderIcon('roles');
            let isDisplayed = await userBrowsePanel.isItemDisplayed('system.user.admin');
            assert.isTrue(isDisplayed, "'User Administrator' role should be displayed");
            isDisplayed = await userBrowsePanel.isItemDisplayed('system.admin');
            assert.isTrue(isDisplayed, "'Administrator' role should be displayed");
            isDisplayed = await userBrowsePanel.isItemDisplayed('cms.admin');
            assert.isTrue(isDisplayed, "'Content Manager Administrator' role should be displayed");

            isDisplayed = await userBrowsePanel.isItemDisplayed('system.admin.login');
            assert.isTrue(isDisplayed, "'Administration Console Login' role should be displayed");
            isDisplayed = await userBrowsePanel.isItemDisplayed('system.everyone');
            assert.isTrue(isDisplayed, "'Everyone' role should be displayed");
            isDisplayed = await userBrowsePanel.isItemDisplayed('cms.expert');
            assert.isTrue(isDisplayed, "'Content Manager Expert' role should be displayed");
            isDisplayed = await userBrowsePanel.isItemDisplayed('system.authenticated');
            assert.isTrue(isDisplayed, "'Authenticated' role should be displayed");
        });

    it("GIVEN Browse panel is opened WHEN '/system' folder has been expanded THEN 'Groups' and 'Users' get visible",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.clickOnExpanderIcon('/system');
            let isDisplayed = await userBrowsePanel.isItemDisplayed('groups');
            assert.isTrue(isDisplayed, "'Groups' folder should be present beneath the 'system'");
            isDisplayed = await userBrowsePanel.isItemDisplayed('users');
            assert.isTrue(isDisplayed, "'Users' folder should be present beneath the 'system'");
        });

    it("WHEN checkbox 'System Id Provider' has been checked THEN SelectionPanelToggler gets visible",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            //1. Click on the checkbox:
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName('System Id Provider');
            await userBrowsePanel.waitForSelectionTogglerVisible();
            let result = await userBrowsePanel.getNumberInSelectionToggler();
            testUtils.saveScreenshot('number_in_selection');
            assert.equal(result, 1, '1 should be displayed in the selection-toggler button');
        });

    //Verifies - https://github.com/enonic/app-users/issues/340  Empty TreeGrid when toggling Selection
    it("GIVEN 'System Id Provider' checkbox is checked WHEN SelectionPanelToggler has been clicked THEN grid gets filtered - one item should be in the grid",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            //1. Click on the checkbox:
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName('System Id Provider');
            await userBrowsePanel.waitForSelectionTogglerVisible();
            //2. Click on Show Selection:
            await userBrowsePanel.clickOnSelectionToggler();
            //3. The grid should be filtered:
            let names = await userBrowsePanel.getGridItemDisplayNames();
            testUtils.saveScreenshot('selection_toggler_clicked1');
            assert.equal(names.length, 1, 'only System Id Provider folder should be present in the grid');
            assert.equal(names[0], 'System Id Provider', 'The name of the folder should be System Id Provider');
        });

    //Verifies https://github.com/enonic/lib-admin-ui/issues/1790
    //Case 2: Grid gets empty after openein/closing Details Panel (or resizing the browser window)
    it("GIVEN 'Selection Controller' checkbox has been clicked WHEN 'Selection Toggler' has been clicked THEN grid gets filtered - only provider-folders should be present in grid",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let browseFilterPanel = new BrowseFilterPanel();
            //1. Click on the Controller Checkbox(select all items):
            await userBrowsePanel.clickOnSelectionControllerCheckbox();
            await userBrowsePanel.waitForSelectionTogglerVisible();
            //2. Click on 'Show Selection':
            await userBrowsePanel.clickOnSelectionToggler();
            await testUtils.openFilterPanel();
            let aggregationItems = await browseFilterPanel.getAggregationItems();
            assert.equal(aggregationItems.length, 1, "one aggregation item should be present in Filter Panel - 'Id provider'");
            assert.isTrue(aggregationItems[0].includes('Id Provider'),
                "one aggregation item should be present in Filter Panel - 'Id provider'");
            //3. The grid should be filtered: one item remains in the grid
            let names = await userBrowsePanel.getGridItemDisplayNames();
            testUtils.saveScreenshot('selection_toggler_clicked2');
            assert.isTrue(names.includes('System Id Provider'), "Row with 'System Id Provider' should be present in the grid");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});
