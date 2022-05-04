/**
 * Created on 26.02.2021.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const XPATH = {
    container: `//div[contains(@id,'ApplicationConfiguratorDialog')]`,
    authorizationUrl: "//input[contains(@id,'TextInput') and contains(@name,'authorizationUrl')]",
    tokenUrl: "//input[contains(@id,'TextInput') and contains(@name,'tokenUrl')]",
    logoutUrl: "//input[contains(@id,'TextInput') and contains(@name,'logoutUrl')]",
    proxyHostInput: "//input[contains(@id,'TextInput') and contains(@name,'host')]",
    clientIdInput: "//input[contains(@id,'TextInput') and contains(@name,'clientId')]",
    applyButton: `//button[contains(@id,'DialogButton')]/span[text()='Apply']`,
    addProxyButton: "//div[contains(@id,'FormItemSetView')]//button[@title='Add Proxy' and child::span[text()='Add']]",
    cancelButton: `//button[contains(@id,'DialogButton')]/span[text()='Cancel']`,
    selectedProviderView: `//div[contains(@id,'AuthApplicationSelectedOptionView')]`,
    idProviderTabItem: "//li[contains(@id,'TabBarItem') and child::a[contains(.,'Id Provider')]]",
    permissionsTabItem: "//li[contains(@id,'TabBarItem') and child::a[contains(.,'Permissions')]]"
};

class AdfsIdProviderConfiguratorDialog extends Page {

    get applyButton() {
        return `${XPATH.container}` + `${XPATH.applyButton}`;
    }

    get addProxyButton() {
        return `${XPATH.container}` + `${XPATH.addProxyButton}`;
    }

    get authorizationUrlInput() {
        return `${XPATH.container}` + `${XPATH.authorizationUrl}`;
    }

    get proxyHostInput() {
        return `${XPATH.container}` + `${XPATH.proxyHostInput}`;
    }

    get tokenUrl() {
        return `${XPATH.container}` + `${XPATH.tokenUrl}`;
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

    waitForClientIdInputDisplayed() {
        return this.waitForElementDisplayed(this.clientIdInput, appConst.mediumTimeout);
    }

    waitForAuthorizationUrlInputDisplayed() {
        return this.waitForElementDisplayed(this.authorizationUrlInput, appConst.mediumTimeout);
    }

    waitForProxyHostInputDisplayed() {
        return this.waitForElementDisplayed(this.proxyHostInput, appConst.mediumTimeout);
    }

    clickOnCancelTopButton() {
        return this.clickOnElement(this.cancelButtonTop);
    }

    async clickOnAddProxyButton() {
        await this.clickOnElement(this.addProxyButton);
        return await this.pause(300);
    }

    clickOnApplyButton() {
        return this.clickOnElement(this.applyButton);
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

    typeInProxyHostInput(host) {
        return this.typeTextInInput(this.proxyHostInput, host).catch(err => {
            this.saveScreenshot('err_type_host');
            throw new Error(err);
        });
    }

    async openConfigurator() {
        let editButton = XPATH.selectedProviderView + lib.EDIT_ICON;
        await this.clickOnElement(XPATH.idProviderTabItem);
        await this.pause(700);
        await this.waitForElementDisplayed(editButton, appConst.mediumTimeout);
        await this.clickOnElement(editButton);
        return await this.pause(500);
    }
}

module.exports = AdfsIdProviderConfiguratorDialog;
