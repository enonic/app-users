/**
 * Created on 5/30/2017.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const itemBuilders = require('../../libs/userItems.builder');
const XPATH = {
    displayNameInput: `//input[contains(@name,'displayName')]`,
    saveButton: `//button[contains(@id,'ActionButton') and child::span[text()='Save']]`,
    deleteButton: `//button[contains(@id,'ActionButton') and child::span[text()='Delete']]`,
};
class WizardPanel extends Page {

    get displayNameInput() {
        return `${XPATH.displayNameInput}`;
    }

    get saveButton() {
        return `${XPATH.saveButton}`;
    }

    get deleteButton() {
        return `${XPATH.deleteButton}`;
    }

    waitForSaveButtonEnabled() {
        return this.waitForElementEnabled(this.saveButton, appConst.TIMEOUT_3).catch(err => {
            this.saveScreenshot("err_save_button");
            throw new Error(err);
        })
    }

    isSaveButtonEnabled() {
        return this.isElementEnabled(this.saveButton);
    }

    waitForSaveButtonDisabled() {
        return this.waitForElementDisabled(this.saveButton, appConst.TIMEOUT_3);
    }

    waitForDeleteButtonDisabled() {
        return this.waitForElementDisabled(this.deleteButton, appConst.TIMEOUT_3);
    }

    typeDisplayName(displayName) {
        return this.typeTextInInput(this.displayNameInput, displayName);
    }

    clearDisplayNameInput() {
        return this.clearInputText(this.displayNameInput);
    }

    isDisplayNameInputVisible() {
        return this.isElementDisplayed(this.displayNameInput);
    }

    waitAndClickOnSave() {
        return this.waitForSaveButtonEnabled().then(() => {
            return this.clickOnElement(this.saveButton);
        }).then(() => {
            return this.pause(500);
        }).catch(err => {
            throw new Error(`Error when Save button has been clicked!` + err);
        });
    }

    clickOnDeleteButton() {
        return this.clickOnElement(this.deleteButton).catch(err => {
            this.saveScreenshot('err_delete_wizard');
            throw new Error('Error when Delete button has been clicked ' + err);
        });
    }

    isItemInvalid(displayName) {
        let selector = lib.tabItemByDisplayName(displayName);
        return this.getAttribute(selector, 'class').then(result => {
            return result.includes("invalid");
        }).catch(err => {
            throw new Error('tabItem: ' + err);
        });
    }

    waitUntilInvalidIconAppears(displayName) {
        let selector = lib.tabItemByDisplayName(displayName);
        return this.getBrowser().waitUntil(() => {
            return this.getAttribute(selector, 'class').then(result => {
                return result.includes('invalid');
            });
        }, 3000).then(() => {
            return true;
        }).catch(err => {
            this.saveScreenshot(itemBuilders.generateRandomName("err_icon"));
            throw new Error('group-wizard:invalid-icon should be displayed');
        });
    }

    waitUntilInvalidIconDisappears(displayName) {
        let selector = lib.tabItemByDisplayName(displayName);
        return this.getBrowser().waitUntil(() => {
            return this.getAttribute(selector, 'class').then(result => {
                return !result.includes('invalid');
            })
        }, 2000).then(() => {
            return true;
        }).catch(err => {
            throw new Error(err);
        });
    }

    hotKeySave() {
        return this.getBrowser().status().then(status => {
            if (status.os.name.toLowerCase().includes('wind') || status.os.name.toLowerCase().includes('linux')) {
                return this.getBrowser().keys(['Control', 's']);
            }
            if (status.os.name.toLowerCase().includes('mac')) {
                return this.getBrowser().keys(['Command', 's']);

            }
        })
    }

    hotKeyDelete() {
        return this.getBrowser().status().then(status => {
            if (status.os.name.toLowerCase().includes('wind') || status.os.name.toLowerCase().includes('linux')) {
                return this.getBrowser().keys(['Control', 'Delete']);
            }
            if (status.os.name.toLowerCase().includes('mac')) {
                return this.getBrowser().keys(['Command', 'Delete']);
            }
        })
    }
};
module.exports = {WizardPanel, XPATH};


