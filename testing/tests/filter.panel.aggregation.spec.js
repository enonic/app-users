const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const BrowseFilterPanel = require('../page_objects/browsepanel/principal.filter.panel');
const appConst = require('../libs/app_const');

describe('filter.panel.aggregation.spec - tests for Principal Aggregation', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    const USER_ADMIN_ROLE_NAME = '/roles/system.user.admin';
    const SU_USER_NAME = '/system/users/su';

    it("GIVEN 'User' aggregation checkbox is checked WHEN the checkbox has been clicked THEN grid returns to the initial state",
        async () => {
            let browseFilterPanel = new BrowseFilterPanel();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Open Filter Panel:
            await testUtils.openFilterPanel();
            // 2. Click on 'User' aggregation checkbox:
            await browseFilterPanel.clickOnUserAggregation();
            // 3. Verify that user-items should be filtered: 'Roles' and 'System ID provider' folders should not be displayed:
            await userBrowsePanel.waitForItemByDisplayNameNotDisplayed('Roles');
            await userBrowsePanel.waitForItemByDisplayNameNotDisplayed('System Id Provider');
            // 4. Click on 'User' aggregation checkbox:
            await browseFilterPanel.clickOnUserAggregation();
            await testUtils.saveScreenshot('returns_to_initial');
            // 5. Verify that 'System Id Provider' and Roles folders get visible again:
            await userBrowsePanel.waitForItemByDisplayNameDisplayed('System Id Provider');
            await userBrowsePanel.waitForItemByDisplayNameDisplayed('Roles');
        });

    it("GIVEN 'Principal Filter Panel' is opened WHEN 'User' aggregation has been clicked THEN Roles and Id Provider should not be displayed",
        async () => {
            let browseFilterPanel = new BrowseFilterPanel();
            let userBrowsePanel = new UserBrowsePanel();
            // 1. Open Filter Panel:
            await testUtils.openFilterPanel();
            // 2. Verify that 'System Id Provider' folder is displayed by initially:
            await userBrowsePanel.waitForItemByDisplayNameDisplayed('System Id Provider');
            // 3. Click on 'User' aggregation checkbox:
            await browseFilterPanel.clickOnUserAggregation();
            // 4. Verify that user-items should be filtered: 'Roles' and 'System ID provider' folders should not be displayed:
            await userBrowsePanel.waitForItemByDisplayNameNotDisplayed('Roles');
            await userBrowsePanel.waitForItemByDisplayNameNotDisplayed('System Id Provider');
            await testUtils.saveScreenshot('aggregation_in_users');
            // 5. Verify that SU is present in the filtered grid
            // Verify that '/system/users/su' is displayed in the filtered panel:
            let isDisplayed = await userBrowsePanel.scrollListBoxPanelAndFindItem(SU_USER_NAME, 300, 10);
            await testUtils.saveScreenshot('users_scrolled');
            assert.ok(isDisplayed, "'SU' should be displayed in the filtered panel");
        });

    it('GIVEN `Principal Filter Panel` is opened WHEN `Role` aggregation has been clicked THEN Id Provider should not be displayed',
        async () => {
            let filterPanel = new BrowseFilterPanel();
            let userBrowsePanel = new UserBrowsePanel();
            await testUtils.openFilterPanel();
            // Click on 'Role' checkbox:
            await filterPanel.clickOnRoleAggregation();
            await testUtils.saveScreenshot('aggregation_in_role');
            // Verify that 'System Id Provider' is not displayed when 'Role' checkbox is checked:
            await userBrowsePanel.waitForItemByDisplayNameNotDisplayed('System Id Provider');
            // Verify that 'Users Administrator' role is displayed in the Grid:
            let isDisplayed = await userBrowsePanel.scrollListBoxPanelAndFindItem(USER_ADMIN_ROLE_NAME, 300, 10);
            await testUtils.saveScreenshot('panel_scrolled_role_displayed');
            assert.ok(isDisplayed, 'expected role should be displayed in the filtered panel');
        });

    it('GIVEN `Principal Filter Panel` is opened WHEN `Id Provider` aggregation has been clicked THEN Roles-folder should not be displayed',
        async () => {
            let filterPanel = new BrowseFilterPanel();
            let userBrowsePanel = new UserBrowsePanel();
            await testUtils.openFilterPanel();
            // 1. Click on 'Provider' checkbox:
            await filterPanel.clickOnIdProviderAggregation();
            await testUtils.saveScreenshot('aggregation_in_provider');
            // 2. 'System Id Provider' folder should be displayed in the filtered panel
            await userBrowsePanel.waitForItemByDisplayNameDisplayed('System Id Provider');
            // 3. Roles folder should not be displayed but
            await userBrowsePanel.waitForItemByDisplayNameNotDisplayed('Roles');
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
