/**
 * Created on 12.12.2017.
 */

const page = require('../page');
const elements = require('../../libs/elements');
const appConst = require('../../libs/app_const');
var panel = {
    container: "//div[contains(@id,'PrincipalBrowseFilterPanel')]",
    clearFilterButton: "//a[contains(@id,'ClearFilterButton')]",
    searchInput: "//input[contains(@id,'browse.filter.TextSearchField')]",
    aggregationGroupView: "//div[contains(@id,'AggregationContainer')]",
    userAggregationCheckbox: "//div[contains(@id,'Checkbox') and child::label[contains(.,'User (')]]",
    roleAggregationCheckbox: "//div[contains(@id,'Checkbox') and child::label[contains(.,'Role (')]]",
    storeAggregationCheckbox: "//div[contains(@id,'Checkbox') and child::label[contains(.,'User Store (')]]",
    userAggregationItems: "//div[contains(@id,'BucketView')]//div[contains(@id,'Checkbox') ]/label",
};
var browseFilterPanel = Object.create(page, {

    clearFilterLink: {
        get: function () {
            return `${panel.container}` + `${panel.clearFilterButton}`;
        }
    },
    searchTextInput: {
        get: function () {
            return `${panel.container}` + `${panel.searchInput}`;
        }
    },
    getNumberAggregatedUsers: {
        value: function () {
            let userSelector = `${panel.container}` + `${panel.aggregationGroupView}` + `${panel.userAggregationCheckbox}` + `/label`;
            return this.getText(userSelector);
        }
    },
    getAggregationItems: {
        value: function () {
            let selector = `${panel.container}` + `${panel.aggregationGroupView}` + `${panel.userAggregationItems}`;
            return this.getTextFromElements(selector);
        }
    },
    clickOnUserAggregation: {
        value: function () {
            let userSelector = `${panel.container}` + `${panel.aggregationGroupView}` + `${panel.userAggregationCheckbox}` + '/label'
            return this.doClick(userSelector);
        }
    },
    clickOnRoleAggregation: {
        value: function () {
            let userSelector = `${panel.container}` + `${panel.aggregationGroupView}` + `${panel.roleAggregationCheckbox}` + '/label'
            return this.doClick(userSelector);
        }
    },
    clickOnStoreAggregation: {
        value: function () {
            let userSelector = `${panel.container}` + `${panel.aggregationGroupView}` + `${panel.storeAggregationCheckbox}` + '/label'
            return this.doClick(userSelector);
        }
    },
    typeSearchText: {
        value: function (text) {
            return this.typeTextInInput(this.searchTextInput, text).pause(500);
        }
    },
    waitForOpened: {
        value: function () {
            return this.waitForVisible(`${panel.userAggregationCheckbox}`, appConst.TIMEOUT_3);

        }
    },
    waitForClosed: {
        value: function () {
            return this.waitForNotVisible(`${panel.container}`, appConst.TIMEOUT_1).catch(error=> {
                this.saveScreenshot('err_filter_panel_close');
                throw new Error('Filter Panel was not closed');
            });
        }
    },
    isPanelVisible: {
        value: function () {
            return this.isElementDisplayed(`${panel.container}`);
        }
    },
    waitForClearLinkVisible: {
        value: function () {
            return this.waitForVisible(this.clearFilterLink, appConst.TIMEOUT_2).catch(err=> {
                this.saveScreenshot('err_clear_users_filter_panel');
                throw new Error('Clear link should be visible: ' + err);
            })
        }
    },
    waitForClearLinkNotVisible: {
        value: function () {
            return this.waitForNotVisible(this.clearFilterLink)
        }
    },
    clickOnClearLink: {
        value: function () {
            return this.doClick(`${panel.clearFilterButton}`)
        }
    }
});
module.exports = browseFilterPanel;
