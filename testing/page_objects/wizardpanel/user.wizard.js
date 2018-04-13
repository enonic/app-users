/**
 * Created on 5/30/2017.
 */
const wizard = require('./wizard.panel');
const elements = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const loaderComboBox = require('../inputs/loaderComboBox');

var panel = {
    container: `//div[contains(@id,'UserWizardPanel')]`,
    emailInput: `//input[@type = 'email']`,
    groupOptionsFilterInput: "//div[contains(@id,'FormItem') and child::label[text()='Groups']]" + `${loaderComboBox.optionFilterInput}`,
    roleOptionsFilterInput: "//div[contains(@id,'FormItem') and child::label[text()='Roles']]" + `${loaderComboBox.optionFilterInput}`,
    rolesGroupLink: `//li[child::a[text()='Roles & Groups']]`,
    passwordGenerator: `//div[contains(@id,'PasswordGenerator')]`,
    showPasswordLink: `//a[@data-i18n='Show']`,
    hidePasswordLink: `//a[@data-i18n='Hide']`,
    generatePasswordLink: `//a[text()='Generate']`,
    changePasswordButton: `//button[contains(@class,'change-password-button')]`,
};

var userWizard = Object.create(wizard, {

    deleteButton: {
        get: function () {
            return `${panel.container}` + `${wizard.deleteButton}`;
        }
    },
    emailInput: {
        get: function () {
            return `${panel.container}` + `${panel.emailInput}`;
        }
    },
    passwordInput: {
        get: function () {
            return `${panel.container}//input[@type = 'password']`;
        }
    },
    groupOptionsFilterInput: {
        get: function () {
            return `${panel.container}` + `${panel.groupOptionsFilterInput}`;
        }
    },
    roleOptionsFilterInput: {
        get: function () {
            return `${panel.container}` + `${panel.roleOptionsFilterInput}`;
        }
    },
    rolesGroupsLink: {
        get: function () {
            return `${panel.container}` + `${panel.rolesGroupLink}`;
        }
    },
    showPasswordLink: {
        get: function () {
            return `${panel.container}` + `${panel.showPasswordLink}`;
        }
    },
    hidePasswordLink: {
        get: function () {
            return `${panel.container}` + `${panel.hidePasswordLink}`;
        }
    },
    generateLink: {
        get: function () {
            return `${panel.container}` + `${panel.generatePasswordLink}`;
        }
    },
    changePasswordButton: {
        get: function () {
            return `${panel.container}` + `${panel.changePasswordButton}`;
        }
    },
    clickOnChangePasswordButton: {
        value: function () {
            return this.doClick(this.changePasswordButton);
        }
    },
    isShowLinkDisplayed: {
        value: function () {
            return this.isVisible(this.showPasswordLink);
        }
    },
    isHidePasswordLinkDisplayed: {
        value: function () {
            return this.isVisible(this.hidePasswordLink);
        }
    },
    isChangePasswordButtonDisplayed: {
        value: function () {
            return this.isVisible(this.changePasswordButton);
        }
    },
    isGenerateDisplayed: {
        value: function () {
            return this.isVisible(this.generateLink);
        }
    },
    clickOnGenerateLink: {
        value: function () {
            return this.doClick(this.generateLink);
        }
    },
    clickOnShowLink: {
        value: function () {
            return this.doClick(this.showPasswordLink).pause(300).catch(err=> {
                throw new Error(err);
            })
        }
    },
    isEmailInputDisplayed: {
        value: function () {
            return this.isVisible(this.emailInput);
        }
    },
    isPasswordInputDisplayed: {
        value: function () {
            return this.isVisible(this.passwordInput);
        }
    },
    isGroupOptionsFilterInputDisplayed: {
        value: function () {
            return this.isVisible(this.groupOptionsFilterInput);
        }
    },

    isRoleOptionsFilterInputDisplayed: {
        value: function () {
            return this.clickOnRolesAndGroupsLink().pause(300).then(()=> {
                return this.isVisible(this.roleOptionsFilterInput);
            })
        }
    },
    clickOnRolesAndGroupsLink: {
        value: function () {
            return this.doClick(this.rolesGroupsLink);
        }
    },
    getUserName: {
        value: function () {
            return this.getText(this.displayNameInput).catch(err=> {
                throw new Error('error when get text from display name input ' + err);
            })
        }
    },
    getPasswordValidationMessage: {
        value: function () {
            let selector = `${panel.container}` + `${panel.passwordGenerator}`;
            return this.getAttribute(selector, 'data-i18n').catch(err=> {
                throw new Error('error when get attribute in password-input ' + err);
            })
        }
    },

    typeData: {
        value: function (user) {
            return this.typeDisplayName(user.displayName).then(()=> {
                return this.typeEmail(user.email);
            }).pause(500).then(()=> {
                return this.typePassword(user.password);
            }).pause(500).then(()=> {
                if (user.roles != null) {
                    return this.clickOnRolesAndGroupsLink();
                }
                return;
            }).pause(300).then(()=> {
                if (user.roles != null) {
                    return this.addRoles(user.roles);
                }
            })
        }
    },
    typeDataAndGeneratePassword: {
        value: function (user) {
            return this.typeDisplayName(user.displayName).then(()=> {
                return this.typeEmail(user.email);
            }).pause(500).then(()=> {
                return this.clickOnGenerateLink();
            }).pause(500).then(()=> {
                return this.clickOnShowLink();
            }).then(()=> {
                if (user.roles != null) {
                    return this.clickOnRolesAndGroupsLink();
                }
                return;
            }).pause(300).then(()=> {
                if (user.roles != null) {
                    return this.addRoles(user.roles);
                }
            })
        }
    },
    clearPasswordInput: {
        value: function () {
            return this.clearElement(this.passwordInput).pause(400).then(()=> {
                return this.typeTextInInput(this.passwordInput, 'a');
            }).then(()=> {
                return this.getBrowser().keys('\uE003');
            });
        }
    },
    getTextInPasswordInput: {
        value: function () {
            let selector = `${panel.container}//input[contains(@class, 'password-input')]`;
            return this.getTextFromInput(selector).catch(err=> {
                this.saveScreenshot('err_get_text_password');
                throw new Error('Error when getting text in password input ' + err);
            });
        }
    },
    clearEmailInput: {
        value: function () {
            return this.clearElement(this.emailInput).pause(400).then(()=> {
                return this.typeTextInInput(this.emailInput, 'a');
            }).then(()=> {
                return this.getBrowser().keys('\uE003');
            });
        }
    },

    waitForOpened: {
        value: function () {
            return this.waitForVisible(this.displayNameInput, 3000).catch((err)=> {
                throw new Error('User Wizard is not loaded! ' + err);
            });
        }
    },
    removeRole: {
        value: function (roleDisplayName) {
            let selector = `${panel.container}` + `${elements.selectedPrincipalByDisplayName(roleDisplayName)}` +
                           `${elements.REMOVE_ICON}`;
            return this.clickOnRolesAndGroupsLink().pause(1000).then(()=> {
                return this.doClick(selector).pause(500);
            })
        }
    },
    addRoles: {
        value: function (roleDisplayNames) {
            let result = Promise.resolve();
            roleDisplayNames.forEach((displayName)=> {
                result = result.then(() => this.filterOptionsAndAddRole(displayName));
            });
            return result;
        }
    },
    filterOptionsAndAddRole: {
        value: function (roleDisplayName) {
            return this.typeTextInInput(`${panel.roleOptionsFilterInput}`, roleDisplayName).then(()=> {
                return loaderComboBox.waitForOptionVisible(`${panel.container}`, roleDisplayName);
            }).then(()=> {
                return loaderComboBox.clickOnOption(`${panel.container}`, roleDisplayName);
            }).catch((err)=> {
                throw new Error('Error when selecting the role-option: ' + roleDisplayName + ' ' + err);
            })
        }
    },
    typeEmail: {
        value: function (email) {
            return this.typeTextInInput(this.emailInput, email);
        }
    },
    typePassword: {
        value: function (password) {
            return this.typeTextInInput(this.passwordInput, password);
        }
    },
    clickInPasswordInput: {
        value: function () {
            return this.doClick(this.passwordInput);
        }
    },
    clickInEmaildInput: {
        value: function () {
            return this.doClick(this.emailInput);
        }
    },
    clickOnDelete: {
        value: function () {
            return this.waitForDeleteButtonEnabled().then(()=> {
                return this.doClick(this.deleteButton);
            }).catch(err=> {
                return this.doCatch('err_delete_in_user_wizard', err);
            });
        }
    },
    waitForDeleteButtonEnabled: {
        value: function () {
            return this.waitForEnabled(this.deleteButton, appConst.TIMEOUT_3).catch(err=> {
                return this.doCatch('err_delete_user_button_disabled', err);
            });
        }
    },
});
module.exports = userWizard;

