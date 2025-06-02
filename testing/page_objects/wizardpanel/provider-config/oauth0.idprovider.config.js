/**
 * Created on 26.02.2021.
 */
const Page = require('../../page');
const lib = require('../../../libs/elements');
const appConst = require('../../../libs/app_const');
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

class Oauth0IdProviderConfiguratorDialog extends Page {

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

    async waitForApplyButtonEnabled() {
        await await this.waitForElementEnabled(this.applyButton, appConst.mediumTimeout);
    }

    async clickOnApplyButton() {
        try {
            await this.waitForApplyButtonEnabled();
            await this.clickOnElement(this.applyButton);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_apply_button');
            throw new Error(`Oauth ID provider, apply button, screenshot: ${screenshot}` + err);
        }
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

    waitForClosed() {
        return this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout).catch(err => {
            throw new Error('ID Provider config Dialog was not closed' + err);
        });
    }

    async typeInDomainInput(domain) {
        try {
            await this.typeTextInInput(this.domainInput, domain);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_domain_input');
            throw new Error(`Oauth ID provider, domain input screenshot:${screenshot} ` + err);
        }
    }

    async typeInClientSecretInput(text) {
        try {
            return await this.typeTextInInput(this.clientSecretInput, text)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_type_secretInput');
            throw new Error(`Oauth ID provider, client secret input, screenshot: ${screenshot}` + err);
        }
    }

    async typeInClientIdInput(clientId) {
        try {
            await this.typeTextInInput(this.clientIdInput, clientId)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_type_clientIdInput');
            throw new Error(`Oauth ID provider config , Client ID  input, screenshot:${screenshot} ` + err);
        }
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

module.exports = Oauth0IdProviderConfiguratorDialog;
