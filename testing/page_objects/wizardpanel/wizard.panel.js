/**
 * Created on 5/30/2017.
 */
const page = require('../page');
const elements = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const itemBuilders = require('../../libs/userItems.builder');
const wizard = {
    displayNameInput: `//input[contains(@name,'displayName')]`,
    saveButton: `//button[contains(@id,'ActionButton') and child::span[text()='Save']]`,
    deleteButton: `//button[contains(@id,'ActionButton') and child::span[text()='Delete']]`,
}
var wizardPanel = Object.create(page, {

    displayNameInput: {
        get: function () {
            return `${wizard.displayNameInput}`;
        }
    },
    saveButton: {
        get: function () {
            return `${wizard.saveButton}`;
        }
    },
    deleteButton: {
        get: function () {
            return `${wizard.deleteButton}`;
        }
    },
    waitForSaveButtonEnabled: {
        value: function () {
            return this.waitForEnabled(this.saveButton, appConst.TIMEOUT_3);
        }
    },
    waitForSaveButtonDisabled: {
        value: function () {
            return this.waitForDisabled(this.saveButton, appConst.TIMEOUT_3);
        }
    },
    isSaveButtonEnabled: {
        value: function () {
            return this.isEnabled(this.saveButton);
        }
    },
    isDeleteButtonEnabled: {
        value: function () {
            return this.isEnabled(this.deleteButton);
        }
    },
    typeDisplayName: {
        value: function (displayName) {
            return this.typeTextInInput(this.displayNameInput, displayName);
        }
    },
    clearDisplayNameInput: {
        value: function () {
            return this.clearElement(this.displayNameInput);
        }
    },
    isDisplayNameInputVisible: {
        value: function () {
            return this.isVisible(this.displayNameInput);
        }
    },
    waitAndClickOnSave: {
        value: function () {
            return this.waitForSaveButtonEnabled().then((result)=> {
                return this.doClick(this.saveButton);
            }).pause(400).catch(err=> {
                throw new Error(`Save button is not enabled!` + err);
            })
        }
    },

    clickOnDelete: {
        value: function () {
            return this.doClick(this.deleteButton).catch(err=> {
                console.log(err);
                this.saveScreenshot('err_delete_wizard');
                throw new Error('Error when Delete button has been clicked ' + err);
            });
        }
    },
    isItemInvalid: {
        value: function (displayName) {
            let selector = elements.tabItemByDisplayName(displayName);
            return this.getBrowser().getAttribute(selector, 'class').then(result=> {
                return result.includes("invalid");
            }).catch(err=> {
                throw new Error('tabItem: ' + err);
            });
        }
    },
    waitUntilInvalidIconAppears: {
        value: function (displayName) {
            let selector = elements.tabItemByDisplayName(displayName);
            return this.getBrowser().waitUntil(()=> {
                return this.getBrowser().getAttribute(selector, 'class').then(result=> {
                    return result.includes('invalid');
                });
            }, 3000).then(()=> {
                return true;
            }).catch((err)=> {
                this.saveScreenshot(itemBuilders.generateRandomName("err_icon"));
                throw new Error('group-wizard:invalid-icon should be displayed');
            });
        }
    },
    waitUntilInvalidIconDisappears: {
        value: function (displayName) {
            let selector = elements.tabItemByDisplayName(displayName);
            return this.getBrowser().waitUntil(()=> {
                return this.getBrowser().getAttribute(selector, 'class').then(result=> {
                    return !result.includes('invalid');
                })
            }, 2000).then(()=> {
                return true;
            }).catch((err)=> {
                throw new Error(err);
            });
        }
    },
    doCatch: {
        value: function (screenshotName, errString) {
            this.saveScreenshot(screenshotName);
            throw new Error(errString);
        }
    }
});
module.exports = wizardPanel;


