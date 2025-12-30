const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const BrowseFilterPanel = require('../page_objects/browsepanel/principal.filter.panel');
const appConst = require('../libs/app_const');

describe('User Browse Panel specification', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it("WHEN Browse panel is opened THEN 'roles' and '/system' folders should be present",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let result = await userBrowsePanel.isItemDisplayed('roles');
            assert.ok(result, 'roles folder should be present in the root directory');
            result = await userBrowsePanel.isItemDisplayed('/system');
            assert.ok(result, '`/system` folder should be present in the root directory');
            // 'Selection toggle' should not be displayed when no items are selected
            await userBrowsePanel.waitForSelectionToggleNotDisplayed();
        });

    it("GIVEN Browse panel is opened WHEN 'Roles' folder has been expanded THEN required system roles should be listed",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.clickOnExpanderIcon('roles');
            let isDisplayed = await userBrowsePanel.scrollListBoxPanelAndFindItem('system.user.admin', 300, 10);
            assert.ok(isDisplayed, "'User Administrator' role should be displayed");
            isDisplayed = await userBrowsePanel.scrollListBoxPanelAndFindItem('system.admin', 300, 10);
            assert.ok(isDisplayed, "'Administrator' role should be displayed");
            isDisplayed = await userBrowsePanel.scrollListBoxPanelAndFindItem('cms.admin', 300, 10);
            assert.ok(isDisplayed, "'Content Manager Administrator' role should be displayed");

            isDisplayed = await userBrowsePanel.scrollListBoxPanelAndFindItem('system.admin.login', 300, 10);
            assert.ok(isDisplayed, "'Administration Console Login' role should be displayed");

            isDisplayed = await userBrowsePanel.scrollListBoxPanelAndFindItem('system.everyone', 300, 10);
            assert.ok(isDisplayed, "'Everyone' role should be displayed");
            isDisplayed = await userBrowsePanel.scrollListBoxPanelAndFindItem('cms.expert', 300, 10);
            assert.ok(isDisplayed, "'Content Manager Expert' role should be displayed");
            isDisplayed = await userBrowsePanel.scrollListBoxPanelAndFindItem('system.authenticated', 300, 10);
            assert.ok(isDisplayed, "'Authenticated' role should be displayed");
        });

    it("GIVEN Browse panel is opened WHEN '/system' folder has been expanded THEN 'Groups' and 'Users' get visible",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.clickOnExpanderIcon('/system');
            let isDisplayed = await userBrowsePanel.isItemDisplayed('groups');
            assert.ok(isDisplayed, "'Groups' folder should be present beneath the 'system'");
            isDisplayed = await userBrowsePanel.isItemDisplayed('users');
            assert.ok(isDisplayed, "'Users' folder should be present beneath the 'system'");
        });

    it("WHEN checkbox 'System Id Provider' has been checked THEN SelectionPanelToggler gets visible",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Click on the checkbox:
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName('System Id Provider');
            await userBrowsePanel.waitForSelectionToggleDisplayed();
            let result = await userBrowsePanel.getNumberInSelectionToggler();
            await testUtils.saveScreenshot('number_in_selection');
            assert.equal(result, '1', '1 should be displayed in the selection-toggler button');
        });

    // Verifies - https://github.com/enonic/app-users/issues/340  Empty TreeGrid when toggling Selection
    it("GIVEN 'System Id Provider' checkbox is checked WHEN 'Show Selection' has been clicked THEN grid gets filtered - one item should be in the grid",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Click on the 'System Id Provider' checkbox:
            await userBrowsePanel.clickCheckboxAndSelectRowByDisplayName('System Id Provider');
            await userBrowsePanel.waitForSelectionToggleDisplayed();
            await userBrowsePanel.pause(500);
            // 2. Click on 'Show Selection' button:
            await userBrowsePanel.clickOnSelectionToggler();
            // 3. The grid should be filtered:
            let names = await userBrowsePanel.getGridItemDisplayNames();
            await testUtils.saveScreenshot('selection_toggler_clicked1');
            assert.equal(names.length, 1, 'only System Id Provider folder should be present in the grid');
            assert.equal(names[0], 'System Id Provider', 'The name of the folder should be System Id Provider');
        });

    // Verifies https://github.com/enonic/lib-admin-ui/issues/1790
    // Case 2: Grid gets empty after openein/closing Details Panel (or resizing the browser window)
    it("GIVEN 'Selection Controller' checkbox has been clicked WHEN 'Show selections' button has been clicked THEN only provider-folders should be present in grid",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let browseFilterPanel = new BrowseFilterPanel();
            // 1. Click on the Controller Checkbox(select all items):
            await userBrowsePanel.clickOnSelectionControllerCheckbox();
            await userBrowsePanel.waitForSelectionToggleDisplayed();
            // 2. Click on 'Show Selection':
            await userBrowsePanel.clickOnSelectionToggler();
            await testUtils.openFilterPanel();
            await testUtils.saveScreenshot('selection_toggler_clicked2');
            // 3. Verify that the only one checkbox should be displayed in  Filter Panel
            let aggregationItems = await browseFilterPanel.getAggregationItems();
            assert.equal(aggregationItems.length, 1, "one aggregation item should be present in Filter Panel - 'Id provider'");
            assert.ok(aggregationItems[0].includes('Id Provider'), "ID Provider checkbox should be displayed in the Filter Panel");
            // 4. The grid should be filtered: one item should remain in the grid
            let names = await userBrowsePanel.getGridItemDisplayNames();
            assert.ok(names.includes('System Id Provider'), "Row with 'System Id Provider' should be present in the grid");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        if (typeof browser !== 'undefined') {
            await testUtils.getBrowser().setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
        }
        return console.log('specification starting: ' + this.title);
    });
});
