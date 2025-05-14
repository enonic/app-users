/**
 * Created on 31.08.2017.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: "//div[contains(@id,'NewPrincipalDialog')]",
    itemViewer: "//div[contains(@id,'UserTypesTreeGridItemViewer')]",
    header: "//h2[@class='title']",
    expanderIconByName: function (name) {
        return lib.itemByDisplayName(name) +
               `/ancestor::div[contains(@class,'slick-cell')]/span[contains(@class,'collapse') or contains(@class,'expand')]`;
    },
};

class NewPrincipalDialog extends Page {

    get header() {
        return XPATH.container + XPATH.header;
    }

    get cancelButton() {
        return XPATH.container + lib.BUTTONS.CANCEL_BUTTON_TOP;
    }

    clickOnCancelButtonTop() {
        return this.clickOnElement(this.cancelButton);
    }

    //clicks on User, User Group, Id Provider....
    async clickOnItem(itemName) {
        try {
            let selector = XPATH.itemViewer + lib.itemByDisplayName(itemName);
            return await this.clickOnElement(selector)
        }catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_principal_dialog_click_item');
            throw new Error(`New principal modal dialog, try clicking on the item: '${itemName}' , screenshot ${screenshot}: ` + err);
        }
    }

    isCancelButtonDisplayed() {
        return this.isElementDisplayed(this.cancelButton);
    }

    async waitForDialogLoaded() {
        try {
            await this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
            await this.pause(500);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_principal_dialog_load');
            throw new Error(`New Principal dialog is not loaded screenshot${screenshot}: ` + err);
        }
    }

    getHeaderText() {
        return this.getText(this.header);
    }

    async getNumberOfItems() {
        let items = XPATH.itemViewer + lib.H6_DISPLAY_NAME;
        let elements = await this.getDisplayedElements(items);
        return elements.length;
    }

    getItemNames() {
        let items = XPATH.itemViewer + lib.H6_DISPLAY_NAME;
        return this.getTextInElements(items);
    }

    waitForExpanderIconDisplayed(name) {
        let selector = XPATH.container + lib.TREE_GRID.itemTypesTreeGridListElement(name) + lib.TREE_GRID.EXPANDER_ICON_DIV;
        return this.waitForElementDisplayed(selector, appConst.mediumTimeout).catch(err => {
            console.log("Expander is not visible " + err);
            return false;
        })
    }

    async waitForDialogClosed() {
        try {
            return await this.waitForElementNotDisplayed(XPATH.container, appConst.shortTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshot('err_principal_dialog_close');
            throw new Error(`New Principal Dialog was not closed ${screenshot} ` + err);
        }
    }

    async clickOnExpanderIcon(name) {
        let selector = XPATH.container + lib.TREE_GRID.itemTypesTreeGridListElement(name) + lib.TREE_GRID.EXPANDER_ICON_DIV;
        await this.clickOnElement(selector);
        return await this.pause(300);
    }

    waitForProviderNameDisplayed(name) {
        let selector = XPATH.container + XPATH.itemViewer + lib.itemByName(name);
        return this.waitForElementDisplayed(selector, appConst.mediumTimeout);
    }
}
module.exports = NewPrincipalDialog;

