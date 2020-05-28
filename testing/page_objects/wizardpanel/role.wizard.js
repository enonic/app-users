/**
 * Created on 12.09.2017.
 */
const WizardPanel = require('./wizard.panel').WizardPanel;
const baseXpath = require('./wizard.panel').XPATH;
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const LoaderComboBox = require('../inputs/loaderComboBox');

const xpath = {
    container: `//div[contains(@id,'RoleWizardPanel')]`,
    memberOptionsFilterInput: "//div[contains(@id,'FormItem') and child::label[text()='Members']]" + lib.COMBO_BOX_OPTION_FILTER_INPUT,
};

class RoleWizard extends WizardPanel {

    get descriptionInput() {
        return xpath.container + `//div[contains(@id,'PrincipalDescriptionWizardStepForm')]` + lib.TEXT_INPUT;
    }

    get deleteButton() {
        return xpath.container + baseXpath.deleteButton;
    }

    waitForLoaded() {
        return this.waitForElementDisplayed(xpath.container + this.displayNameInput, appConst.TIMEOUT_3).catch(e => {
            throw new Error("Role wizard was not loaded! " + e);
        });
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

    clickOnDelete() {
        return this.clickOnElement(this.deleteButton).catch(err => {
            this.saveScreenshot('err_delete_button_in_role_wizard', err);
            throw new Error("Role wizard - " + err);
        });
    }

    waitForDeleteButtonEnabled() {
        return this.waitForElementEnabled(this.deleteButton, appConst.TIMEOUT_3).catch(err => {
            this.saveScreenshot('err_delete_role_button_disabled');
            throw new Error("Role wizard, Delete button " + err);
        });
    }

    getMembers() {
        let selectedOptions = xpath.container + lib.PRINCIPAL_SELECTED_OPTION + lib.H6_DISPLAY_NAME;
        return this.getTextInElements(selectedOptions).catch(err => {
            throw new Error('Error when getting text from elements ')
        });
    }

    removeMember(displayName) {
        let selector = xpath.container + lib.selectedPrincipalByDisplayName(displayName) + lib.REMOVE_ICON;
        return this.clickOnElement(selector).catch(err => {
            this.saveScreenshot('err_remove_member');
            throw new Error('Remove-icon for the role ' + displayName + ' ' + 'was not found on the  wizard page');
        }).then(() => {
            return this.pause(500);
        });
    }

    filterOptionsAndAddMember(displayName) {
        let loaderComboBox = new LoaderComboBox();
        return this.typeTextInInput(xpath.container + xpath.memberOptionsFilterInput, displayName).then(() => {
            return loaderComboBox.waitForOptionVisible(xpath.container, displayName);
        }).then(() => {
            return loaderComboBox.clickOnOption(xpath.container, displayName);
        }).catch(err => {
            throw new Error('Error selecting option ' + displayName + ' ' + err);
        })
    }
}

module.exports = RoleWizard;

