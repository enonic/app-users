/**
 * Created on 07.09.2023
 */
const Page = require('../../page');
const lib = require('../../../libs/elements');
const appConst = require('../../../libs/app_const');

const XPATH = {
    container: "//div[contains(@id,'UserKeyDetailsDialog')]",
};

class UserKeyDetailsDialog extends Page {

    get okButton() {
        return XPATH.container + lib.BUTTONS.dialogButton('Ok');
    }
    get publicKeyTextArea(){
        return XPATH.container + "//textarea[@name='public-key']";
    }

    get cancelButtonTop() {
        return XPATH.container + lib.CANCEL_BUTTON_TOP;
    }

    async waitForLoaded() {
        try {
            return this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_key_details_dlg');
            throw new Error('UserKeyDetailsDialog, should be loaded, screenshot:' + screenshot + ' ' + err);
        }
    }

    async waitForClosed() {
        try {
            return await this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_key_details_dlg');
            throw new Error('UserKeyDetailsDialog Dialog is not closed, screenshot: ' + screenshot + ' ' + err);
        }
    }

    async clickOnOkButton() {
        await this.waitForElementDisplayed(this.okButton,appConst.mediumTimeout);
        await this.clickOnElement(this.okButton);
    }

    clickOnCancelButtonTop() {
        return this.clickOnElement(this.cancelButtonTop);
    }

    getTextInTextArea() {
        return this.getTextInInput(this.publicKeyTextArea);
    }
}

module.exports = UserKeyDetailsDialog;
