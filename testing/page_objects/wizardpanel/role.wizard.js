/**
 * Created on 12.09.2017.
 */
const WizardPanel = require('./wizard.panel').WizardPanel;
const baseXpath = require('./wizard.panel').XPATH;
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const MembersPrincipalCombobox = require('../selectors/members.principal.combobox');

const xpath = {
    container: `//div[contains(@id,'RoleWizardPanel')]`,
};

class RoleWizard extends WizardPanel {

    get descriptionInput() {
        return xpath.container + `//div[contains(@id,'PrincipalDescriptionWizardStepForm')]` + lib.TEXT_INPUT;
    }

    get deleteButton() {
        return xpath.container + baseXpath.deleteButton;
    }

    getDisplayName() {
        return this.getTextInInput(this.displayNameInput);
    }

    async waitForLoaded() {
        try {
            await this.waitForElementDisplayed(xpath.container + this.displayNameInput, appConst.mediumTimeout);
        } catch (e) {
            let screenshot = await this.saveScreenshotUniqueName('err_role_wizard');
            throw new Error(`Role wizard was not loaded! Screenshot:${screenshot} ` + e);
        }
    }

    getDescription() {
        return this.getTextInInput(this.descriptionInput);
    }

    typeDescription(description) {
        return this.typeTextInInput(this.descriptionInput, description);
    }

    async typeData(data) {
        await this.typeTextInInput(this.displayNameInput, data.displayName);
        return await this.typeTextInInput(this.descriptionInput, data.description);
    }

    async clickOnDelete() {
        try {
            await this.waitForDeleteButtonEnabled();
            return await this.clickOnElement(this.deleteButton);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_delete_button_in_role_wizard');
            throw new Error(`Role wizard - delete button, screenshot: ${screenshot}` + err);
        }
    }

    waitForDeleteButtonEnabled() {
        return this.waitForElementEnabled(this.deleteButton, appConst.mediumTimeout).catch(err => {
            this.saveScreenshot('err_delete_role_button_disabled');
            throw new Error("Role wizard, Delete button " + err);
        });
    }

    async getMembers() {
        try {
            let selectedOptions = xpath.container + lib.PRINCIPAL_SELECTED_OPTION + lib.H6_DISPLAY_NAME;
            return await this.getTextInElements(selectedOptions);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_role_members');
            throw new Error(`Error when getting text from elements, screenshot:${screenshot} ` + err);
        }
    }

    async removeMember(displayName) {
        try {
            let selector = xpath.container + lib.selectedPrincipalByDisplayName(displayName) + lib.REMOVE_ICON;
            await this.clickOnElement(selector);
            return await this.pause(300);
        } catch (err) {
            await this.handleError('Role Wizard Remove member button','err_remove_member',err)
        }
    }

    async waitForRemoveMemberIconDisplayed(roleDisplayName) {
        try {
            let locator = xpath.container + lib.selectedPrincipalByDisplayName(roleDisplayName) + lib.REMOVE_ICON;
            return await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_remove_member');
            throw new Error(`Error - remove-icon should be displayed for the role, screenshot:${screenshot} ` + err);
        }
    }

    async waitForRemoveMemberIconNotDisplayed(roleDisplayName) {
        try {
            let locator = xpath.container + lib.selectedPrincipalByDisplayName(roleDisplayName) + lib.REMOVE_ICON;
            return await this.waitForElementNotDisplayed(locator, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_remove_icon');
            throw new Error(`Error - remove-icon should not be displayed for the role, screenshot: ${screenshot} ` + err);
        }
    }

    async filterOptionsAndAddMember(displayName) {
        try {
            let membersPrincipalCombobox = new MembersPrincipalCombobox();
            await membersPrincipalCombobox.selectFilteredOptionAndClickOnApply(displayName, xpath.container);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_role_member');
            throw new Error(`Error occurred in Role wizard screenshot: ${screenshot} ` + err);
        }
    }
}

module.exports = RoleWizard;
