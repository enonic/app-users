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
        } catch (err) {
            await this.handleError('Change Password Dialog should be closed', 'err_ch_password_dlg_close', err);
        }
    }

    async waitForHideLinkDisplayed() {
        try {
            return await this.waitForElementDisplayed(this.hidePasswordLink, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Change Password Dialog - Hide link should be displayed', 'err_ch_password_hide_link', err);
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
        await this.waitForElementDisplayed(this.showPasswordLink, appConst.mediumTimeout);
        await this.clickOnElement(this.showPasswordLink);
    }

    async waitForHidePasswordLinkDisplayed() {
        try {
            return await this.waitForElementDisplayed(this.hidePasswordLink, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Change Password Dialog - Hide password link', 'err_hide_pswd_link', err);
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
            await this.handleError('Change Password dialog - get user path','err_get_user_path',err);
        }
    }

    async waitForDialogLoaded() {
        try {
            await this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Change Password dialog should be loaded','err_ch_pwd_dlg_load',err);
        }
    }

    async getPasswordStatus() {
        try {
            let status = await this.getAttribute(XPATH.container + XPATH.passwordGenerator, 'data-i18n');
            return status;
        } catch (err) {
            await this.handleError('Change Password dialog - get password status','err_get_pswd_status',err);
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
            await this.handleError('Change Password dialog - Set Password button should be enabled','err_wait_set_pswd_btn_enabled',err);
        }
    }

    async waitForSetPasswordButtonDisabled() {
        try {
            return await this.waitForElementDisabled(this.setPasswordButton, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Change Password dialog - Set Password button should be disabled','err_wait_set_pswd_btn_disabled',err);
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





