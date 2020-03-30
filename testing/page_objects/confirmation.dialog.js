/**
 * Created  on 6/29/2017.
 */
const Page = require('./page');
const appConst = require('../libs/app_const');
const XPATH = {
    container: `//div[contains(@id,'ConfirmationDialog')]`,
    yesButton: `//button[contains(@id,'DialogButton') and child::span[text()='Yes']]`,
    noButton: `//div[@class='dialog-buttons']//button/span[text()='No']`
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

    clickOnYesButton() {
        return this.clickOnElement(this.yesButton).then(() => {
            return this.waitForElementNotDisplayed(XPATH.container, appConst.TIMEOUT_2);
        }).catch(err => {
            this.saveScreenshot('err_close_confirmation_dialog');
            throw new Error('Confirmation dialog must be closed!')
        })
    }

    clickOnNoButton() {
        return this.clickOnElement(this.noButton);
    }

    waitForDialogLoaded() {
        return this.waitForElementDisplayed(XPATH.container, appConst.TIMEOUT_3).catch(err => {
            throw  new Error("Confirmation dialog was not loaded! " + err);
        })
    }

    isDialogLoaded() {
        return this.isElementDisplayed(XPATH.container);
    }

    waitForDialogClosed() {
        return this.waitForElementNotDisplayed(XPATH.container, ms);
    }

    isWarningMessageDisplayed() {
        return this.waitForElementDisplayed(this.warningMessage);
    }
};
module.exports = ConfirmationDialog;






