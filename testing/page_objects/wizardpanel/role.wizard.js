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
            await this.handleError('Role wizard was not loaded', 'err_role_wizard_not_loaded', e);
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
            await this.handleError('Role Wizard, tried to click on Delete button', 'err_click_delete_in_role_wizard', err);
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
            await this.handleError('Role Wizard - tried to get members', 'err_get_role_members', err);
        }
    }

    async removeMember(displayName) {
        try {
            let selector = xpath.container + lib.selectedPrincipalByDisplayName(displayName) + lib.REMOVE_ICON;
            await this.clickOnElement(selector);
            return await this.pause(300);
        } catch (err) {
            await this.handleError('Role Wizard Remove member button', 'err_remove_member', err)
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
            await this.handleError('Role Wizard - tried to add member', 'err_role_wizard_add_member', err);
        }
    }
}

module.exports = RoleWizard;
