/**
 * Created on 06.09.2024
 */
const BaseDropdown = require('./base.dropdown');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    repositoryComboBoxDiv: "//div[contains(@id,'RepositoryComboBox')]",
};

class RepositoryComboBox extends BaseDropdown {

    get container() {
        return XPATH.repositoryComboBoxDiv;
    }

    async selectFilteredOptionAndClickOnOk(optionName, parentElement) {
        try {
            await this.clickOnFilteredItemAndClickOnOk(optionName, parentElement);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_dropdown');
            throw new Error(`RepositoryComboBox - Error during selecting the option, screenshot: ${screenshot}` + err);
        }
    }

    async getOptionsDisplayName(parentXpath) {
        if (parentXpath === undefined) {
            parentXpath = '';
        }
        let locator = parentXpath + XPATH.principalComboboxDiv + lib.DROPDOWN_SELECTOR.DROPDOWN_LIST_ITEM + lib.H6_DISPLAY_NAME;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        await this.pause(300);
        return await this.getTextInDisplayedElements(locator);
    }
}

module.exports = RepositoryComboBox;

