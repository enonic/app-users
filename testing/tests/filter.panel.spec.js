const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const itemBuilder = require('../libs/userItems.builder');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const BrowseFilterPanel = require('../page_objects/browsepanel/principal.filter.panel');

describe('filter.panel.spec Principal Filter Panel specification', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    const NON_EXISTENT_ITEM = appConst.generateRandomName('test');
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it('GIVEN `Principal Filter Panel` is opened WHEN `hide filter panel` has been clicked THEN the panel should be closed',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let filterPanel = new BrowseFilterPanel();
            // 1. Open Filter Panel:
            await userBrowsePanel.clickOnSearchButton();
            await filterPanel.waitForOpened();
            // 2. Click on Hide-icon:
            await userBrowsePanel.clickOnHideFilterButton();
            await filterPanel.waitForClosed();
        });

    // Verify issue https://github.com/enonic/app-users/issues/1075
    // Incorrect behavior of filtering #1075
    it("GIVEN 'Filter Panel' is opened WHEN non existent name has been typed THEN grid should be empty",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let filterPanel = new BrowseFilterPanel();
            // 1. Open Filter Panel:
            await userBrowsePanel.clickOnSearchButton();
            await filterPanel.waitForOpened();
            // 2. Type a non-existent name:
            await filterPanel.typeSearchText(NON_EXISTENT_ITEM);
            // 3. Verify that 'Clear' button should appear:
            await filterPanel.waitForClearLinkVisible();
            // 4. Verify that grid in  Browse panel is empty:
            let result = await userBrowsePanel.getGridItemDisplayNames();
            assert.equal(result.length, 0, 'Grid should be empty')
        });

    it('GIVEN `Principal Filter Panel` is opened  and search text typed WHEN `Clear` has been clicked THEN the link should not be displayed',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let filterPanel = new BrowseFilterPanel();
            // 1. Open Filter Panel:
            await userBrowsePanel.clickOnSearchButton();
            await filterPanel.waitForOpened();
            // 2. Type a text:
            await filterPanel.typeSearchText('test');
            await filterPanel.waitForClearLinkVisible();
            // 3. Click on Clear button:
            await filterPanel.clickOnClearFilterLink();
            await filterPanel.waitForClearLinkNotVisible();
        });

    it('GIVEN `Principal Filter Panel` is opened AND group has been added THEN four aggregation items should be present in Filter Panel',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let filterPanel = new BrowseFilterPanel();
            let name = testUtils.generateRandomName('group');
            let testGroup = itemBuilder.buildGroup(name, 'simple group');
            // 1. Save new group:
            await testUtils.openWizardAndSaveGroup(testGroup);
            // 2. Open Filter Panel:
            await userBrowsePanel.clickOnSearchButton();
            await filterPanel.waitForOpened();
            // 3. Verify aggregation items:
            await testUtils.saveScreenshot('aggregation_group_added');
            let result = await filterPanel.getAggregationItems();
            assert.equal(result.length, 4, 'three aggregation-checkboxes should be present on the page');
            assert.ok(result[0].includes('Group'), 'User aggregation-item should be present');
            assert.ok(result[1].includes(appConst.ID_PROVIDER), 'Id Provider aggregation-item should be present');
            assert.ok(result[2].includes('Role'), 'Role aggregation-item should be present');
            assert.ok(result[3].includes('User'), 'User aggregation-item should be present');
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
