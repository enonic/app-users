/**
 * Created on 24.10.2017.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: "//div[contains(@id,'ChangeUserPasswordDialog')]",
    passwordInput: "//input[contains(@class,'password-input')]",
    changePasswordButton: "//button[contains(@id,'DialogButton') and child::span[text()='Change Password']]",
    cancelButton: "//button[contains(@id,'DialogButton')]/span[text()='Cancel']",
    showPasswordLink: "//a[contains(@class,'show-link')]",
    generatePasswordLink: "//a[text()='Generate']",
    userPath: "//h6[@class='user-path']",
    passwordGenerator: "//div[contains(@id,'PasswordGenerator')]",
};

class ChangeUserPasswordDialog extends Page {

    get passwordInput() {
        return XPATH.container + XPATH.passwordInput;
    }

    get generatePasswordLink() {
        return XPATH.container + XPATH.generatePasswordLink;
    }

    get showPasswordLink() {
        return XPATH.container + XPATH.showPasswordLink;
    }

    get cancelButton() {
        return XPATH.container + XPATH.cancelButton;
    }

    get cancelButtonTop() {
        return XPATH.container + lib.CANCEL_BUTTON_TOP;
    }

    get userPath() {
        return XPATH.container + XPATH.userPath;
    }

    get changePasswordButton() {
        return XPATH.container + XPATH.changePasswordButton;
    }

    isPasswordInputDisplayed() {
        return this.isElementDisplayed(this.passwordInput);
    }

    isShowLinkDisplayed() {
        return this.isElementDisplayed(this.showPasswordLink);
    }

    waitForLoaded() {
        return this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
    }

    waitForClosed() {
        return this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout).catch(error => {
            throw new Error('Change Password Dialog is not closed ' + error);
        });
    }

    async isHideLinkDisplayed() {
        let attr = await this.getAttribute(this.showPasswordLink, 'data-i18n');
        return attr.includes('Hide');
    }

    isGenerateLinkDisplayed() {
        return this.isElementDisplayed(this.generatePasswordLink);
    }

    clickOnChangePasswordButton() {
        return this.clickOnElement(XPATH.changePasswordButton).then(() => {
            return this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout);
        });
    }

    waitForChangePasswordButtonEnabled() {
        return this.waitForElementEnabled(this.changePasswordButton, appConst.mediumTimeout);
    }

    waitForChangePasswordButtonDisabled() {
        return this.waitForElementDisabled(this.changePasswordButton, appConst.mediumTimeout);
    }

    async clickOnShowPasswordLink() {
        await this.clickOnElement(this.showPasswordLink);
        return await this.pause(300);
    }

    clickOnCancelButton() {
        return this.clickOnElement(this.cancelButton);
    }

    clickOnCancelButtonTop() {
        return this.clickOnElement(this.cancelButtonTop);
    }

    getPasswordString() {
        return this.getTextInInput(this.passwordInput)
    }

    //Sets value in password-input
    typePassword(password) {
        return this.typeTextInInput(this.passwordInput, password);
    }

    async clickOnGeneratePasswordLink() {
        await this.clickOnElement(this.generatePasswordLink);
        return await this.pause(400);
    }

    getUserPath() {
        return this.getTextInElements(this.userPath);
    }

    waitForDialogLoaded() {
        return this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
    }

    async getPasswordStatus() {
        let status = await this.getAttribute(XPATH.container + XPATH.passwordGenerator, 'data-i18n');
        if (!status) {
            throw new Error("Password status was not found!");
        }
        return status;
    }
}

module.exports = ChangeUserPasswordDialog;





