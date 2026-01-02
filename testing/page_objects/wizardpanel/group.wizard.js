/**
 * Created on 09.10.2017.
 */
const WizardPanel = require('./wizard.panel').WizardPanel;
const wpXpath = require('./wizard.panel').XPATH;
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const MembersPrincipalCombobox = require('../selectors/members.principal.combobox');
const UsersPrincipalCombobox = require('../selectors/users.principal.combobox');

const XPATH = {
    container: `//div[contains(@id,'GroupWizardPanel')]`,
    memberOptionsFilterInput: "//div[contains(@id,'FormItem') and descendant::span[text()='Members']]",
    roleOptionsFilterInput: "//div[contains(@id,'FormItem') and descendant::span[text()='Roles']]",
    rolesLink: `//li[child::a[text()='Roles']]`,
    membersLink: `//li[child::a[text()='Members']]`,
    membersStepForm: `//div[contains(@id,'MembersWizardStepForm')]`,
    rolesStepForm: `//div[contains(@id,'RolesWizardStepForm')]`
};

class GroupWizard extends WizardPanel {

    get deleteButton() {
        return XPATH.container + wpXpath.deleteButton;
    }

    get descriptionInput() {
        return XPATH.container + "//div[contains(@id,'PrincipalDescriptionWizardStepForm')]" + lib.TEXT_INPUT;
    }

    get memberOptionsFilterInput() {
        return XPATH.container + XPATH.memberOptionsFilterInput + lib.DROPDOWN_SELECTOR.OPTION_FILTER_INPUT;
    }

    get roleOptionsFilterInput() {
        return XPATH.container + XPATH.roleOptionsFilterInput + lib.DROPDOWN_SELECTOR.OPTION_FILTER_INPUT;
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

    async waitForOpened() {
        try {
            await this.waitForElementDisplayed(this.memberOptionsFilterInput, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Group wizard was not opened', 'err_group_wizard_not_opened', err);
        }
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

    async typeData(group) {
        await this.typeTextInInput(this.displayNameInput, group.displayName);
        await this.typeTextInInput(this.descriptionInput, group.description)
        if (group.roles != null) {
            await this.addRoles(group.roles);
        }
        if (group.members != null) {
            await this.addMembers(group.members);
        }
    }

    addRoles(roleDisplayNames) {
        let result = Promise.resolve();
        roleDisplayNames.forEach(displayName => {
            result = result.then(() => this.filterOptionsAndAddRole(displayName));
        });
        return result;
    }

    async filterOptionsAndAddRole(displayName) {
        try {
            let usersPrincipalCombobox = new UsersPrincipalCombobox();
            await usersPrincipalCombobox.selectFilteredOptionAndClickOnApply(displayName, XPATH.container);
        } catch (err) {
            await this.handleError('Group Wizard - tried to add the role:', 'err_group_wizard_role_selector', err);
        }
    }

    addMembers(memberDisplayNames) {
        let result = Promise.resolve();
        memberDisplayNames.forEach(displayName => {
            result = result.then(() => this.filterOptionsAndAddMember(displayName));
        });
        return result;
    }

    async filterOptionsAndAddMember(displayName) {
        try {
            let membersPrincipalCombobox = new MembersPrincipalCombobox();
            await membersPrincipalCombobox.selectFilteredOptionAndClickOnApply(displayName, XPATH.container);
            return await this.pause(400);
        } catch (err) {
            await this.handleError('Group Wizard - add member', 'err_group_wizard_add_member', err);
        }
    }

    async clickOnDelete() {
        await this.waitForDeleteButtonEnabled();
        await this.clickOnElement(this.deleteButton);
    }

    async getSelectedMembers() {
        let selectedOptions = XPATH.container + XPATH.membersStepForm + lib.PRINCIPAL_SELECTED_OPTION + lib.H6_DISPLAY_NAME;
        return await this.getTextInElements(selectedOptions);
    }

    async getSelectedRoles() {
        let selectedOptions = XPATH.container + XPATH.rolesStepForm + lib.PRINCIPAL_SELECTED_OPTION + lib.H6_DISPLAY_NAME;
        return await this.getTextInElements(selectedOptions);
    }

    async removeMember(displayName) {
        try {
            let selector = XPATH.container + XPATH.membersStepForm + lib.selectedPrincipalByDisplayName(displayName) + lib.REMOVE_ICON;
            await this.clickOnElement(selector);
        }catch (err){
            await this.handleError('Group Wizard - tried to remove the member', 'err_group_wizard_remove_member_icon', err);
        }
    }

    async removeRole(displayName) {
        try {
            let removeRoleIcon = XPATH.container + XPATH.rolesStepForm + lib.selectedPrincipalByDisplayName(displayName) + lib.REMOVE_ICON;
            await this.clickOnElement(removeRoleIcon);
        } catch (err) {
            await this.handleError('Group Wizard - tried to remove the role', 'err_group_wizard_remove_role_icon', err);
        }
    }

    waitForDeleteButtonEnabled() {
        return this.waitForElementEnabled(this.deleteButton, appConst.mediumTimeout).catch(err => {
            this.saveScreenshot('err_delete_group_button_disabled', err);
            throw new Error("Delete button should be enabled " + err);
        });
    }
}

module.exports = GroupWizard;

