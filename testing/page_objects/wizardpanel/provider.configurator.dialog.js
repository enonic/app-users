/**
 * Created on 20.03.2018.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const PrincipalComboBox = require('../inputs/principal.compobox');
const XPATH = {
    container: `//div[contains(@id,'ApplicationConfiguratorDialog')]`,
    domainInput: "//input[contains(@id,'TextInput') and contains(@name,'appDomain')]",
    clientIdInput: "//input[contains(@id,'TextInput') and contains(@name,'appClientId')]",
    clientSecretInput: "//input[contains(@id,'TextInput') and contains(@name,'appSecret')]",
    applyButton: `//button[contains(@id,'DialogButton') and child::span[text()='Apply']]`,
    cancelButton: `//button[contains(@id,'DialogButton')]/span[text()='Cancel']`,
    selectedProviderView: `//div[contains(@id,'AuthApplicationSelectedOptionView')]`,
    idProviderTabItem: "//li[contains(@id,'TabBarItem') and child::a[contains(.,'Id Provider')]]",
    permissionsTabItem: "//li[contains(@id,'TabBarItem') and child::a[contains(.,'Permissions')]]"
};

class IdProviderConfiguratorDialog extends Page {

    get applyButton() {
        return `${XPATH.container}` + `${XPATH.applyButton}`;
    }

    get domainInput() {
        return `${XPATH.container}` + `${XPATH.domainInput}`;
    }

    get clientSecretInput() {
        return `${XPATH.container}` + `${XPATH.clientSecretInput}`;
    }

    get cancelButton() {
        return `${XPATH.container}` + `${XPATH.cancelButton}`;
    }

    get clientIdInput() {
        return XPATH.container + XPATH.clientIdInput;
    }

    waitForDialogOpened() {
        return this.waitForElementDisplayed(`${XPATH.container}`, appConst.mediumTimeout);
    }

    clickOnCancelTopButton() {
        return this.clickOnElement(this.cancelButtonTop);
    }

    clickOnApplyButton() {
        return this.clickOnElement(this.applyButton);
    }

    waitForApplyButtonEnabled() {
        return this.waitForElementEnabled(this.applyButton, appConst.mediumTimeout);
    }

    waitForApplyButtonDisabled() {
        return this.waitForElementDisabled(this.applyButton, appConst.mediumTimeout);
    }

    clickOnCancelButton() {
        return this.clickOnElement(this.cancelButton);
    }

    cancelButtonTop() {
        return XPATH.container + lib.CANCEL_BUTTON_TOP;
    }

    isDomainInputDisplayed() {
        return this.isElementEnabled(this.domainInput);
    }

    waitForClosed() {
        return this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout).catch(error => {
            throw new Error('ID Provider config Dialog was not closed');
        });
    }

    typeInDomainInput(domain) {
        return this.typeTextInInput(this.domainInput, domain).catch(err => {
            this.saveScreenshot('err_type_domainInput');
            throw new Error(err);
        })
    }

    typeInClientSecretInput(text) {
        return this.typeTextInInput(this.clientSecretInput, text).catch(err => {
            this.saveScreenshot('err_type_secretInput');
            throw new Error(err);
        })
    }

    typeInClientIdInput(clientId) {
        return this.typeTextInInput(this.clientIdInput, clientId).catch(err => {
            this.saveScreenshot('err_type_clientIdInput');
            throw new Error(err);
        });
    }

    async openDialogFillRequiredInputsAndApply(domain, clientId, clientSecret) {
        await this.openDialogFillRequiredInputs(domain, clientId, clientSecret);
        await this.waitForApplyButtonEnabled();
        await this.clickOnApplyButton();
        await this.waitForClosed();
        return await this.pause(500);
    }

    async openProviderConfigDialog() {
        let editButton = XPATH.selectedProviderView + lib.EDIT_ICON;
        await this.clickOnElement(XPATH.permissionsTabItem);
        await this.clickOnElement(XPATH.idProviderTabItem);
        await this.pause(700);
        await this.waitForElementDisplayed(editButton, appConst.mediumTimeout);
        await this.clickOnElement(editButton);
        await this.waitForDialogOpened();
    }

    async openDialogFillRequiredInputs(domain, clientId, clientSecret) {
        await this.openProviderConfigDialog();
        await this.typeInDomainInput(domain);
        await this.typeInClientIdInput(clientId);
        await this.typeInClientSecretInput(clientSecret);
    }

    async selectGroup(groupName) {
        let principalComboBox = new PrincipalComboBox();
        //await this.typeTextInInput(XPATH.container + lib.COMBO_BOX_OPTION_FILTER_INPUT, groupName)
        await principalComboBox.typeTextAndSelectOption(groupName, XPATH.container);
        return await this.pause(500);
    }

    async getSelectedGroups() {
        try {
            let selectedOptions = XPATH.container + lib.PRINCIPAL_SELECTED_OPTION + lib.H6_DISPLAY_NAME;
            return await this.getTextInElements(selectedOptions);
        } catch (err) {
            throw new Error('Error when getting selected Groups in the form: ' + err);
        }
    }

    async clickOnAddKeyButton() {
        let locator = XPATH.container + "//button[@title='Add site key']";
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        await this.clickOnElement(locator);
        return await this.pause(500);
    }

    async waitForOccurrencesMenuButtonDisplayed(label) {
        let locator = XPATH.container;
        return await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
    }
}

module.exports = IdProviderConfiguratorDialog;
