/**
 * Created on 09.10.2017.
 */
const WizardPanel = require('./wizard.panel').WizardPanel;
const wpXpath = require('./wizard.panel').XPATH;
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const LoaderComboBox = require('../inputs/loaderComboBox');

const XPATH = {
    container: `//div[contains(@id,'GroupWizardPanel')]`,
    memberOptionsFilterInput: "//div[contains(@id,'FormItem') and child::label[text()='Members']]",
    roleOptionsFilterInput: "//div[contains(@id,'FormItem') and child::label[text()='Roles']]",
    rolesLink: `//li[child::a[text()='Roles']]`,
    membersLink: `//li[child::a[text()='Members']]`,
    membersStepForm: `//div[contains(@id,'GroupMembersWizardStepForm')]`,
    rolesStepForm: `//div[contains(@id,'MembershipsWizardStepForm')]`
};

class GroupWizard extends WizardPanel {

    get deleteButton() {
        return XPATH.container + wpXpath.deleteButton;
    }

    get descriptionInput() {
        return XPATH.container + "//div[contains(@id,'PrincipalDescriptionWizardStepForm')]" + lib.TEXT_INPUT;
    }

    get memberOptionsFilterInput() {
        return XPATH.container + XPATH.memberOptionsFilterInput + lib.COMBO_BOX_OPTION_FILTER_INPUT;
    }

    get roleOptionsFilterInput() {
        return XPATH.container + XPATH.roleOptionsFilterInput + lib.COMBO_BOX_OPTION_FILTER_INPUT;
    }

    get rolesStepLink() {
        return XPATH.container + XPATH.rolesLink;
    }

    get membersStepLink() {
        return XPATH.container + XPATH.membersLink;
    }

    clickOnRolesStep() {
        return this.clickOnElement(this.rolesStepLink);
    }

    clickOnMembersStep() {
        return this.clickOnElement(this.membersStepLink);
    }

    waitForOpened() {
        return this.waitForElementDisplayed(this.memberOptionsFilterInput, appConst.TIMEOUT_3).catch(e => {
            throw new Error("Group wizard was not loaded! " + e);
        });
    }

    typeDescription(description) {
        return this.typeTextInInput(this.descriptionInput, description);
    }

    getDescription() {
        return this.getTextInInput(this.descriptionInput);
    }

    isMemberOptionFilterInputDisplayed() {
        return this.isElementDisplayed(this.memberOptionsFilterInput);
    }

    isRoleOptionFilterInputDisplayed() {
        return this.isElementDisplayed(this.roleOptionsFilterInput);
    }

    isDescriptionInputDisplayed() {
        return this.isElementDisplayed(this.descriptionInput);
    }

    typeData(group) {
        return this.typeTextInInput(this.displayNameInput, group.displayName).then(() => {
            return this.typeTextInInput(this.descriptionInput, group.description)
        }).then(() => {
            if (group.roles != null) {
                return this.addRoles(group.roles);
            }
        }).then(() => {
            if (group.members != null) {
                return this.addMembers(group.members);
            }
        });
    }

    addRoles(roleDisplayNames) {
        let result = Promise.resolve();
        roleDisplayNames.forEach(displayName => {
            result = result.then(() => this.filterOptionsAndAddRole(displayName));
        });
        return result;
    }

    filterOptionsAndAddRole(displayName) {
        let loaderComboBox = new LoaderComboBox();
        return this.typeTextInInput(this.roleOptionsFilterInput, displayName).then(() => {
            return loaderComboBox.waitForOptionVisible(XPATH.container, displayName);
        }).then(() => {
            return loaderComboBox.clickOnOption(XPATH.container, displayName);
        }).then(() => {
            return this.pause(300);
        }).catch(err => {
            this.saveScreenshot("err_group_wizard_role_selector");
            throw new Error('Error selecting the role-option ' + displayName + ' ' + err);
        })
    }

    addMembers(memberDisplayNames) {
        let result = Promise.resolve();
        memberDisplayNames.forEach(displayName => {
            result = result.then(() => this.filterOptionsAndAddMember(displayName));
        });
        return result;
    }

    filterOptionsAndAddMember(displayName) {
        let loaderComboBox = new LoaderComboBox();
        return this.typeTextInInput(this.memberOptionsFilterInput, displayName).then(() => {
            return loaderComboBox.waitForOptionVisible(XPATH.container, displayName);
        }).then(() => {
            return loaderComboBox.clickOnOption(XPATH.container, displayName);
        }).then(() => {
            return this.pause(400);
        }).catch(err => {
            throw new Error('Error selecting the member-option ' + displayName + ' ' + err);
        });
    }

    async clickOnDelete() {
        await this.waitForDeleteButtonEnabled();
        return await this.clickOnElement(this.deleteButton);
    }

    getMembers() {
        let selectedOptions = XPATH.container + XPATH.membersStepForm + lib.PRINCIPAL_SELECTED_OPTION + lib.H6_DISPLAY_NAME;
        return this.getTextInElements(selectedOptions);
    }

    getRoles() {
        let selectedOptions = XPATH.container + XPATH.rolesStepForm + lib.PRINCIPAL_SELECTED_OPTION + lib.H6_DISPLAY_NAME;
        return this.getTextInElements(selectedOptions);
    }

    async removeMember(displayName) {
        let selector = XPATH.container + XPATH.membersStepForm + lib.selectedPrincipalByDisplayName(displayName) + lib.REMOVE_ICON;
        await this.clickOnElement(selector);
        return await this.pause(300);
    }

    removeRole(displayName) {
        let removeRoleIcon = XPATH.container + XPATH.rolesStepForm + lib.selectedPrincipalByDisplayName(displayName) + lib.REMOVE_ICON;
        return this.clickOnElement(removeRoleIcon).then(() => {
            return this.pause(1000);
        }).catch(err => {
            this.saveScreenshot('err_group_wizard_remove_role_icon', err);
            throw new Error("Group Wizard - " + err);
        })
    }

    waitForDeleteButtonEnabled() {
        return this.waitForElementEnabled(this.deleteButton, appConst.TIMEOUT_3).catch(err => {
            this.saveScreenshot('err_delete_group_button_disabled', err);
            throw new Error("Delete button should be enabled " + err);
        });
    }
}
module.exports = GroupWizard;

