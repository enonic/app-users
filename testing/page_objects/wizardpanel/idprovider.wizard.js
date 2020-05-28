/**
 * Updated on 25.04.2019.
 */
const WizardPanel = require('./wizard.panel').WizardPanel;
const wpXpath = require('./wizard.panel').XPATH;
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const LoaderComboBox = require('../inputs/loaderComboBox');

const XPATH = {
    container: "//div[contains(@id,'IdProviderWizardPanel')]",
    permissionsFilterInput: "//div[contains(@id,'IdProviderAccessControlComboBox')]" + lib.COMBO_BOX_OPTION_FILTER_INPUT,
    permissionsLink: "//li[child::a[text()='Permissions']]",
    aclList: "//div[contains(@id,'IdProviderACESelectedOptionsView') and contains(@class,'selected-options')]",
    aceAccessSelector: "//div[contains(@id,'IdProviderAccessSelector')]",
    selectedAcEntryByDisplayName: function (displayName) {
        return `//div[contains(@id,'IdProviderAccessControlEntryView') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`
    },
    aceOperationByName: function (displayName) {
        return `//ul[@class='menu']//li[child::a[text()='${displayName}']]`
    },
    providerComboBox: "//div[contains(@id,'AuthApplicationComboBox')]",
    selectedAuthApplicationView: "//div[contains(@id,'AuthApplicationSelectedOptionView')]",
    removeAuthApplicationIcon: "//a[contains(@class,'remove')]",
};

class IdProviderWizard extends WizardPanel {

    get descriptionInput() {
        return XPATH.container + lib.formItemByLabel("Description") + lib.TEXT_INPUT;
    }

    get authApplicationSelectorFilterInput() {
        return XPATH.container + lib.formItemByLabel("Application") + lib.COMBO_BOX_OPTION_FILTER_INPUT;
    }

    get permissionsOptionsFilterInput() {
        return XPATH.container + XPATH.permissionsFilterInput;
    }

    get permissionsDropDownHandle() {
        return XPATH.container + "//div[contains(@id,'IdProviderAccessControlComboBox')]" + lib.DROP_DOWN_HANDLE;
    }

    get providerDropDownHandle() {
        return XPATH.container + XPATH.providerComboBox + lib.DROP_DOWN_HANDLE;
    }

    get deleteButton() {
        return XPATH.container + wpXpath.deleteButton;
    }

    get permissionsLink() {
        return XPATH.container + XPATH.permissionsLink;
    }

    get removeAuthApplicationIcon() {
        return XPATH.container + XPATH.selectedAuthApplicationView + XPATH.removeAuthApplicationIcon;
    }

    waitForDeleteButtonEnabled() {
        return this.waitForElementEnabled(this.deleteButton, appConst.TIMEOUT_3);
    }

    async waitForDeleteButtonDisabled() {
        try {
            return await this.waitForElementDisabled(this.deleteButton, appConst.TIMEOUT_3);
        } catch (err) {
            throw new Error("ID Providewr wizard - Delete button should be disabled! " + err);
        }
    }

    async clickOnDelete() {
        try {
            await this.waitForDeleteButtonEnabled();
            return await this.clickOnElement(this.deleteButton);
        } catch (err) {
            this.saveScreenshot('err_delete_in_idprovider_wizard');
            throw new Error('Error when Delete button has been clicked ' + err);
        }
    }

    typeDescription(description) {
        return this.typeTextInInput(this.descriptionInput, description);
    }

    addPrincipals(principalDisplayNames) {
        let result = Promise.resolve();
        principalDisplayNames.forEach((displayName) => {
            result = result.then(() => this.filterOptionsAndSelectPermission(displayName));
        });
        return result;
    }

    filterOptionsAndSelectPermission(permissionDisplayName) {
        let loaderComboBox = new LoaderComboBox();
        return this.typeTextInInput(XPATH.permissionsFilterInput, permissionDisplayName).then(() => {
            return loaderComboBox.waitForOptionVisible(XPATH.container, permissionDisplayName);
        }).then(() => {
            return loaderComboBox.clickOnOption(XPATH.container, permissionDisplayName);
        }).then(() => {
            return this.pause(300);
        }).catch(err => {
            throw new Error('Error when selecting the ACL-entry: ' + permissionDisplayName + ' ' + err);
        })
    }

    async clearPrincipalOptionsFilterInput() {
        await this.clearInputText(this.permissionsOptionsFilterInput);
        return await this.pause(400);
    }

    async clickOnPrincipalComboBoxDropDownHandle() {
        await this.clickOnElement(this.permissionsDropDownHandle);
        return await this.pause(800);
    }

    async clickOnProviderComboBoxDropDownHandle() {
        await this.clickOnElement(this.providerDropDownHandle);
        return await this.pause(800);
    }

    getPrincipalOptionDisplayNames() {
        let loaderComboBox = new LoaderComboBox();
        return loaderComboBox.getOptionDisplayNames(XPATH.container + "//div[contains(@id,'IdProviderAccessControlComboBox')]");
    }

    getProviderOptionDisplayNames() {
        let loaderComboBox = new LoaderComboBox();
        return loaderComboBox.getOptionDisplayNames(XPATH.container + XPATH.providerComboBox);
    }

    async removeAuthApplication() {
        await this.clickOnElement(this.removeAuthApplicationIcon);
        return await this.pause(400);
    }

    async filterOptionsAndSelectApplication(authAppName) {
        try {
            let loaderComboBox = new LoaderComboBox();
            await this.typeTextInInput(this.authApplicationSelectorFilterInput, authAppName);
            await loaderComboBox.waitForOptionVisible(XPATH.container, authAppName);
            await loaderComboBox.clickOnOption(XPATH.container, authAppName);
            return await this.pause(300);
        } catch (err) {
            this.saveScreenshot('err_select_application');
            throw new Error('ID Provider - Error when selecting the auth-application: ' + authAppName + ' ' + err);
        }
    }

    async clickOnSelectedACEAndShowMenuOperations(entryDisplayName) {
        let selector = XPATH.selectedAcEntryByDisplayName(entryDisplayName) + XPATH.aceAccessSelector;
        await this.clickOnElement(selector);
        return await this.pause(400);
    }

    isAceMenuOptionsExpanded(entryDisplayName) {
        let selector = XPATH.selectedAcEntryByDisplayName(entryDisplayName) + XPATH.aceAccessSelector;
        return this.getAttribute(selector, 'class').then(result => {
            return result.includes('expanded');
        })
    }

    async clickOnAceMenuOperation(operation) {
        let selector = XPATH.aceOperationByName(operation);
        let elems = await this.getDisplayedElements(selector);
        return await elems[0].click();
    }

    getSelectedAceOperation(principal) {
        let selector = XPATH.selectedAcEntryByDisplayName(principal) + XPATH.aceAccessSelector + "//a";
        return this.getText(selector);
    }

    //gets ACE -operations in expanded menu
    async getAceMenuOperations() {
        let result = [];
        let selector = XPATH.aceAccessSelector + "//ul[@class='menu']//li";
        let elems = await this.getDisplayedElements(selector);
        elems.forEach(el => {
            result.push(el.getText());
        });
        return Promise.all(result);
    }

    async clickOnPermissionsTabItem() {
        await this.clickOnElement(this.permissionsLink);
        return await this.pause(500);
    }

    async typeData(idprovider) {
        await this.typeDisplayName(idprovider.displayName);
        await this.typeDescription(idprovider.description);
        if (idprovider.permissions != null) {
            await this.clickOnPermissionsTabItem();
            await this.addPrincipals(idprovider.permissions);
        }
        if (idprovider.authAppName != null) {
            return await this.filterOptionsAndSelectApplication(idprovider.authAppName);
        }
    }

    //return text in the Description input
    getDescription() {
        return this.getTextInInput(this.descriptionInput);
    }

    //gets selected options in Permissions step
    getPermissions() {
        let items = XPATH.container + XPATH.aclList + lib.H6_DISPLAY_NAME;
        return this.waitForElementDisplayed(XPATH.aclList, 1000).catch(err => {
            throw new Error('ID Provider wizard, ACL entries are not displayed in Permissions wizard-step');
        }).then(() => {
            return this.getTextInElements(items)
        });
    }

    isDescriptionInputDisplayed() {
        return this.isElementDisplayed(this.descriptionInput);
    }

    isAuthApplicationsOptionsFilterInputDisplayed() {
        return this.isElementDisplayed(this.authApplicationSelectorFilterInput);
    }

    isPermissionsOptionsFilterInputDisplayed() {

        return this.isElementDisplayed(this.permissionsOptionsFilterInput);
    }

    waitForOpened() {
        return this.waitForElementDisplayed(this.displayNameInput, appConst.TIMEOUT_3);
    }
}

module.exports = IdProviderWizard;

