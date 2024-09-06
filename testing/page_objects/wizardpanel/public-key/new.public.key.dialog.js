/**
 * Created on 06.09.2023
 */
const Page = require('../../page');
const lib = require('../../../libs/elements');
const appConst = require('../../../libs/app_const');

const XPATH = {
    container: "//div[contains(@id,'NewPublicKeyDialog')]",
};

class NewPublicKeyDialog extends Page {

    get publicKeyLabelInput() {
        return XPATH.container + lib.TEXT_INPUT;
    }

    get menuDropdownHandle() {
        return XPATH.container + lib.BUTTONS.DROP_DOWN_HANDLE;
    }

    get cancelButton() {
        return XPATH.container + lib.BUTTONS.dialogButton('Cancel');
    }

    get cancelButtonTop() {
        return XPATH.container + lib.BUTTONS.CANCEL_BUTTON_TOP;
    }

    get generateButton() {
        return XPATH.container + lib.BUTTONS.actionButton('Generate');
    }

    waitForGenerateButtonDisplayed() {
        return this.waitForElementDisplayed(this.generateButton, appConst.mediumTimeout);
    }

    async waitForGenerateButtonEnabled() {
        try {
            await this.waitForGenerateButtonDisplayed();
            return this.waitForElementEnabled(this.generateButton, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_gen_key_btn');
            throw new Error('Generate Button, should be enabled, screenshot:' + screenshot + ' ' + err);
        }
    }

    async waitForGenerateButtonDisabled() {
        try {
            await this.waitForGenerateButtonDisplayed();
            return this.waitForElementDisabled(this.generateButton, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_gen_key_btn');
            throw new Error('Generate Button, should be disabled, screenshot:' + screenshot + ' ' + err);
        }
    }


    async waitForLoaded() {
        try {
            return this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_public_key_dlg');
            throw new Error('NewPublicKeyDialog, should be loaded, screenshot:' + screenshot + ' ' + err);
        }
    }

    async waitForClosed() {
        try {
            return await this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_public_key_dlg');
            throw new Error('NewPublicKeyDialog Dialog is not closed, screenshot: ' + screenshot + ' ' + err);
        }
    }

    async clickOnGenerateButton() {
        await this.waitForGenerateButtonEnabled();
        await this.clickOnElement(this.generateButton);
    }

    clickOnCancelButton() {
        return this.clickOnElement(this.cancelButton);
    }

    clickOnCancelButtonTop() {
        return this.clickOnElement(this.cancelButtonTop);
    }

    // Sets value in key-input
    typeKeyLabel(keyLabel) {
        return this.typeTextInInput(this.publicKeyLabelInput, keyLabel);
    }

    async waitForMnuItemDisplayed() {
        let locator = XPATH.container + lib.MENU_ITEM
    }

    async clickOnMenuDropdownHandle() {
        try {
            await this.waitForElementEnabled(this.menuDropdownHandle, appConst.mediumTimeout);
            await this.clickOnElement(this.menuDropdownHandle);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('key_menu_dropdown');
            throw new Error("New public key - menu dropdown button, screenshot:" + screenshot + ' ' + err);
        }
    }
}

module.exports = NewPublicKeyDialog;
