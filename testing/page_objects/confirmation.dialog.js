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
        return XPATH.container + XPATH.noButton;
    }

    async clickOnYesButton() {
        try {
            await this.clickOnElement(this.yesButton);
            await this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Confirmation dialog - click on Yes button failed', 'err_confirm_dialog_yes_click', err);
        }
    }

    clickOnNoButton() {
        return this.clickOnElement(this.noButton);
    }

    async waitForDialogLoaded() {
        try {
            await this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
            await this.pause(300);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_confirmation_dialog');
            throw new Error(`Confirmation dialog was not loaded! screenshot${screenshot} ` + err);
        }
    }

    isDialogLoaded() {
        return this.isElementDisplayed(XPATH.container);
    }

    async waitForDialogClosed() {
        await this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout);
        return await this.pause(100);
    }

    isWarningMessageDisplayed() {
        return this.waitForElementDisplayed(this.warningMessage, appConst.mediumTimeout);
    }

    async getQuestionText() {
        let locator = "//h6[@class='question']";
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return this.getText(locator);
    }
}

module.exports = ConfirmationDialog;






