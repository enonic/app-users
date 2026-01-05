/**
 * Created on 05.09.2024
 */
const BaseDropdown = require('./base.dropdown');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    selectorListBoxDiv: "//div[contains(@id,'IdProviderAccessControlComboBox')]",
    optionByText: text => {
        return `//div[contains(@id,'ComboBoxDisplayValueViewer') and text()='${text}']`
    },
};

class IdProviderAccessControlComboBox extends BaseDropdown {

    get container() {
        return XPATH.selectorListBoxDiv;
    }

    async selectFilteredByDisplayNamePermission(optionName, parentElement) {
        try {
            await this.clickOnFilteredByDisplayNameItemAndClickOnApply(optionName, parentElement);
        } catch (err) {
            await this.handleError('IdProviderAccessControlComboBox - tried to select the option', 'err_access_control_dropdown', err);
        }
    }

    async getOptionsDisplayName(parentXpath) {
        if (parentXpath === undefined) {
            parentXpath = '';
        }
        let locator = parentXpath + XPATH.selectorListBoxDiv + lib.DROPDOWN_SELECTOR.DROPDOWN_LIST_ITEM + lib.H6_DISPLAY_NAME;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        await this.pause(500);
        return await this.getTextInDisplayedElements(locator);
    }
}

module.exports = IdProviderAccessControlComboBox;

