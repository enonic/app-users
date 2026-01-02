/**
 * Updated on 25.04.2019.
 */
const WizardPanel = require('./wizard.panel').WizardPanel;
const wpXpath = require('./wizard.panel').XPATH;
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const AuthApplicationComboBox = require('../selectors/auth.application.combobox');
const IdProviderAccessControlComboBox = require('../selectors/id.provider.access.control.combobox');

const XPATH = {
    container: "//div[contains(@id,'IdProviderWizardPanel')]",
    permissionsFilterInput: "//div[contains(@id,'IdProviderAccessControlComboBox')]" + lib.DROPDOWN_SELECTOR.OPTION_FILTER_INPUT,
    permissionsLink: "//li[child::a[text()='Permissions']]",
    aclList: "//div[contains(@id,'IdProviderACESelectedOptionsView') and contains(@class,'selected-options')]",
    aceAccessSelector: "//div[contains(@id,'IdProviderAccessSelector')]",
    selectedAcEntryByDisplayName: function (displayName) {
        return `//div[contains(@id,'IdProviderAccessControlEntryView') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`
    },
    aceOperationByName(displayName) {
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
        return XPATH.container + lib.formItemByLabel("Application") + lib.DROPDOWN_SELECTOR.OPTION_FILTER_INPUT;
    }

    get permissionsOptionsFilterInput() {
        return XPATH.container + XPATH.permissionsFilterInput;
    }

    get permissionsDropDownHandle() {
        return XPATH.container + "//div[contains(@id,'IdProviderAccessControlComboBox')]" + lib.BUTTONS.DROP_DOWN_HANDLE;
    }

    get providerDropDownHandle() {
        return XPATH.container + XPATH.providerComboBox + lib.BUTTONS.DROP_DOWN_HANDLE;
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
        return this.waitForElementEnabled(this.deleteButton, appConst.mediumTimeout);
    }

    async waitForDeleteButtonDisabled() {
        try {
            return await this.waitForElementDisabled(this.deleteButton, appConst.mediumTimeout);
        } catch (err) {
            throw new Error("ID Providewr wizard - Delete button should be disabled! " + err);
        }
    }

    async clickOnDelete() {
        try {
            await this.waitForDeleteButtonEnabled();
            return await this.clickOnElement(this.deleteButton);
        } catch (err) {
            await this.handleError('ID Provider Wizard, clicked on Delete button', 'err_click_delete_in_idprovider_wizard', err);
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

    async filterOptionsAndSelectPermission(permissionDisplayName) {
        let idProviderAccessControlComboBox = new IdProviderAccessControlComboBox();
        try {
            await idProviderAccessControlComboBox.selectFilteredByDisplayNamePermission(permissionDisplayName, XPATH.container);
            return await this.pause(300);
        } catch (err) {
            throw new Error('Error when selecting the ACL-entry: ' + permissionDisplayName + ' ' + err);
        }
    }

    async clearPrincipalOptionsFilterInput() {
        await this.clearInputText(this.permissionsOptionsFilterInput);
        return await this.pause(400);
    }

    // Permissions selector:
    async clickOnPrincipalComboBoxDropDownHandle() {
        let idProviderAccessControlComboBox = new IdProviderAccessControlComboBox();
        await idProviderAccessControlComboBox.clickOnDropdownHandle();
        return await this.pause(400);
    }

    // Applications(Provider) selector
    async clickOnProviderComboBoxDropDownHandle() {
        let authApplicationComboBox = new AuthApplicationComboBox();
        await authApplicationComboBox.clickOnDropdownHandle();
    }

    async clickOnEditAuthAppConfig() {
        let locator = XPATH.container + "//div[contains(@id,'AuthApplicationSelectedOptionsView')]" + lib.EDIT_ICON;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        await this.clickOnElement(locator);
    }

    // Permissions selector:
    async getPrincipalOptionDisplayNames() {
        let idProviderAccessControlComboBox = new IdProviderAccessControlComboBox();
        return await idProviderAccessControlComboBox.getOptionsDisplayName(XPATH.container);

    }

    // Applications(Provider) selector
    async getProviderOptionDisplayNames() {
        let authApplicationComboBox = new AuthApplicationComboBox();
        return await authApplicationComboBox.getOptionsDisplayName(XPATH.container);
    }

    async removeAuthApplication() {
        await this.clickOnElement(this.removeAuthApplicationIcon);
        return await this.pause(400);
    }

    async filterOptionsAndSelectApplication(authAppName) {
        let authApplicationComboBox = new AuthApplicationComboBox();
        try {
            await authApplicationComboBox.selectFilteredByDisplayNameProviderApp(authAppName, XPATH.container);
            return await this.pause(300);
        } catch (err) {
            await this.handleError('ID Provider - Auth Application selector', 'err_id_provider_select_application', err);
        }
    }

    async clickOnSelectedACEAndShowMenuOperations(entryDisplayName) {
        let selector = XPATH.selectedAcEntryByDisplayName(entryDisplayName) + XPATH.aceAccessSelector;
        await this.clickOnElement(selector);
        return await this.pause(400);
    }

    async isAceMenuOptionsExpanded(entryDisplayName) {
        let selector = XPATH.selectedAcEntryByDisplayName(entryDisplayName) + XPATH.aceAccessSelector;
        let attr = await this.getAttribute(selector, 'class');
        return attr.includes('expanded');
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
    async getPermissions() {
        try {
            let items = XPATH.container + XPATH.aclList + lib.H6_DISPLAY_NAME;
            await this.waitForElementDisplayed(XPATH.aclList);
            return await this.getTextInElements(items);
        } catch (err) {
            await this.handleError('ID Provider Wizard - tried to get permissions' , 'err_get_id_provider_permissions' , err);
        }
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

    async waitForOpened() {
        await this.waitForElementDisplayed(this.displayNameInput, appConst.mediumTimeout);
    }
}

module.exports = IdProviderWizard;

