/**
 * Created on 19.09.2017.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const xpath = {
    container: `//div[contains(@id,'LoaderComboBox')]`,
    optionDisplayName: "//div[contains(@class,'slick-viewport')]" + `${lib.H6_DISPLAY_NAME}`,
};

class LoaderComboBox extends Page {

    get optionsFilterInput() {
        return `${xpath.container}` + lib.COMBO_BOX_OPTION_FILTER_INPUT;
    }

    typeTextInOptionFilterInput(selector, text) {
        return this.typeTextInInput(selector, text)
    }

    clickOnOption(panelDiv, displayName) {
        return this.clickOnElement(panelDiv + `${lib.slickRowByDisplayName(displayName)}`).then(() => {
            return this.pause(500);
        });
    }

    waitForListExpanded(panelDiv) {
        return this.waitForElementDisplayed(panelDiv + `${lib.SLICK_ROW}`, 1000)
    }

    waitForOptionVisible(panelDiv, displayName) {
        return this.waitForElementDisplayed(panelDiv + `${lib.slickRowByDisplayName(displayName)}`, 3000);
    }

    getOptionDisplayNames(panelDiv) {
        return this.waitForListExpanded(panelDiv).then(() => {
            return this.getTextInElements(panelDiv + `${xpath.optionDisplayName}`)
        });
    };

    typeTextAndSelectOption(optionDisplayName, xpath) {
        let optionSelector = lib.slickRowByDisplayName(optionDisplayName);
        if (xpath === undefined) {
            xpath = '';
        }
        return this.typeTextInInput(xpath + this.optionsFilterInput, optionDisplayName).then(() => {
            return this.clickOnElement(optionSelector)
        }).catch(err => {
            this.saveScreenshot('err_clicking_on_option');
            throw new Error('Error when clicking on the option in loadercombobox!' + optionDisplayName + " " + err);
        }).then(() => {
            return this.pause(500);
        });
    }
}
module.exports = LoaderComboBox;