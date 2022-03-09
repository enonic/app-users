/**
 * Created on 09.03.2022
 */
const LoaderCombobox = require('./loaderComboBox');
const lib = require('../../libs/elements');
const xpath = {
    container: `//div[contains(@id,'PrincipalComboBox')]`,
};

class PrincipalComboBox extends LoaderCombobox {

    get optionsFilterInput() {
        return `${xpath.container}` + lib.COMBO_BOX_OPTION_FILTER_INPUT;
    }
}

module.exports = PrincipalComboBox;
