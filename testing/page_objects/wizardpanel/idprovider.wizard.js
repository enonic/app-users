const wizard = require('./wizard.panel');
const elements = require('../../libs/elements');
const loaderComboBox = require('../inputs/loaderComboBox');
const panel = {
    container: `//div[contains(@id,'IdProviderWizardPanel')]`,
    authApplicationSelectorFilterInput: "//div[contains(@id,'InputView') and descendant::div[text()='Application']]" +
                         `${loaderComboBox.optionsFilterInput}`,
    permissionsFilterInput: `//div[contains(@id,'IdProviderAccessControlComboBox')]` + `${loaderComboBox.optionsFilterInput}`,
    permissionsLink: `//li[child::a[text()='Permissions']]`,
    aclList: `//ul[contains(@class,'access-control-list')]`,
    aceAccessSelector: `//div[contains(@id,'IdProviderAccessSelector')]`,
    selectedAcEntryByDisplayName: function (displayName) {
        return `//div[contains(@id,'IdProviderACESelectedOptionView') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`
    },
    providerComboBox: `//div[contains(@id,'AuthApplicationComboBox')]`,
    selectedAuthApplicationView: "//div[contains(@id,'AuthApplicationSelectedOptionView')]",
    removeAuthApplicationIcon: `//a[contains(@class,'remove')]`,

};
const idProviderWizard = Object.create(wizard, {

    descriptionInput: {
        get: function () {
            return `${panel.container}//input[contains(@name,'description')]`;
        }
    },
    authApplicationSelectorFilterInput: {
        get: function () {
            return `${panel.container}` + `${panel.authApplicationSelectorFilterInput}`;
        }
    },
    permissionsOptionsFilterInput: {
        get: function () {
            return `${panel.container}` + `${panel.permissionsFilterInput}`;
        }
    },
    permissionsDropDownHandle: {
        get: function () {
            return `${panel.container}` + `//div[contains(@id,'IdProviderAccessControlComboBox')]` + `${elements.DROP_DOWN_HANDLE}`;
        }
    },
    providerDropDownHandle: {
        get: function () {
            return `${panel.container}` + `${panel.providerComboBox}` + `${elements.DROP_DOWN_HANDLE}`;
        }
    },
    permissionsLink: {
        get: function () {
            return `${panel.container}` + `${panel.permissionsLink}`;
        }
    },
    removeAuthApplicationIcon: {
        get: function () {
            return `${panel.container}` + `${panel.selectedAuthApplicationView}` + `${panel.removeAuthApplicationIcon}`;
        }
    },

    typeDescription: {
        value: function (description) {
            return this.typeTextInInput(this.descriptionInput, description);
        }
    },
    addPrincipals: {
        value: function (principalDisplayNames) {
            let result = Promise.resolve();
            principalDisplayNames.forEach((displayName) => {
                result = result.then(() => this.filterOptionsAndSelectPermission(displayName));
            });
            return result;
        }
    },
    clickOnSelectedACEAndShowMenuOperations: {
        value: function (entryDisplayName) {
            let selector = `${panel.selectedAcEntryByDisplayName(entryDisplayName)}` + `${panel.aceAccessSelector}`;
            let menu = `${panel.aceAccessSelector}`;
            return this.doClick(selector).pause(300).then(() => {
                //return this.getDisplayedElements(menu);
            })
        }
    },
    isAceMenuOptionsExpanded: {
        value: function (entryDisplayName) {
            let selector = `${panel.selectedAcEntryByDisplayName(entryDisplayName)}` + `${panel.aceAccessSelector}`;
            return this.getAttribute(selector, 'class').then(result => {
                return result.includes('expanded');
            })
        }
    },
    clickOnPermissionsTabItem: {
        value: function () {
            return this.doClick(this.permissionsLink).pause(500);
        }
    },
    typeData: {
        value: function (idprovider) {
            return this.typeDisplayName(idprovider.displayName).then(() => {
                return this.typeDescription(idprovider.description);
            }).pause(500).then(() => {
                if (idprovider.permissions != null
                ) {
                    return this.clickOnPermissionsTabItem().then(() => {
                        return this.addPrincipals(idprovider.permissions);
                    })
                }
            }).then(() => {
                if (idprovider.authAppName != null) {
                    return this.filterOptionsAndSelectApplication(idprovider.authAppName);
                }
            }).pause(400);
        }
    },
    waitForOpened: {
        value: function () {
            return this.waitForVisible(this.displayNameInput, 3000);
        }
    },
    removeAuthApplication: {
        value: function () {
            return this.doClick(this.removeAuthApplicationIcon).pause(300);
        }
    },
    filterOptionsAndSelectApplication: {
        value: function (authAppName) {
            return this.typeTextInInput(`${panel.authApplicationSelectorFilterInput}`, authAppName).pause(400).then(() => {
                return loaderComboBox.waitForOptionVisible(`${panel.container}`, authAppName);
            }).then(() => {
                return loaderComboBox.clickOnOption(`${panel.container}`, authAppName);
            }).catch(err => {
                this.saveScreenshot('err_application');
                throw new Error('Error when selecting the auth-application: ' + authAppName + ' ' + err);
            })
        }
    },
    filterOptionsAndSelectPermission: {
        value: function (permissionDisplayName) {
            return this.typeTextInInput(`${panel.permissionsFilterInput}`, permissionDisplayName).pause(400).then(() => {
                return loaderComboBox.waitForOptionVisible(`${panel.container}`, permissionDisplayName);
            }).then(() => {
                return loaderComboBox.clickOnOption(`${panel.container}`, permissionDisplayName);
            }).catch(err => {
                throw new Error('Error when selecting the ACL-entry: ' + permissionDisplayName + ' ' + err);
            })
        }
    },
    clearPrincipalOptionsFilterInput: {
        value: function () {
            return this.clearElement(this.permissionsOptionsFilterInput).pause(200);
        }
    },
    clickOnPrincipalComboBoxDropDownHandle: {
        value: function () {
            return this.doClick(this.permissionsDropDownHandle).pause(1000);
        }
    },
    clickOnProviderComboBoxDropDownHandle: {
        value: function () {
            return this.doClick(this.providerDropDownHandle).pause(1000);
        }
    },
    getPrincipalOptionDisplayNames: {
        value: function () {
            return loaderComboBox.getOptionDisplayNames(`${panel.container}`);
        }
    },
    getProviderOptionDisplayNames: {
        value: function () {
            return loaderComboBox.getOptionDisplayNames(`${panel.container}` + `${panel.providerComboBox}`);
        }
    },
    typeDescription: {
        value: function (description) {
            this.typeTextInInput(this.descriptionInput, description);
        }
    },
    getDescription: {
        value: function () {
            return this.getTextFromInput(this.descriptionInput);
        }
    },
    getPermissions: {
        value: function () {
            let items = `${panel.container}` + `${panel.aclList}` + `${elements.H6_DISPLAY_NAME}`;
            return this.waitForVisible(`${panel.aclList}`, 1000).catch((err) => {
                throw new Error('ACL-list is not present on the page!');
            }).then(() => {
                return this.isVisible(items);
            }).then(result => {
                if (!result) {
                    return [];
                }
                return this.getTextFromElements(items)
            }).catch(err => {
                return [];
            })
        }
    },
    isDescriptionInputDisplayed: {
        value: function () {
            return this.isVisible(this.descriptionInput);
        }
    },
    isAuthApplicationsOptionsFilterInputDisplayed: {
        value: function () {
            return this.isVisible(this.authApplicationSelectorFilterInput);
        }
    },
    isPermissionsOptionsFilterInputDisplayed: {
        value: function () {
            return this.isVisible(this.permissionsOptionsFilterInput);
        }
    },
    waitForDeleteButtonEnabled: {
        value: function () {
            let deleteSelector = `${panel.container}` + `${wizard.deleteButton}`;
            return this.waitForEnabled(deleteSelector, 3000);
        }
    },
    clickOnDelete: {
        value: function () {
            let deleteSelector = `${panel.container}` + `${wizard.deleteButton}`;
            return this.waitForDeleteButtonEnabled().then(result => {
                return this.doClick(deleteSelector);
            }).catch(err => {
                console.log(err);
                this.doCatch('err_delete_in_idprovider_wizard', 'Error when Delete button has been clicked ');
            });
        }
    },
});
module.exports = idProviderWizard;
