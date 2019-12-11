/**
 * Created on 03.11.2017.
 */
const Page = require('./page');
const appConst = require('../libs/app_const');
const xpath = {
    container: `//div[contains(@id,'SaveBeforeCloseDialog')]`,
    yesButton: `//button[contains(@id,'DialogButton') and child::span[text()='Yes']]`,
    noButton: `//div[@class='dialog-buttons']//button/span[text()='No']`,
};
class SaveBeforeCloseDialog extends Page {

    get warningMessage() {
        return `${xpath.container}//h6[text()='There are unsaved changes, do you want to save them before closing?']`;
    }

    get yesButton() {
        return `${xpath.container}//button[contains(@id,'DialogButton') and child::span[text()='Yes']]`
    }

    get noButton() {
        return `${xpath.container}//div[@class='dialog-buttons']//button/span[text()='No']`
    }

    waitForLoaded() {
        return this.waitForElementDisplayed(xpath.container, appConst.TIMEOUT_3);
    }

    clickOnYesButton() {
        return this.clickOnElement(this.yesButton);
    }

    clickOnNoButton() {
        return this.clickOnElement(this.noButton);
    }

    waitForDialogOpened() {
        return this.waitForElementDisplayed(xpath.container, appConst.TIMEOUT_3);
    }

    waitForDialogClosed() {
        return this.waitUntilElementNotVisible(this.yesButton).catch(err => {
            this.saveScreenshot("err_close_save_before_close_dialog");
            throw new Error("Save before dialog should be closed! " + err);
        })
    }

    isDialogLoaded() {
        return this.isElementDisplayed(xpath.container);
    }

    isWarningMessageVisible() {
        return this.isElementDisplayed(this.warningMessage);
    }
};
module.exports = SaveBeforeCloseDialog;




