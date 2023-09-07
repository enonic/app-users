/**
 * Created  on 6/29/2017.
 */
const Page = require('./page');
const appConst = require('../libs/app_const');
const XPATH = {
    container: `//div[contains(@id,'ConfirmationDialog')]`,
    yesButton: `//button[contains(@id,'DialogButton') and descendant::u[text()='Y'] and child::span[text()='es']]`,
    noButton: `//button[contains(@id,'DialogButton') and descendant::u[text()='N'] and child::span[text()='o']]`,
};

class ConfirmationDialog extends Page {

    get warningMessage() {
        return XPATH.container + "//h6[text()='Are you sure you want to delete this item?']";
    }

    get yesButton() {
        return XPATH.container + XPATH.yesButton;
    }

    get noButton() {
        return XPATH.container + XPATH.yesButton;
    }

    async clickOnYesButton() {
        try {
            await this.clickOnElement(this.yesButton);
            return await this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout);
        } catch (err) {
            this.saveScreenshot('err_close_confirmation_dialog');
            throw new Error('Confirmation dialog must be closed!')
        }
    }

    clickOnNoButton() {
        return this.clickOnElement(this.noButton);
    }

    waitForDialogLoaded() {
        return this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout).catch(err => {
            throw new Error("Confirmation dialog was not loaded! " + err);
        })
    }

    isDialogLoaded() {
        return this.isElementDisplayed(XPATH.container);
    }

    async waitForDialogClosed() {
        await this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout);
        return await this.pause(1000);
    }

    isWarningMessageDisplayed() {
        return this.waitForElementDisplayed(this.warningMessage, appConst.mediumTimeout);
    }
}

module.exports = ConfirmationDialog;






