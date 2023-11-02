/**
 * Created on 5/30/2017.
 */
const wizards = require('./wizard.panel');
const wpXpath = require('./wizard.panel').XPATH;
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const LoaderComboBox = require('../inputs/loaderComboBox');

const XPATH = {
    container: "//div[contains(@id,'UserWizardPanel')]",
    emailInput: "//input[@type = 'email']",
    groupOptionsFilterInput: "//div[contains(@id,'FormItem') and child::label[text()='Groups']]" + lib.COMBO_BOX_OPTION_FILTER_INPUT,
    roleOptionsFilterInput: "//div[contains(@id,'FormItem') and child::label[text()='Roles']]" + lib.COMBO_BOX_OPTION_FILTER_INPUT,
    rolesGroupLink: "//li[child::a[text()='Roles & Groups']]",
    passwordGenerator: "//div[contains(@id,'PasswordGenerator')]",
    showPasswordLink: "//a[@data-i18n='Show']",
    hidePasswordLink: "//a[@data-i18n='Hide']",
    generatePasswordLink: "//a[text()='Generate']",
    changePasswordButton: "//button[contains(@class,'change-password-button')]",
};

class UserWizard extends wizards.WizardPanel {

    get deleteButton() {
        return XPATH.container + wpXpath.deleteButton;
    }

    get emailInput() {
        return XPATH.container + XPATH.emailInput;
    }

    get passwordInput() {
        return XPATH.container + "//input[@type = 'text' and contains(@class,'password-input')]";
    }

    get groupOptionsFilterInput() {
        return XPATH.container + XPATH.groupOptionsFilterInput;
    }

    get roleOptionsFilterInput() {
        return XPATH.container + XPATH.roleOptionsFilterInput;
    }

    get rolesGroupsLink() {
        return XPATH.container + XPATH.rolesGroupLink;
    }

    get showPasswordLink() {
        return XPATH.container + XPATH.showPasswordLink;
    }

    get hidePasswordLink() {
        return XPATH.container + XPATH.hidePasswordLink;
    }

    get generateLink() {
        return XPATH.container + XPATH.generatePasswordLink;
    }

    get changePasswordButton() {
        return XPATH.container + XPATH.changePasswordButton;
    }

    isShowLinkDisplayed() {
        return this.isElementDisplayed(this.showPasswordLink);
    }

    isHidePasswordLinkDisplayed() {
        return this.isElementDisplayed(this.hidePasswordLink);
    }

    clickOnChangePasswordButton() {
        return this.clickOnElement(this.changePasswordButton);
    }

    isChangePasswordButtonDisplayed() {
        return this.isElementDisplayed(this.changePasswordButton);
    }

    waitForChangePasswordButtonDisplayed() {
        return this.waitForElementDisplayed(this.changePasswordButton, appConst.mediumTimeout);
    }

    isGenerateDisplayed() {
        return this.isElementDisplayed(this.generateLink);
    }

    clickOnGenerateLink() {
        return this.clickOnElement(this.generateLink);
    }

    async clickOnShowPasswordLink() {
        try {
            await this.waitForElementDisplayed(this.showPasswordLink, appConst.mediumTimeout);
            await this.clickOnElement(this.showPasswordLink);
        } catch (err) {
            throw new Error("Error after clicking on Show Pass link:  " + err);
        }
    }


    isEmailInputDisplayed() {
        return this.isElementDisplayed(this.emailInput);
    }

    isPasswordInputDisplayed() {
        return this.isElementDisplayed(this.passwordInput);
    }

    isGroupOptionsFilterInputDisplayed() {
        return this.isElementDisplayed(this.groupOptionsFilterInput);
    }

    isRoleOptionsFilterInputDisplayed() {
        return this.isElementDisplayed(this.roleOptionsFilterInput);
    }

    clickOnRolesAndGroupsLink() {
        return this.clickOnElement(this.rolesGroupsLink);
    }

    getUserName() {
        return this.getTextInInput(this.displayNameInput).catch(err => {
            throw new Error('error when get text from display name input ' + err);
        })
    }

    getPasswordValidationMessage() {
        let selector = XPATH.container + XPATH.passwordGenerator;
        return this.getAttribute(selector, 'data-i18n').catch(err => {
            throw new Error('error when get attribute in password-input ' + err);
        })
    }

    async clickOnDelete() {
        try {
            await this.waitForDeleteButtonEnabled();
            await this.clickOnElement(this.deleteButton);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_delete_btn');
            await this.saveScreenshot(screenshot);
            throw new Error("Error when clicking on Delete button, screenshot: " + screenshot + '  ' + err);
        }
    }

    async waitForDeleteButtonEnabled() {
        await this.waitForElementEnabled(this.deleteButton, appConst.mediumTimeout);
    }

    async clearPasswordInput() {
        await this.clearInputText(this.passwordInput);
        //insert a letter:
        await this.typeTextInInput(this.passwordInput, 'a');
        //press on BACKSPACE, remove the letter:
        return await this.getBrowser().keys('\uE003');
    }

    clearEmailInput() {
        return this.clearInputText(this.emailInput).then(() => {
            return this.typeTextInInput(this.emailInput, 'a');
        }).then(() => {
            return this.getBrowser().keys('\uE003');
        });
    }

    getTextInPasswordInput() {
        return this.getTextInInput(this.passwordInput).catch(err => {
            this.saveScreenshot("err_get_text_password");
            throw new Error('Error when getting text in password input ' + err);
        });
    }

    //clicks on Remove icon and removes the role
    async removeRole(roleDisplayName) {
        let removeIconLocator = XPATH.container + `${lib.selectedPrincipalByDisplayName(roleDisplayName)}` + lib.REMOVE_ICON;
        await this.clickOnElement(removeIconLocator);
        return await this.pause(300);
    }

    async waitForRemoveRoleIconNotDisplayed(roleDisplayName) {
        try {
            let removeIconLocator = XPATH.container + `${lib.selectedPrincipalByDisplayName(roleDisplayName)}` + lib.REMOVE_ICON;
            return await this.waitForElementNotDisplayed(removeIconLocator, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_remove_icon');
            await this.saveScreenshot(screenshot);
            throw new Error('Remove role icon should not be displayed, screenshot:' + screenshot + '  ' + err);
        }
    }

    addRoles(roleDisplayNames) {
        let result = Promise.resolve();
        roleDisplayNames.forEach(displayName => {
            result = result.then(() => this.filterOptionsAndAddRole(displayName));
        });
        return result;
    }

    async getSelectedRoles() {
        let selectedOptions = "//div[contains(@id,'FormItem') and child::label[text()='Roles']]" + lib.PRINCIPAL_SELECTED_OPTION +
                              lib.H6_DISPLAY_NAME;
        return this.getTextInElements(selectedOptions);
    }

    async filterOptionsAndAddRole(roleDisplayName) {
        try {
            let loaderComboBox = new LoaderComboBox();
            await this.typeTextInInput(XPATH.roleOptionsFilterInput, roleDisplayName);
            await loaderComboBox.waitForOptionVisible(XPATH.container, roleDisplayName);
            await loaderComboBox.clickOnOption(XPATH.container, roleDisplayName);
            await this.pause(500);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_role_selector');
            await this.saveScreenshot(screenshot);
            throw new Error('Error when selecting the role-option, screenshot: ' + screenshot + ' ' + err);
        }
    }

    async filterOptionsAndAddGroup(groupDisplayName) {
        let loaderComboBox = new LoaderComboBox();
        await this.typeTextInInput(XPATH.groupOptionsFilterInput, groupDisplayName);
        await loaderComboBox.waitForOptionVisible(XPATH.container, groupDisplayName);
        await loaderComboBox.clickOnOption(XPATH.container, groupDisplayName);
        return await this.pause(500);
    }

    typeEmail(email) {
        return this.typeTextInInput(this.emailInput, email);
    }

    typePassword(password) {
        return this.typeTextInInput(this.passwordInput, password);
    }

    async typeDataAndGeneratePassword(user) {
        await this.typeDisplayName(user.displayName);
        await this.typeEmail(user.email);
        await this.clickOnGenerateLink();
        await this.pause(500);
        if (user.roles != null) {
            await this.addRoles(user.roles);
        }
    }

    typeData(user) {
        return this.typeDisplayName(user.displayName).then(() => {
            return this.typeEmail(user.email);
        }).then(() => {
            return this.typePassword(user.password);
        }).then(() => {
            return this.pause(500);
        }).then(() => {
            if (user.roles != null) {
                return this.addRoles(user.roles);
            }
        })
    }

    waitForOpened() {
        return this.waitForElementDisplayed(this.displayNameInput, appConst.mediumTimeout).catch(err => {
            throw new Error('User Wizard is not loaded! ' + err);
        });
    }

    async getPasswordStatus() {
        let status = await this.getAttribute(XPATH.container + XPATH.passwordGenerator, 'data-i18n');
        if (!status) {
            throw new Error("Password status was not found!");
        }
        return status;
    }
}

module.exports = UserWizard;

