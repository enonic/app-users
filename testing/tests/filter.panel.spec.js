const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const itemBuilder = require('../libs/userItems.builder');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const BrowseFilterPanel = require('../page_objects/browsepanel/principal.filter.panel');

describe('filter.panel.spec Principal Filter Panel specification', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it('GIVEN `Principal Filter Panel` is opened WHEN `hide filter panel` has been clicked THEN the panel should be closed',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let filterPanel = new BrowseFilterPanel();
            //1. Open Filter Panel:
            await userBrowsePanel.clickOnSearchButton();
            await filterPanel.waitForOpened();
            //2. Click on Hide-icon:
            await userBrowsePanel.clickOnHideFilterButton();
            await filterPanel.waitForClosed();
        });

    it('GIVEN `Principal Filter Panel` is opened WHEN search-text has been typed THEN `Clear` link should appear',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let filterPanel = new BrowseFilterPanel();
            await userBrowsePanel.clickOnSearchButton();
            await filterPanel.waitForOpened();
            await filterPanel.typeSearchText('test');
            //Clear button should appear:
            await filterPanel.waitForClearLinkVisible();
        });

    it('GIVEN `Principal Filter Panel` is opened  and search text typed WHEN `Clear` has been clicked THEN the link should not be displayed',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let filterPanel = new BrowseFilterPanel();
            //1. Open Filter Panel:
            await userBrowsePanel.clickOnSearchButton();
            await filterPanel.waitForOpened();
            //2. Type a text:
            await filterPanel.typeSearchText('test');
            await filterPanel.waitForClearLinkVisible();
            //3. Click on Clear button:
            await filterPanel.clickOnClearLink();
            await filterPanel.waitForClearLinkNotVisible();
        });

    it('GIVEN `Principal Filter Panel` is opened AND group has been added THEN four aggregation items should be present in Filter Panel',
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let filterPanel = new BrowseFilterPanel();
            let name = testUtils.generateRandomName('group');
            let testGroup = itemBuilder.buildGroup(name, 'simple group');
            //1. Save new group:
            await testUtils.openWizardAndSaveGroup(testGroup);
            //2. Open Filter Panel:
            await userBrowsePanel.clickOnSearchButton();
            await filterPanel.waitForOpened();
            //3. Verify aggregation items:
            testUtils.saveScreenshot('aggregation_group_added');
            let result = await filterPanel.getAggregationItems();
            assert.equal(result.length, 4, 'three aggregation-checkboxes should be present on the page');
            assert.isTrue(result[0].includes('Group'), 'User aggregation-item should be present');
            assert.isTrue(result[1].includes(appConst.ID_PROVIDER), 'Id Provider aggregation-item should be present');
            assert.isTrue(result[2].includes('Role'), 'Role aggregation-item should be present');
            assert.isTrue(result[3].includes('User'), 'User aggregation-item should be present');
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
