/**
 * Created on 12.09.2017.
 */
var wizard = require('./wizard.panel');
var elements = require('../../libs/elements');
var appConst = require('../../libs/app_const');
const loaderComboBox = require('../inputs/loaderComboBox');

var panel = {
    container: `//div[contains(@id,'RoleWizardPanel')]`,
    memberOptionsFilterInput: "//div[contains(@id,'FormItem') and child::label[text()='Members']]" + `${loaderComboBox.optionFilterInput}`,
};
var roleWizard = Object.create(wizard, {

    descriptionInput: {
        get: function () {
            return `${panel.container}//div[contains(@id,'PrincipalDescriptionWizardStepForm')]` + `${elements.TEXT_INPUT}`;
        }
    },
    deleteButton: {
        get: function () {
            return `${panel.container}` + `${wizard.deleteButton}`;
        }
    },
    typeData: {
        value: function (data) {
            return this.typeTextInInput(this.displayNameInput, data.displayName).then(() => {
                return this.typeTextInInput(this.descriptionInput, data.description)
            });
        }
    },
    filterOptionsAndAddMember: {
        value: function (displayName) {
            return this.typeTextInInput(`${panel.memberOptionsFilterInput}`, displayName).then(() => {
                return loaderComboBox.waitForOptionVisible(`${panel.container}`, displayName);
            }).then(() => {
                return loaderComboBox.clickOnOption(`${panel.container}`, displayName);
            }).catch((err) => {
                throw new Error('Error selecting option ' + displayName + ' ' + err);
            })
        }
    },
    waitForOpened: {
        value: function () {
            return this.waitForVisible(`${panel.container}` + this.displayNameInput, appConst.TIMEOUT_3).catch((e) => {
                throw new Error("Role wizard was not loaded! " + e);
            });
        }
    },

    typeDescription: {
        value: function (description) {
            return this.typeTextInInput(this.descriptionInput, description);
        }
    },
    getDescription: {
        value: function () {
            return this.getTextFromInput(this.descriptionInput);
        }
    },
    getMembers: {
        value: function () {
            let selectedOptions = `${panel.container}` + `${elements.PRINCIPAL_SELECTED_OPTION}` + `${elements.H6_DISPLAY_NAME}`
            return this.getTextFromElements(selectedOptions).catch((err) => {
                throw new Error('Error when getting text from elements ')
            });
        }
    },
    clickOnMembersLink: {
        value: function () {
            return this.doClick(this.membersLink);
        }
    },
    removeMember: {
        value: function (displayName) {
            let selector = `${panel.container}` + `${elements.selectedPrincipalByDisplayName(displayName)}` + `${elements.REMOVE_ICON}`;
            return this.doClick(selector).catch((err) => {
                this.saveScreenshot('err_remove_member');
                throw new Error('Remove-icon for the role ' + displayName + ' ' + 'was not found on the  wizard page');
            }).pause(500);
        }
    },
    clickOnDelete: {
        value: function () {
            return this.waitForDeleteButtonEnabled().then(() => {
                return this.doClick(this.deleteButton);
            }).catch(err => {
                return this.doCatch('err_delete_in_role_wizard', err);
            });
        }
    },
    waitForDeleteButtonEnabled: {
        value: function () {
            return this.waitForEnabled(this.deleteButton, appConst.TIMEOUT_3).catch(err => {
                return this.doCatch('err_delete_role_button_disabled', err);
            });
        }
    },
});
module.exports = roleWizard;

