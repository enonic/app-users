const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const filterPanel = require('../page_objects/browsepanel/principal.filter.panel');

describe('filter.panel.aggregation.spec Principal Aggregation specification', function () {
    this.timeout(0);
    webDriverHelper.setupBrowser();

    it('GIVEN `Principal Filter Panel` is opened WHEN `User` aggregation has been clicked THEN Roles and Store should not be displayed',
        () => {
            return testUtils.openFilterPanel().then(()=> {
                return filterPanel.clickOnUserAggregation();
            }).then(()=> {
                return userBrowsePanel.waitForItemNotDisplayed('roles');
            }).then(()=> {
                return userBrowsePanel.waitForItemNotDisplayed('/system');
            }).then(()=> {
                testUtils.saveScreenshot('aggregation_in_users');
                return expect(userBrowsePanel.isItemDisplayed('/system/users/su')).to.eventually.be.true;
            })
        });

    it('GIVEN `Principal Filter Panel` is opened WHEN `Role` aggregation has been clicked THEN Store should not be displayed',
        () => {
            return testUtils.openFilterPanel().then(()=> {
                return filterPanel.clickOnRoleAggregation();
            }).then(()=> {
                return userBrowsePanel.waitForItemNotDisplayed('/system');
            }).then(()=> {
                testUtils.saveScreenshot('aggregation_in_role');
                return expect(userBrowsePanel.isItemDisplayed('/roles/system.user.admin')).to.eventually.be.true;
            })
        });

    it('GIVEN `Principal Filter Panel` is opened WHEN `Id Provider` aggregation has been clicked THEN Roles-folder should not be displayed',
        () = > {
            return testUtils.openFilterPanel().then(()=> {
                return filterPanel.clickOnStoreAggregation();
            }).then(()=> {
                return userBrowsePanel.waitForItemNotDisplayed('roles');
            }).then(()=> {
                testUtils.saveScreenshot('aggregation_in_store');
                return expect(userBrowsePanel.isItemDisplayed('/system')).to.eventually.be.true;
            })
        });


    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(()=> {
        return console.log('specification starting: ' + this.title);
    });
});
