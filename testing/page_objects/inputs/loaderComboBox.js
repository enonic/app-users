/**
 * Created on 19.09.2017.
 */
const wizard = require('../page');
const elements = require('../../libs/elements');
const comboBox = {
    div: `//div[contains(@id,'LoaderComboBox')]`,
    optionFilterInput: `${elements.COMBO_BOX_OPTION_FILTER_INPUT}`,
    optionDisplayName: "//div[@class='slick-viewport']" + `${elements.H6_DISPLAY_NAME}`,
};
const loaderComboBox = Object.create(wizard, {

    optionFilterInput: {
        get: function () {
            return `${comboBox.div}` + `${comboBox.optionFilterInput}`;
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
            return this.waitForVisible(panelDiv + `${elements.slickRowByDisplayName(displayName)}`, 2000)
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
                return this.getTextFromElements(panelDiv + `${comboBox.optionDisplayName}`)
            });
        }
    }
});
module.exports = loaderComboBox;

