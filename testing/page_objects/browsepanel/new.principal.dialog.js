/**
 * Created on 31.08.2017.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: `//div[contains(@id,'NewPrincipalDialog')]`,
    itemViewer: `//div[contains(@id,'UserTypesTreeGridItemViewer')]`,
    header: `//h2[@class='title']`,
    expanderIconByName: function (name) {
        return lib.itemByDisplayName(name) +
               `/ancestor::div[contains(@class,'slick-cell')]/span[contains(@class,'collapse') or contains(@class,'expand')]`;
    },
};
class NewPrincipalDialog extends Page {

    get header() {
        return `${XPATH.container}${XPATH.header}`;
    }

    get cancelButton() {
        return `${XPATH.container}${lib.CANCEL_BUTTON_TOP}`;
    }

    clickOnCancelButtonTop() {
        return this.clickOnElement(this.cancelButton);
    }

    //clicks on User, User Group, Id Provider....
    clickOnItem(itemName) {
        let selector = XPATH.itemViewer + lib.itemByDisplayName(itemName);
        return this.clickOnElement(selector)
    }

    isCancelButtonDisplayed() {
        return this.isElementDisplayed(this.cancelButton);
    }

    waitForDialogLoaded() {
        return this.browser.$(XPATH.container).then(element => {
            return element.waitForDisplayed(appConst.TIMEOUT_3);
        });
    }

    getHeaderText() {
        return this.getText(this.header);
    }

    async getNumberOfItems() {
        let items = XPATH.itemViewer + lib.H6_DISPLAY_NAME;
        let elements = await this.getDisplayedElements(items);
        return elements.length;
        // let elements = await this.findElements(items);
        // let result = await elements.filter(el => {
        //     el.isElementDisplayed();
        // })
        //return Object.keys(result).length;
    }

    getItemNames() {
        let items = XPATH.itemViewer + lib.H6_DISPLAY_NAME;
        return this.getTextInElements(items);
    }

    waitForExpanderIconDisplayed(name) {
        let selector = XPATH.container + XPATH.expanderIconByName(name);
        return this.waitForElementDisplayed(selector, appConst.TIMEOUT_3).catch(err => {
            console.log("Expander is not visible " + err);
            return false;
        })
    }

    waitForDialogClosed() {
        try {
            return this.waitForElementNotDisplayed(`${XPATH.container}`, appConst.TIMEOUT_2);
        } catch (err) {
            this.saveScreenshot('err_principal_dialog_close');
            throw new Error('New Principal Dialog was not closed');
        }
    }

    clickOnExpanderIcon(name) {
        let selector = XPATH.container + XPATH.expanderIconByName(name);
        return this.clickOnElement(selector).then(() => {
            return this.pause(300);
        })
    }

    waitForProviderNameDisplayed(name) {
        let selector = XPATH.container + XPATH.itemViewer + lib.itemByName(name);
        return this.waitForElementDisplayed(selector, appConst.TIMEOUT_2);
    }
};
module.exports = NewPrincipalDialog;

