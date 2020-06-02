const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const BrowseFilterPanel = require('../page_objects/browsepanel/principal.filter.panel');

describe('filter.panel.aggregation.spec Principal Aggregation specification', function () {
    this.timeout(0);
    webDriverHelper.setupBrowser();

    it('GIVEN `Principal Filter Panel` is opened WHEN `User` aggregation has been clicked THEN Roles and Id Provider should not be displayed',
        async () => {
            let browseFilterPanel = new BrowseFilterPanel();
            let userBrowsePanel = new UserBrowsePanel();
            //1. Open Filter Panel:
            await testUtils.openFilterPanel();
            //2. Click on 'User' aggregation checkbox:
            await browseFilterPanel.clickOnUserAggregation();
            //3. user-items should be filtered: Roles and System ID provider folders should not be displayed:
            await userBrowsePanel.waitForItemNotDisplayed('roles');
            await userBrowsePanel.waitForItemNotDisplayed('/system');
            testUtils.saveScreenshot('aggregation_in_users');
            let isDisplayed = await userBrowsePanel.isItemDisplayed('/system/users/su');
            assert.isTrue(isDisplayed, "SU should be displayed in the filtered panel");
        });

    it('GIVEN `Principal Filter Panel` is opened WHEN `Role` aggregation has been clicked THEN Id Provider should not be displayed',
        async () => {
            let filterPanel = new BrowseFilterPanel();
            let userBrowsePanel = new UserBrowsePanel();
            await testUtils.openFilterPanel();
            //Click on 'Role' checkbox:
            await filterPanel.clickOnRoleAggregation();
            await userBrowsePanel.waitForItemNotDisplayed('/system');
            testUtils.saveScreenshot('aggregation_in_role');
            let isDisplayed = await userBrowsePanel.isItemDisplayed('/roles/system.user.admin');
            assert.isTrue(isDisplayed, "System folder is not displayed, but expected role should be displayed in the filtered panel");
        });

    it('GIVEN `Principal Filter Panel` is opened WHEN `Id Provider` aggregation has been clicked THEN Roles-folder should not be displayed',
        async () => {
            let filterPanel = new BrowseFilterPanel();
            let userBrowsePanel = new UserBrowsePanel();
            await testUtils.openFilterPanel();
            //Click on 'Provider' checkbox:
            await filterPanel.clickOnIdProviderAggregation();
            await userBrowsePanel.waitForItemNotDisplayed('roles');
            testUtils.saveScreenshot('aggregation_in_provider');
            let isDisplayed = await userBrowsePanel.isItemDisplayed('/system');
            assert.isTrue(isDisplayed, "roles are not displayed but System folder should be displayed in the filtered panel");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
