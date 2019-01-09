const wizard = require('./wizard.panel');
const elements = require('../../libs/elements');
const loaderComboBox = require('../inputs/loaderComboBox');
const panel = {
    container: `//div[contains(@id,'UserStoreWizardPanel')]`,
    providerFilterInput: "//div[contains(@id,'InputView') and descendant::div[text()='Application']]" +
                         `${loaderComboBox.optionsFilterInput}`,
    permissionsFilterInput: `//div[contains(@id,'UserStoreAccessControlComboBox')]` + `${loaderComboBox.optionsFilterInput}`,
    permissionsLink: `//li[child::a[text()='Permissions']]`,
    aclList: `//ul[contains(@class,'access-control-list')]`,
    aceAccessSelector: `//div[contains(@id,'UserStoreAccessSelector')]`,
    selectedAcEntryByDisplayName: function (displayName) {
        return `//div[contains(@id,'UserStoreACESelectedOptionView') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`
    },
    providerComboBox: `//div[contains(@id,'AuthApplicationComboBox')]`,
    selectedProviderView: "//div[contains(@id,'AuthApplicationSelectedOptionView')]",
    removeProviderIcon: `//a[contains(@class,'remove')]`,

};
const userStoreWizard = Object.create(wizard, {

    descriptionInput: {
        get: function () {
            return `${panel.container}//input[contains(@name,'description')]`;
        }
    },
    providerOptionsFilterInput: {
        get: function () {
            return `${panel.container}` + `${panel.providerFilterInput}`;
        }
    },
    permissionsOptionsFilterInput: {
        get: function () {
            return `${panel.container}` + `${panel.permissionsFilterInput}`;
        }
    },
    permissionsDropDownHandle: {
        get: function () {
            return `${panel.container}` + `//div[contains(@id,'UserStoreAccessControlComboBox')]` + `${elements.DROP_DOWN_HANDLE}`;
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
    removeProviderIcon: {
        get: function () {
            return `${panel.container}` + `${panel.selectedProviderView}` + `${panel.removeProviderIcon}`;
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
        value: function (userstore) {
            return this.typeDisplayName(userstore.displayName).then(() => {
                return this.typeDescription(userstore.description);
            }).pause(500).then(() => {
                if (userstore.permissions != null) {
                    return this.clickOnPermissionsTabItem().then(() => {
                        return this.addPrincipals(userstore.permissions);
                    })
                }
            }).then(() => {
                if (userstore.providerName != null) {
                    return this.filterOptionsAndSelectIdProvider(userstore.providerName);
                }
            }).pause(400);
        }
    },
    waitForOpened: {
        value: function () {
            return this.waitForVisible(this.displayNameInput, 3000);
        }
    },
    removeProvider: {
        value: function () {
            return this.doClick(this.removeProviderIcon).pause(300);
        }
    },
    filterOptionsAndSelectApplication: {
        value: function (providerName) {
            return this.typeTextInInput(`${panel.providerFilterInput}`, providerName).pause(400).then(() => {
                return loaderComboBox.waitForOptionVisible(`${panel.container}`, providerName);
            }).then(() => {
                return loaderComboBox.clickOnOption(`${panel.container}`, providerName);
            }).catch(err => {
                this.saveScreenshot('err_application');
            throw new Error('Error when selecting the application: ' + providerName + ' ' + err);
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
    isProviderOptionsFilterInputDisplayed: {
        value: function () {
            return this.isVisible(this.providerOptionsFilterInput);
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
                this.doCatch('err_delete_in_userstore_wizard', 'Error when Delete button has been clicked ');
            });
        }
    },
});
module.exports = userStoreWizard;
