const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const itemBuilder = require('../libs/userItems.builder');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const filterPanel = require('../page_objects/browsepanel/principal.filter.panel');

describe('filter.panel.spec Principal Filter Panel specification', function () {
    this.timeout(0);
    webDriverHelper.setupBrowser();

    it('GIVEN `Principal Filter Panel` is opened WHEN `hide filter panel` has been clicked THEN the panel should be closed',
        () => {
            return userBrowsePanel.clickOnSearchButton().then(()=> {
                return filterPanel.waitForOpened();
            }).then(()=> {
                return userBrowsePanel.clickOnHideFilterButton();
            }).then(()=> {
                return filterPanel.waitForClosed();
            })
        });

    it('GIVEN `Principal Filter Panel` is opened WHEN search-text has been typed THEN `Clear` link should appear',
        () => {
            return userBrowsePanel.clickOnSearchButton().then(()=> {
                return filterPanel.waitForOpened();
            }).then(()=> {
                return filterPanel.typeSearchText('test');
            }).then(()=> {
                return filterPanel.waitForClearLinkVisible();
            });
        });

    it('GIVEN `Principal Filter Panel` is opened  and search text typed WHEN `Clear` has been clicked THEN the link should not be displayed',
        () => {
            return userBrowsePanel.clickOnSearchButton().then(()=> {
                return filterPanel.waitForOpened();
            }).then(()=> {
                return filterPanel.typeSearchText('test');
            }).then(()=> {
                return filterPanel.waitForClearLinkVisible();
            }).then(()=> {
                return filterPanel.clickOnClearLink();
            }).then(()=> {
                return filterPanel.waitForClearLinkNotVisible();
            });
        });

    it('GIVEN `Principal Filter Panel` is opened AND group has been added THEN four aggregation items should be present on the panel',
        () => {
            let name = testUtils.generateRandomName('group');
            let testGroup = itemBuilder.buildGroup(name, 'simple group');
            return testUtils.openWizardAndSaveGroup(testGroup).then(()=> {
                return userBrowsePanel.clickOnSearchButton();
            }).then(()=> {
                return filterPanel.waitForOpened();
            }).pause(400).then(()=> {
                testUtils.saveScreenshot('aggregation_group_added');
                return filterPanel.getAggregationItems();
            }).then(result=> {
                assert.equal(result.length, 4, 'three aggregation-checkboxes should be present on the page');
                assert.isTrue(result[0].includes('Group'), 'User aggregation-item should be present');
                assert.isTrue(result[1].includes('Role'), 'Role aggregation-item should be present');
                assert.isTrue(result[2].includes('User'), 'User aggregation-item should be present');
                assert.isTrue(result[3].includes('Id Provider'), 'Id Provider aggregation-item should be present');
            })
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});
