/**
 * Created on 24.10.2017.
 */

var page = require('../page');
var elements = require('../../libs/elements');
var appConst = require('../../libs/app_const');
var dialog = {
    container: `//div[contains(@id,'ChangeUserPasswordDialog')]`,
    passwordInput: "//input[contains(@id,'PasswordInput')]",
    changePasswordButton: `//button[contains(@id,'DialogButton') and child::span[text()='Change Password']]`,
    cancelButton: `//button[contains(@id,'DialogButton')]/span[text()='Cancel']`,
    showPasswordLink: `//a[contains(@class,'show-link')]`,
    generatePasswordLink: `//a[text()='Generate']`,
    userPath: `//h6[@class='user-path']`,
};
var changeUserPasswordDialog = Object.create(page, {

    passwordInput: {
        get: function () {
            return `${dialog.container}` + `${dialog.passwordInput}`;
        }
    },
    generatePasswordLink: {
        get: function () {
            return `${dialog.container}` + `${dialog.generatePasswordLink}`;
        }
    },
    showPasswordLink: {
        get: function () {
            return `${dialog.container}` + `${dialog.showPasswordLink}`;
        }
    },

    cancelButton: {
        get: function () {
            return `${dialog.container}` + `${dialog.cancelButton}`;
        }
    },

    cancelButtonTop: {
        get: function () {
            return `${dialog.container}` + `${elements.CANCEL_BUTTON_TOP}`;
        }
    },
    userPath: {
        get: function () {
            return `${dialog.container}` + `${dialog.userPath}`;
        }
    },

    isPasswordInputDisplayed: {
        value: function () {
            return this.isVisible(this.passwordInput);
        }
    },
    isShowLinkDisplayed: {
        value: function () {
            return this.isVisible(this.showPasswordLink);
        }
    },
    isHideLinkDisplayed: {
        value: function () {
            return this.getAttribute(this.showPasswordLink, 'data-i18n').then(result=> {
                return result.includes('Hide')
            });
        }
    },
    isGenerateLinkDisplayed: {
        value: function () {
            return this.isVisible(this.generatePasswordLink);
        }
    },

    clickOnChangePasswordButton: {
        value: function () {
            return this.doClick(this.changePasswordButton).then(()=> {
                return this.waitForNotVisible(`${dialog.container}`, appConst.TIMEOUT_3);
            });
        }
    },
    clickOnShowPasswordLink: {
        value: function () {
            return this.doClick(this.showPasswordLink).pause(300);
        }
    },
    clickOnGeneratePasswordLink: {
        value: function () {
            return this.doClick(this.generatePasswordLink).pause(300);
        }
    },
    getUserPath: {
        value: function () {
            return this.getTextFromElements(this.userPath);
        }
    },


    waitForDialogVisible: {
        value: function (ms) {
            return this.waitForVisible(`${dialog.container}`, ms);
        }
    },
    waitForDialogClosed: {
        value: function (ms) {
            return this.waitForVisible(`${dialog.container}`, ms);
        }
    },

    clickOnCancelButton: {
        value: function () {
            return this.doClick(this.cancelButton);
        }
    },
    clickOnCancelButtonTop: {
        value: function () {
            return this.doClick(this.cancelButtonTop);
        }
    },
    getPasswordString: {
        value: function () {
            return this.getTextFromInput(this.passwordInput)
        }
    },
    waitForClosed: {
        value: function () {
            return this.waitForNotVisible(`${dialog.container}`, appConst.TIMEOUT_3).catch(error=> {
                throw new Error('Change Pasword Dialog was not closed');
            });
        }
    },
});
module.exports = changeUserPasswordDialog;




