/**
 * Created on 19.09.2017.
 */
const page = require('../page');
const elements = require('../../libs/elements');
const xpath = {
    container: `//div[contains(@id,'LoaderComboBox')]`,
    optionDisplayName: "//div[@class='slick-viewport']" + `${elements.H6_DISPLAY_NAME}`,
};
const loaderComboBox = Object.create(page, {

    optionsFilterInput: {
        get: function () {
            return `${xpath.container}` + elements.COMBO_BOX_OPTION_FILTER_INPUT;
        }
    },
    typeTextInOptionFilterInput: {
        value: function (selector, text) {
            return this.typeTextInInput(selector, text)
        }
    },
    clickOnOption: {
        value: function (panelDiv, displayName) {
            return this.doClick(panelDiv + `${elements.slickRowByDisplayName(displayName)}`).pause(500);
        }
    },
    waitForOptionVisible: {
        value: function (panelDiv, displayName) {
            return this.waitForVisible(panelDiv + `${elements.slickRowByDisplayName(displayName)}`, 3000)
        }
    },
    waitForListExpanded: {
        value: function (panelDiv) {
            return this.waitForVisible(panelDiv + `${elements.SLICK_ROW}`, 1000)
        }
    },
    getOptionDisplayNames: {
        value: function (panelDiv) {
            return this.waitForListExpanded(panelDiv).then(()=> {
                return this.getTextFromElements(panelDiv + `${xpath.optionDisplayName}`)
            });
        }
    },
    typeTextAndSelectOption: {
        value: function (optionDisplayName, xpath) {
            let optionSelector = elements.slickRowByDisplayName(optionDisplayName);
            if (xpath === undefined) {
                xpath = '';
            }
            return this.getDisplayedElements(xpath + this.optionsFilterInput).then(result => {
                return this.getBrowser().elementIdValue(result[0].ELEMENT, optionDisplayName);
            }).pause(1000).then(() => {
                return this.doClick(optionSelector).catch(err => {
                    this.saveScreenshot('err_clicking_on_option');
                    throw new Error('Error when clicking on the option in loadercombobox!' + optionDisplayName + " " + err);
                }).pause(500);
            })
        }
    },
});
module.exports = loaderComboBox;

