/**
 * Created on 20.03.2018.
 */

const page = require('../page');
const elements = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const xpath = {
    container: `//div[contains(@id,'SiteConfiguratorDialog')]`,
    domainInput: "//input[contains(@id,'TextInput') and contains(@name,'appDomain')]",
    clientIdInput: "//input[contains(@id,'TextInput') and contains(@name,'appClientId')]",
    clientSecretInput: "//input[contains(@id,'TextInput') and contains(@name,'appSecret')]",

    applyButton: `//button[contains(@id,'DialogButton')]/span[text()='Apply']`,
    cancelButton: `//button[contains(@id,'DialogButton')]/span[text()='Cancel']`,
    selectedProviderView: `//div[contains(@id,'AuthApplicationSelectedOptionView')]`,
    userStoreTabItem: "//li[contains(@id,'TabBarItem') and child::a[contains(.,'User Store')]]",
    permissionsTabItem: "//li[contains(@id,'TabBarItem') and child::a[contains(.,'Permissions')]]"

};
const idProviderConfiguratorDialog = Object.create(page, {

    applyButton: {
        get: function () {
            return `${xpath.container}` + `${xpath.applyButton}`;
        }
    },
    domainInput: {
        get: function () {
            return `${xpath.container}` + `${xpath.domainInput}`;
        }
    },
    clientIdInput: {
        get: function () {
            return `${xpath.container}` + `${xpath.clientIdInput}`;
        }
    },
    clientSecretInput: {
        get: function () {
            return `${xpath.container}` + `${xpath.clientSecretInput}`;
        }
    },
    cancelButton: {
        get: function () {
            return `${xpath.container}` + `${xpath.cancelButton}`;
        }
    },
    cancelButtonTop: {
        get: function () {
            return `${xpath.container}` + `${elements.CANCEL_BUTTON_TOP}`;
        }
    },

    isDomainInputDisplayed: {
        value: function () {
            return this.isVisible(this.domainInput);
        }
    },
    typeInDomainInput: {
        value: function (domain) {
            return this.typeTextInInput(this.domainInput, domain).pause(200).catch(err => {
                this.saveScreenshot('err_type_domainInput');
                throw new Error(err);
            })
        }
    },
    typeInClientIdInput: {
        value: function (clientId) {
            return this.typeTextInInput(this.clientIdInput, clientId).pause(200).catch(err => {
                this.saveScreenshot('err_type_clientIdInput');
                throw new Error(err);
            });
        }
    },
    typeInClientSecretInput: {
        value: function (text) {
            return this.typeTextInInput(this.clientSecretInput, text).pause(200).catch(err => {
                this.saveScreenshot('err_type_secretInput');
                throw new Error(err);
            })
        }
    },
    doFillRequiredInputs: {
        value: function (domain, clientId, clientSecret) {
            let editButton = xpath.selectedProviderView + elements.EDIT_ICON;
            return this.doClick(xpath.permissionsTabItem).then(() => {
                return this.doClick(xpath.userStoreTabItem);
            }).pause(1000).then(() => {
                return this.waitForVisible(editButton, 3000);
            }).then(result => {
                return this.doClick(editButton);
            }).then(() => {
                return this.waitForDialogOpened();
            }).then(() => {
                return this.typeInDomainInput(domain);
            }).then(() => {
                return this.typeInClientIdInput(clientId);
            }).then(() => {
                return this.typeInClientSecretInput(clientSecret);
            }).then(() => {
                return this.clickOnApplyButton();
            }).then(() => {
                return this.waitForClosed();
            }).pause(500);
        }
    },
    waitForDialogOpened: {
        value: function (ms) {
            return this.waitForVisible(`${xpath.container}`, ms);
        }
    },
    clickOnCancelTopButton: {
        value: function () {
            return this.doClick(this.cancelButtonTop);
        }
    },
    clickOnApplyButton: {
        value: function () {
            return this.doClick(this.applyButton);
        }
    },
    clickOnCancelButton: {
        value: function () {
            return this.doClick(this.cancelButton);
        }
    },
    waitForClosed: {
        value: function () {
            return this.waitForNotVisible(`${xpath.container}`, appConst.TIMEOUT_3).catch(error => {
                throw new Error('ID Provider config Dialog was not closed');
            });
        }
    },
});
module.exports = idProviderConfiguratorDialog;
