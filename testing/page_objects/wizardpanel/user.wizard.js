/**
 * Created on 5/30/2017.
 */
const wizards = require('./wizard.panel');
const wpXpath = require('./wizard.panel').XPATH;
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const UsersPrincipalCombobox = require('../selectors/users.principal.combobox');
const ChangePasswordDialog = require('../../page_objects/wizardpanel/change.password.dialog');

const XPATH = {
    container: "//div[contains(@id,'UserWizardPanel')]",
    emailInput: "//input[@type = 'email']",
    groupsForm: "//div[contains(@id,'FormItem') and child::label[text()='Groups']]",
    rolesForm: "//div[contains(@id,'FormItem') and child::label[text()='Roles']]",
    publicKeyFormItem: "//div[contains(@id,'FormItem') and child::label[contains(.,'Public Keys')]]",
    rolesGroupLink: "//li[child::a[text()='Roles & Groups']]",
    passwordGenerator: "//div[contains(@id,'PasswordGenerator')]",
    generatePasswordLink: "//a[text()='Generate']",
    setPasswordButton: "//button[contains(@class,'password-button')]/span[text()='Set Password']",
    publicKeysGrid: "//div[contains(@id,'PublicKeysGrid')]",
    publicKeysGridRow: "//div[contains(@class,'public-keys-grid-row')]",
    removePublicKeyIcon: "//a[contains(@class,'remove-public-key icon-close')]",
    showKeyDetailsLinkByLabel:
        label => `//div[contains(@class,'public-keys-grid-row') and descendant::div[text()='${label}']]//a[contains(@class,'show-public-key')]`,
};

class UserWizard extends wizards.WizardPanel {

    get deleteButton() {
        return XPATH.container + wpXpath.deleteButton;
    }

    get emailInput() {
        return XPATH.container + XPATH.emailInput;
    }

    get groupOptionsFilterInput() {
        return XPATH.container + XPATH.groupsForm + lib.DROPDOWN_SELECTOR.OPTION_FILTER_INPUT;
    }

    get roleOptionsFilterInput() {
        return XPATH.container + XPATH.rolesForm + lib.DROPDOWN_SELECTOR.OPTION_FILTER_INPUT;
    }

    get rolesGroupsLink() {
        return XPATH.container + XPATH.rolesGroupLink;
    }

    get setPasswordButton() {
        return XPATH.container + XPATH.setPasswordButton;
    }

    get addPublicKeyButton() {
        return XPATH.container + XPATH.publicKeyFormItem + '//button';
    }

    async waitForAddPublicKeyButtonDisplayed() {
        return await this.waitForElementDisplayed(this.addPublicKeyButton, appConst.mediumTimeout);
    }

    async clickOnAddPublicKeyButton() {
        await this.waitForAddPublicKeyButtonDisplayed();
        await this.clickOnElement(this.addPublicKeyButton);
    }

    async getNumberOfKeyRows() {
        let locator = XPATH.container + "//div[contains(@class,'public-keys-grid-body')]" + XPATH.publicKeysGridRow;
        let result = await this.findElements(locator);
        return result.length;
    }

    async clickOnRemovePublicKeyIcon(index) {
        let locator = XPATH.container + XPATH.publicKeysGridRow + XPATH.removePublicKeyIcon;
        await this.waitForElementDisplayed(locator);
        let elements = await this.findElements(locator);
        return await elements[index].click();
    }

    async clickOnShowKeyDetailsLink(label) {
        let locator = XPATH.showKeyDetailsLinkByLabel(label);
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        await this.clickOnElement(locator);
    }

    async clickOnSetPasswordButton() {
        try {
            await this.waitForSetPasswordButtonDisplayed();
            await await this.clickOnElement(this.setPasswordButton);
            await this.pause(300);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_set_password_btn');
            throw new Error(`Error occurred after clicking on Set Password button, screenshot: ${screenshot} ` + err);
        }
    }

    isSetPasswordButtonDisplayed() {
        return this.isElementDisplayed(this.setPasswordButton);
    }

    waitForSetPasswordButtonDisplayed() {
        return this.waitForElementDisplayed(this.setPasswordButton, appConst.mediumTimeout);
    }

    isEmailInputDisplayed() {
        return this.isElementDisplayed(this.emailInput);
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

    async clickOnDelete() {
        try {
            await this.waitForDeleteButtonEnabled();
            await this.clickOnElement(this.deleteButton);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_delete_btn');
            throw new Error(`Error occurred after clicking on Delete button, screenshot:${screenshot} ` + err);
        }
    }

    async waitForDeleteButtonEnabled() {
        await this.waitForElementEnabled(this.deleteButton, appConst.mediumTimeout);
    }

    async clearEmailInput() {
        await this.clearInputText(this.emailInput);
        await this.typeTextInInput(this.emailInput, 'a');
        return await this.getBrowser().keys('\uE003');
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
            let screenshot = await this.saveScreenshotUniqueName('err_remove_icon');
            throw new Error(`Remove role icon should not be displayed, screenshot: ${screenshot} ` + err);
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
        let selectedOptions = XPATH.rolesForm + lib.PRINCIPAL_SELECTED_OPTION + lib.H6_DISPLAY_NAME;
        return await this.getTextInElements(selectedOptions);
    }

    async filterOptionsAndAddRole(roleDisplayName) {
        try {
            let usersPrincipalCombobox = new UsersPrincipalCombobox();
            await usersPrincipalCombobox.selectFilteredOptionAndClickOnApply(roleDisplayName, XPATH.container + XPATH.rolesForm);
            await this.pause(500);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_role_selector');
            throw new Error(`Error when selecting the role-option, screenshot:${screenshot} ` + err);
        }
    }

    async filterOptionsAndAddGroup(groupDisplayName) {
        let usersPrincipalCombobox = new UsersPrincipalCombobox();
        await usersPrincipalCombobox.selectFilteredOptionAndClickOnApply(groupDisplayName, XPATH.container + XPATH.groupsForm);
        return await this.pause(500);
    }

    async typeEmail(email) {
        try {
            return await this.typeTextInInput(this.emailInput, email);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_email_input');
            throw new Error(`Error during inserting the text in email input, screenshot:${screenshot} ` + err);
        }
    }

    async typeDataAndGeneratePassword(user) {
        let changePasswordDialog = new ChangePasswordDialog();
        await this.typeDisplayName(user.displayName);
        await this.typeEmail(user.email);
        await this.clickOnSetPasswordButton();
        await changePasswordDialog.clickOnGeneratePasswordLink();
        await changePasswordDialog.clickOnShowPasswordLink();
        let password = await changePasswordDialog.getPasswordText();
        await changePasswordDialog.clickOnSetPasswordButton();
        await changePasswordDialog.waitForClosed();
        await this.pause(500);
        if (user.roles != null) {
            await this.addRoles(user.roles);
        }
        return password;
    }

    async typeData(user) {
        let changePasswordDialog = new ChangePasswordDialog();
        await this.typeDisplayName(user.displayName);
        await this.typeEmail(user.email);
        if (user.password) {
            await this.clickOnSetPasswordButton();
            await changePasswordDialog.waitForDialogLoaded();
            await changePasswordDialog.typePassword(user.password);
            await changePasswordDialog.clickOnSetPasswordButton();
            await changePasswordDialog.waitForClosed();
        }
        await this.pause(500);
        if (user.roles != null) {
            await this.addRoles(user.roles);
        }
    }

    async waitForOpened() {
        try {
            return await this.waitForElementDisplayed(this.displayNameInput, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_user_wizard');
            throw new Error(`User Wizard is not loaded! screenshot: ${screenshot} ` + err);
        }
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

