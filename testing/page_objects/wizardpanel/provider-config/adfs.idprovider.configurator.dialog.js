/**
 * Created on 15.10.2024
 */
const Page = require('../../page');
const lib = require('../../../libs/elements');
const appConst = require("../../../libs/app_const");
const PrincipalComboBox = require('../../selectors/principal.combobox');

const XPATH = {
    container: `//div[contains(@id,'ApplicationConfiguratorDialog')]`,
    domainInput: "//input[contains(@id,'TextInput') and contains(@name,'appDomain')]",
    clientIdInput: "//input[contains(@id,'TextInput') and contains(@name,'appClientId')]",
    clientSecretInput: "//input[contains(@id,'TextInput') and contains(@name,'appSecret')]",
    applyButton: `//button[contains(@id,'DialogButton') and child::span[text()='Apply']]`,
    cancelButton: `//button[contains(@id,'DialogButton')]/span[text()='Cancel']`,
    selectedProviderView: `//div[contains(@id,'AuthApplicationSelectedOptionView')]`,
    idProviderTabItem: "//li[contains(@id,'TabBarItem') and child::a[contains(.,'Id Provider')]]",
    permissionsTabItem: "//li[contains(@id,'TabBarItem') and child::a[contains(.,'Permissions')]]",
    occurrenceMoreButton: label => `//div[contains(@id,'FormItemSetView') and descendant::h5[text()='${label}']]//button[contains(@id,'MoreButton')]`
};

class AdfsIdProviderConfiguratorDialog extends Page {

    get container() {
        return XPATH.container;
    }

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

    async waitForApplyButtonEnabled() {
        await this.waitForElementEnabled(this.applyButton, appConst.mediumTimeout);
        await this.pause(200);
    }

    waitForApplyButtonDisabled() {
        return this.waitForElementDisabled(this.applyButton, appConst.mediumTimeout);
    }

    clickOnCancelButton() {
        return this.clickOnElement(this.cancelButton);
    }

    cancelButtonTop() {
        return XPATH.container + lib.BUTTONS.CANCEL_BUTTON_TOP;
    }

    isDomainInputDisplayed() {
        return this.isElementEnabled(this.domainInput);
    }

    async waitForClosed() {
        try {
            await this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout)
        } catch (err) {
            await this.handleError('ADFS ID Provider config Dialog should be closed' , 'err_adfs_id_provider_config_dialog_close' , err);
        }
    }

    typeInDomainInput(domain) {
        return this.typeTextInInput(this.domainInput, domain).catch(err => {
            this.saveScreenshot('err_type_domainInput');
            throw new Error(err);
        })
    }

    async typeInClientSecretInput(text) {
        try {
            await this.waitForElementDisplayed(this.clientSecretInput, appConst.mediumTimeout);
            await this.typeTextInInput(this.clientSecretInput, text);
        } catch (err) {
            await this.handleError('ADFS config, client secret input' , 'err_adfs_client_secret_input' , err);
        }
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
    }

    async openProviderConfigDialog() {
        let editButton = XPATH.selectedProviderView + lib.EDIT_ICON;
        await this.clickOnElement(XPATH.permissionsTabItem);
        await this.clickOnElement(XPATH.idProviderTabItem);
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
        await principalComboBox.selectFilteredOptionAndClickOnApply(groupName, XPATH.container);
    }

    async getSelectedGroups() {
        try {
            let selectedOptions = XPATH.container + lib.PRINCIPAL_SELECTED_OPTION + lib.H6_DISPLAY_NAME;
            return await this.getTextInElements(selectedOptions);
        } catch (err) {
            await this.handleError('ADFS provider config - get selected groups' , 'err_adfs_get_selected_groups' , err);
        }
    }

    async clickOnAddKeyButton() {
        let locator = XPATH.container + "//button[@title='Add site key']";
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        await this.clickOnElement(locator);
    }

    async clickOnOccurrenceMenuButton(label) {
        let locator = XPATH.container + `//div[contains(@id,'FormItemSetView') and descendant::h5[text()='${label}']]` +
                      "//button[contains(@id,'MoreButton')]";
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.clickOnElement(locator);
    }

    async clickOnOccurrenceMenuItem(label, menuItem) {
        let locator = XPATH.container + XPATH.occurrenceMoreButton(label) + `//li[contains(@id,'MenuItem') and text()='${menuItem}']`;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.clickOnElement(locator);
    }

    async waitForOccurrencesMenuButtonDisplayed(label) {
        let locator = XPATH.container;
        return await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
    }
}

module.exports = AdfsIdProviderConfiguratorDialog;
