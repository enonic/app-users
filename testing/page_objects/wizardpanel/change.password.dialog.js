/**
 * Created on 24.10.2017.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: "//div[contains(@id,'ChangeUserPasswordDialog')]",
    passwordInput: "//input[contains(@class,'password-input')]",
    showPasswordLink: "//a[contains(@class,'show-link') and @data-i18n='Show']",
    hidePasswordLink: "//a[contains(@class,'show-link') and @data-i18n='Hide']",
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

    get hidePasswordLink() {
        return XPATH.container + XPATH.hidePasswordLink;
    }

    get cancelButton() {
        return XPATH.container + lib.BUTTONS.dialogButton('Cancel');
    }

    get cancelButtonTop() {
        return XPATH.container + lib.BUTTONS.CANCEL_BUTTON_TOP;
    }

    get userPath() {
        return XPATH.container + XPATH.userPath;
    }

    get changePasswordButton() {
        return XPATH.container + lib.BUTTONS.dialogButton('Change Password');
    }

    get setPasswordButton() {
        return XPATH.container + lib.BUTTONS.dialogButton('Set Password');
    }

    isPasswordInputDisplayed() {
        return this.isElementDisplayed(this.passwordInput);
    }

    async waitForShowPasswordLinkDisplayed() {
        return await this.isElementDisplayed(this.showPasswordLink);
    }

    async waitForClosed() {
        try {
            await this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout);
            await this.pause(300);
        } catch (error) {
            let screenshot = await this.saveScreenshotUniqueName('err_ch_password_dlg');
            throw new Error(`Change Password Dialog is not closed, screenshot ${screenshot} ` + error);
        }
    }

    async waitForHideLinkDisplayed() {
        try {
            return await this.waitForElementDisplayed(this.hidePasswordLink, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_hide_link');
            throw new Error(`Hide link is not displayed! screenshot: ${screenshot} ` + err);
        }

    }

    async waitForGenerateLinkDisplayed() {
        return await this.waitForElementDisplayed(this.generatePasswordLink, appConst.mediumTimeout);
    }

    async clickOnChangePasswordButton() {
        await this.waitForChangePasswordButtonEnabled();
        await this.clickOnElement(this.changePasswordButton);
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

    async waitForHidePasswordLinkDisplayed() {
        try {
            return await this.waitForElementDisplayed(this.hidePasswordLink, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_hide_pswd_link');
            throw new Error(`Hide password link is not displayed! screenshot: ${screenshot} ` + err);
        }
    }

    clickOnCancelButton() {
        return this.clickOnElement(this.cancelButton);
    }

    clickOnCancelButtonTop() {
        return this.clickOnElement(this.cancelButtonTop);
    }

    getPasswordText() {
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

    async getUserPath() {
        try {
            await this.waitForElementDisplayed(this.userPath, appConst.mediumTimeout);
            return await this.getTextInElements(this.userPath);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_ch_pass_user_path');
            throw new Error(`Change Password dialog: User path was not found! screenshot: ${screenshot} ` + err);
        }
    }

    async waitForDialogLoaded() {
        try {
            await this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
            await this.pause(300);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_pwd_dlg_load');
            throw new Error(`Change Password dialog was not loaded! screenshot: ${screenshot}` + err);
        }
    }

    async getPasswordStatus() {
        try {
            let status = await this.getAttribute(XPATH.container + XPATH.passwordGenerator, 'data-i18n');
            return status;
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_pswd_dlg');
            throw new Error(`Password status was not found! screenshot: ${screenshot} ` + err);
        }
    }

    waitForSetPasswordButtonDisplayed() {
        return this.waitForElementDisplayed(this.setPasswordButton, appConst.mediumTimeout);
    }

    async clickOnSetPasswordButton() {
        await this.waitForSetPasswordButtonEnabled();
        await this.clickOnElement(this.setPasswordButton);
        return await this.waitForClosed();
    }

    async waitForSetPasswordButtonEnabled() {
        try {
            return await this.waitForElementEnabled(this.setPasswordButton, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_set_pswd_btn');
            throw new Error(`Set Password button is not enabled! screenshot: ${screenshot} ` + err);
        }
    }

    async waitForSetPasswordButtonDisabled() {
        try {
            return await this.waitForElementDisabled(this.setPasswordButton, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_set_pswd_btn_disabled');
            throw new Error(`Set Password button is not disabled! screenshot: ${screenshot} ` + err);
        }
    }

    async clearPasswordInput() {
        await this.clearInputText(this.passwordInput);
        //insert a letter:
        await this.typeTextInInput(this.passwordInput, 'a');
        //press on BACKSPACE, remove the letter:
        return await this.getBrowser().keys('\uE003');
    }
}

module.exports = ChangeUserPasswordDialog;





