/**
 * Created on 24.10.2017.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: "//div[contains(@id,'ChangeUserPasswordDialog')]",
    passwordInput: "//input[contains(@class,'password-input')]",
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
        return XPATH.container + lib.BUTTONS.dialogButton('Cancel');
    }

    get cancelButtonTop() {
        return XPATH.container + lib.CANCEL_BUTTON_TOP;
    }

    get userPath() {
        return XPATH.container + XPATH.userPath;
    }

    get changePasswordButton() {
        return XPATH.container + lib.BUTTONS.dialogButton('Change Password');
    }

    isPasswordInputDisplayed() {
        return this.isElementDisplayed(this.passwordInput);
    }

    isShowLinkDisplayed() {
        return this.isElementDisplayed(this.showPasswordLink);
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

    async clickOnChangePasswordButton() {
        await this.waitForChangePasswordButtonEnabled();
        await this.clickOnElement(XPATH.changePasswordButton);
        return this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout);
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

    async waitForDialogLoaded() {
        try {
            return await this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_pwd_dlg_load');
            throw new Error("Change Password dialog was not loaded! screenshot:" + screenshot + '  ' + err);
        }
    }

    async getPasswordStatus() {
        try {
            let status = await this.getAttribute(XPATH.container + XPATH.passwordGenerator, 'data-i18n');
            return status;
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_pswd_dlg');
            throw new Error("Password status was not found! screenshot:" + screenshot + '  ' + err);
        }
    }
}

module.exports = ChangeUserPasswordDialog;





