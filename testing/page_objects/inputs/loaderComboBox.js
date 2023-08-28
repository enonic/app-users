/**
 * Created on 19.09.2017.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const XPATH = {
    container: `//div[contains(@id,'LoaderComboBox')]`,
    optionDisplayName: "//div[contains(@class,'slick-viewport')]" + `${lib.H6_DISPLAY_NAME}`,
};

class LoaderComboBox extends Page {

    get optionsFilterInput() {
        return `${XPATH.container}` + lib.COMBO_BOX_OPTION_FILTER_INPUT;
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
            return this.getTextInElements(panelDiv + `${XPATH.optionDisplayName}`)
        });
    };

    async typeTextAndSelectOption(optionDisplayName, xpath) {
        try {
            let optionLocator = lib.slickRowByDisplayName(optionDisplayName);
            if (xpath === undefined) {
                xpath = '';
            }

            let elems = await this.getDisplayedElements(xpath + this.optionsFilterInput);
            if (elems.length === 0) {
                await this.waitForElementDisplayed(xpath + this.optionsFilterInput, appConst.mediumTimeout);
                elems = await this.getDisplayedElements(xpath + this.optionsFilterInput);
            }
            //Set text in the options filter input:
            await elems[0].setValue(optionDisplayName);
            //wait for required options is filtered and displayed:
            await this.waitForElementDisplayed(optionLocator, appConst.mediumTimeout);
            await this.pause(300);
            //click on the option in the dropdown list
            await this.clickOnElement(optionLocator);
            return await this.pause(800);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_combobox');
            throw new Error("Loader Combobox error, screenshot: " + screenshot + ' ' + err);
        }
    }
}

module.exports = LoaderComboBox;
