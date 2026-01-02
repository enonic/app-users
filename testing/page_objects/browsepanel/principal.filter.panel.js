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

    async getNumberInUserAggregationCheckbox() {
        let userAggregationLocator = xpath.container + xpath.aggregationGroupView + xpath.userAggregationCheckbox + `/label`;
        let text = await this.getText(userAggregationLocator);
        let startIndex = text.indexOf('(');
        let endIndex = text.indexOf(')');
        return text.substring(startIndex + 1, endIndex);
    }

    async getNumberInGroupAggregationCheckbox() {
        let groupAggregationLocator = xpath.container + xpath.aggregationGroupView + xpath.groupAggregationCheckbox + `/label`;
        let text = await this.getText(groupAggregationLocator);
        let startIndex = text.indexOf('(');
        let endIndex = text.indexOf(')');
        return text.substring(startIndex + 1, endIndex);
    }

    async getNumberInRoleAggregationCheckbox() {
        let roleAggregationLocator = xpath.container + xpath.aggregationGroupView + xpath.roleAggregationCheckbox + `/label`;
        await this.waitForElementDisplayed(roleAggregationLocator, appConst.shortTimeout);
        await this.pause(300);
        let result = await this.getText(roleAggregationLocator);
        let startIndex = result.indexOf('(');
        let endIndex = result.indexOf(')');
        return result.substring(startIndex + 1, endIndex);
    }

    getAggregationItems() {
        let selector = xpath.container + xpath.aggregationGroupView + xpath.userAggregationItems;
        return this.getTextInElements(selector);
    }

    async clickOnUserAggregation() {
        let selector = xpath.container + xpath.aggregationGroupView + xpath.userAggregationCheckbox + '/label';
        await this.clickOnElement(selector);
        return await this.pause(400);
    }

    async clickOnGroupAggregation() {
        let locator = xpath.container + xpath.aggregationGroupView + xpath.groupAggregationCheckbox + '/label';
        await this.clickOnElement(locator);
        return await this.pause(400);
    }

    async clickOnRoleAggregation() {
        let selector = xpath.container + xpath.aggregationGroupView + xpath.roleAggregationCheckbox + '/label';
        await this.clickOnElement(selector);
        return await this.pause(400);
    }

    async clickOnIdProviderAggregation() {
        let selector = xpath.container + xpath.aggregationGroupView + xpath.idProviderAggregationCheckbox + '/label';
        await this.clickOnElement(selector);
        return await this.pause(400);
    }

    async waitForOpened() {
        return await this.waitForElementDisplayed(xpath.aggregationGroupView, appConst.mediumTimeout);
    }

    async waitForClosed() {
        try {
            await this.waitForElementNotDisplayed(xpath.userAggregationCheckbox, appConst.shortTimeout)
        } catch (err) {
            await this.handleError('Filter Panel was not closed', 'err_filter_panel_not_closed', err);
        }
    }

    async typeSearchText(text) {
        try {
            await this.waitForElementDisplayed(this.searchTextInput, appConst.mediumTimeout);
            await this.typeTextInInput(this.searchTextInput, text);
            return await this.pause(300);
        } catch (err) {
            await this.handleError("Filter Panel, search input", 'err_filter_panel_search_input', err);
        }
    }

    async waitForClearLinkVisible() {
        try {
            await this.waitForElementDisplayed(this.clearFilterLink, appConst.mediumTimeout)
        } catch (err) {
            await this.handleError('Clear link should be visible', 'err_wait_clear_link_visible', err);
        }
    }

    waitForClearLinkNotVisible() {
        return this.waitForElementNotDisplayed(this.clearFilterLink, appConst.shortTimeout);
    }

    clickOnClearFilterLink() {
        return this.clickOnElement(this.clearFilterLink);
    }

    isPanelVisible() {
        return this.isElementDisplayed(xpath.container);
    }
}

module.exports = BrowseFilterPanel;

