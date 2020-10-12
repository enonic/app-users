/**
 * Created on 12.12.2017.
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const xpath = {
    container: "//div[contains(@id,'PrincipalBrowseFilterPanel')]",
    clearFilterButton: "//a[contains(@id,'ClearFilterButton')]",
    searchInput: "//input[contains(@id,'TextSearchField')]",
    aggregationGroupView: "//div[contains(@id,'AggregationContainer')]",
    userAggregationCheckbox: "//div[contains(@id,'Checkbox') and child::label[contains(.,'User (')]]",
    roleAggregationCheckbox: "//div[contains(@id,'Checkbox') and child::label[contains(.,'Role (')]]",
    groupAggregationCheckbox: "//div[contains(@id,'Checkbox') and child::label[contains(.,'Group')]]",
    idProviderAggregationCheckbox: "//div[contains(@id,'Checkbox') and child::label[contains(.,'Id Provider (')]]",
    userAggregationItems: "//div[contains(@id,'BucketView')]//div[contains(@id,'Checkbox') ]/label",
};
class BrowseFilterPanel extends Page {

    get clearFilterLink() {
        return xpath.container + xpath.clearFilterButton;
    }

    get searchTextInput() {
        return xpath.container + xpath.searchInput;
    }

    getNumberAggregatedUsers() {
        let userSelector = xpath.container + xpath.aggregationGroupView + xpath.userAggregationCheckbox + `/label`;
        return this.getText(userSelector);
    }

    getNumberAggregatedRoles() {
        let userSelector = xpath.container + xpath.aggregationGroupView + xpath.roleAggregationCheckbox + `/label`;
        return this.getText(userSelector).then(result => {
            let startIndex = result.indexOf('(');
            let endIndex = result.indexOf(')');
            return result.substring(startIndex + 1, endIndex);
        });
    }

    getAggregationItems() {
        let selector = xpath.container + xpath.aggregationGroupView + xpath.userAggregationItems;
        return this.getTextInElements(selector);
    }

    clickOnUserAggregation() {
        let selector = xpath.container + xpath.aggregationGroupView + xpath.userAggregationCheckbox + '/label';
        return this.clickOnElement(selector);
    }

    clickOnGroupAggregation() {
        let locator = xpath.container + xpath.aggregationGroupView + xpath.groupAggregationCheckbox + '/label';
        return this.clickOnElement(locator);
    }

    async clickOnRoleAggregation() {
        let selector = xpath.container + xpath.aggregationGroupView + xpath.roleAggregationCheckbox + '/label';
        await this.clickOnElement(selector);
        await this.pause(400);
    }

    async clickOnIdProviderAggregation() {
        let selector = xpath.container + xpath.aggregationGroupView + xpath.idProviderAggregationCheckbox + '/label';
        await this.clickOnElement(selector);
        await this.pause(400);
    }

    waitForOpened() {
        return this.waitForElementDisplayed(xpath.aggregationGroupView, appConst.mediumTimeout);
    }

    waitForClosed() {
        return this.waitUntilElementNotVisible(xpath.userAggregationCheckbox, appConst.TIMEOUT_2).catch(err => {
            this.saveScreenshot('err_filter_panel_not_closed');
            throw new Error('Filter Panel was not closed. ' + err);
        })
    }

    typeSearchText(text) {
        return this.typeTextInInput(this.searchTextInput, text).catch(err => {
            throw new Error("Filter Panel - " + err);
        })
    }

    waitForClearLinkVisible() {
        return this.waitForElementDisplayed(this.clearFilterLink, appConst.mediumTimeout).catch(err => {
            this.saveScreenshot('err_clear_link_filter_panel');
            throw new Error('Clear link should be visible: ' + err);
        })
    }

    waitForClearLinkNotVisible() {
        return this.waitUntilElementNotVisible(this.clearFilterLink, appConst.TIMEOUT_2);
    }

    clickOnClearLink() {
        return this.clickOnElement(this.clearFilterLink);
    }

    isPanelVisible() {
        return this.isElementDisplayed(xpath.container);
    }
}
module.exports = BrowseFilterPanel;

