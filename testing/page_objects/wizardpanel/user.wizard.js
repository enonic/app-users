/**
 * Created on 5/30/2017.
 */
const wizards = require('./wizard.panel');
const wpXpath = require('./wizard.panel').XPATH;
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const UsersPrincipalCombobox = require('../selectors/users.principal.combobox');

const XPATH = {
    container: "//div[contains(@id,'UserWizardPanel')]",
    emailInput: "//input[@type = 'email']",
    groupsForm: "//div[contains(@id,'FormItem') and descendant::span[text()='Groups']]",
    rolesForm: "//div[contains(@id,'FormItem') and descendant::span[text()='Roles']]",
    publicKeyFormItem: "//div[contains(@id,'FormItem') and descendant::span[contains(.,'Public Keys')]]",
    rolesGroupLink: "//li[child::a[text()='Roles & Groups']]",
    passwordGenerator: "//div[contains(@id,'PasswordGenerator')]",
    showPasswordLink: "//a[@data-i18n='Show']",
    hidePasswordLink: "//a[@data-i18n='Hide']",
    generatePasswordLink: "//a[text()='Generate']",
    setPasswordButton: "//button[contains(@class,'password-button')]/span[text()='Set Password']",
    passwordSectionRemoveIcon: "//fieldset[descendant::div[contains(@id,'PasswordSection')]]//a[contains(@class,'remove')]",
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

    get passwordInput() {
        return XPATH.container + "//input[@type = 'text' and contains(@class,'password-input')]";
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

    get clearPasswordButton() {
        return XPATH.container + "//button[contains(.,'Clear Password')]";
    }

    get addPublicKeyButton() {
        return XPATH.container + XPATH.publicKeyFormItem + '//button';
    }

    get hidePasswordLink() {
        return XPATH.container + XPATH.hidePasswordLink;
    }

    get generateLink() {
        return XPATH.container + XPATH.generatePasswordLink;
    }

    get showPasswordLink() {
        return XPATH.container + XPATH.showPasswordLink;
    }

    get changePasswordButton() {
        return XPATH.container + "//button[contains(@class,'change-password-button') and child::span[contains(.,'Change Password')]]";
    }

    async clickOnChangePasswordButton() {
        try {
            await this.waitForChangePasswordButtonDisplayed();
            return await this.clickOnElement(this.changePasswordButton);
        } catch (err) {
            await this.handleError(`User Wizard, 'Change Password' button`, 'err_change_password_btn', err);
        }
    }

    async waitForChangePasswordButtonDisplayed() {
        return await this.waitForElementDisplayed(this.changePasswordButton, appConst.mediumTimeout);
    }

    async waitForChangePasswordButtonNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.changePasswordButton, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`User Wizard, 'Change Password' button should not be displayed`, 'err_change_password', err);
        }
    }

    async clickOnGenerateLink() {
        return await this.clickOnElement(this.generateLink);
    }

    waitForHidePasswordLinkDisplayed() {
        return this.waitForElementDisplayed(this.hidePasswordLink, appConst.mediumTimeout);
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
            await this.clickOnElement(this.setPasswordButton);
        } catch (err) {
            await this.handleError(`User Wizard, 'Set Password' button`, 'err_set_password_btn', err);
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
            await this.handleError('User Wizard - clicked on Delete button', 'err_click_delete_user_wizard', err);
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
            await this.handleError(`Remove role icon should not be displayed  for ${roleDisplayName}`, 'err_remove_role_icon_not_displayed', err);
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
            await this.handleError('User Wizard - tried to add the role:', 'err_user_wizard_role_selector', err);
        }
    }

    async filterOptionsAndAddGroup(groupDisplayName) {
        let usersPrincipalCombobox = new UsersPrincipalCombobox();
        await usersPrincipalCombobox.selectFilteredOptionAndClickOnApply(groupDisplayName, XPATH.container + XPATH.groupsForm);
        return await this.pause(300);
    }

    async typeEmail(email) {
        try {
            return await this.typeTextInInput(this.emailInput, email);
        } catch (err) {
            await this.handleError('User Wizard - tried insert the email', 'err_type_email_input', err);
        }
    }

    async typeDataAndGeneratePassword(user) {
        await this.typeDisplayName(user.displayName);
        await this.typeEmail(user.email);
        await this.clickOnSetPasswordButton();
        await this.clickOnGeneratePasswordLink();
        await this.clickOnShowPasswordLink();
        let password = await this.getTextInPasswordInput();
        await this.pause(200);
        if (user.roles != null) {
            await this.addRoles(user.roles);
        }
        return password;
    }

    async typeData(user) {
        await this.typeDisplayName(user.displayName);
        await this.typeEmail(user.email);
        if (user.password) {
            await this.clickOnSetPasswordButton();
            await this.typePassword(user.password);
        }
        await this.pause(200);
        if (user.roles != null) {
            await this.addRoles(user.roles);
        }
    }

    async waitForOpened() {
        try {
            return await this.waitForElementDisplayed(this.displayNameInput, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('User Wizard - should be loaded', 'err_user_wizard_opened', err);
        }
    }

    async getPasswordStatus() {
        let status = await this.getAttribute(XPATH.container + XPATH.passwordGenerator, 'data-i18n');
        if (!status) {
            throw new Error("Password status was not found!");
        }
        return status;
    }

    async clearPasswordInput() {
        await this.clearInputText(this.passwordInput);
        // insert a letter:
        await this.typeTextInInput(this.passwordInput, 'a');
        // press on BACKSPACE, remove the letter:
        return await this.getBrowser().keys('\uE003');
    }

    async getTextInPasswordInput() {
        try {
            return await this.getTextInInput(this.passwordInput);
        } catch (err) {
            await this.handleError('User Wizard - tried to get text in password input', 'err_get_text_password_input', err);
        }
    }

    async waitForPasswordInputDisplayed() {
        return await this.waitForElementDisplayed(this.passwordInput, appConst.mediumTimeout);

    }

    async waitForPasswordInputNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.passwordInput, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Password input should not be displayed', 'err_password_input_not_displayed', err);
        }
    }

    async typePassword(password) {
        await this.waitForPasswordInputDisplayed();
        return await this.typeTextInInput(this.passwordInput, password);
    }

    async clickOnShowPasswordLink() {
        try {
            await this.waitForElementDisplayed(this.showPasswordLink, appConst.mediumTimeout);
            await this.clickOnElement(this.showPasswordLink);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_show_password');
            throw new Error("Error after clicking on Show Pass link, screenshot: " + screenshot + '  ' + err);
        }
    }

    async waitForGenerateLinkDisplayed() {
        return await this.waitForElementDisplayed(this.generateLink, appConst.mediumTimeout);
    }

    // Clicks on Generate password link(button)
    async clickOnGeneratePasswordLink() {
        await this.waitForGenerateLinkDisplayed();
        return await this.clickOnElement(this.generateLink);
    }

    async waitForShowPasswordLinkDisplayed() {
        return await this.waitForElementDisplayed(this.showPasswordLink, appConst.mediumTimeout);
    }

    async waitForAddPublicKeyButtonNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.addPublicKeyButton, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Add public key button should not be displayed', 'err_add_public_key_btn_not_displayed', err);
        }
    }

    async waitForClearPasswordButtonDisplayed() {
        return await this.waitForElementDisplayed(this.clearPasswordButton, appConst.mediumTimeout);
    }

    async waitForClearPasswordButtonNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.clearPasswordButton, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Clear password button should not be displayed', 'err_clear_password_btn_not_displayed', err);
        }
    }

    async clickOnClearPasswordButton() {
        await this.waitForClearPasswordButtonDisplayed();
        return await this.clickOnElement(this.clearPasswordButton);
    }

    async clickOnRemovePasswordSection() {
        try {
            await this.waitForElementDisplayed(XPATH.container + XPATH.passwordSectionRemoveIcon);
            return await this.clickOnElement(XPATH.container + XPATH.passwordSectionRemoveIcon);
        } catch (err) {
            await this.handleError('User Wizard - tried to click on remove password section icon', 'err_click_remove_password_section', err);
        }
    }
}

module.exports = UserWizard;

