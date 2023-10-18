/**
 * Created on 5/30/2017.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const XPATH = {
    displayNameInput: `//input[contains(@name,'displayName')]`,
    saveButton: "//button[contains(@id,'ActionButton') and child::span[text()='Save']]",
    deleteButton: "//button[contains(@id,'ActionButton') and child::span[text()='Delete']]",
};

class WizardPanel extends Page {

    get displayNameInput() {
        return XPATH.displayNameInput;
    }

    get saveButton() {
        return XPATH.saveButton;
    }

    get deleteButton() {
        return XPATH.deleteButton;
    }

    async waitForSaveButtonEnabled() {
        try {
            return await this.waitForElementEnabled(this.saveButton, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_wizard_save_btn');
            throw new Error('Save button should be enabled, screenshot: ' + screenshot + ' ' + err);
        }
    }

    isSaveButtonEnabled() {
        return this.isElementEnabled(this.saveButton);
    }

    async waitForSaveButtonDisabled() {
        try {
            return await this.waitForElementDisabled(this.saveButton, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_wizard_save_btn');
            throw new Error('Save button should be disabled, screenshot: ' + screenshot + ' ' + err);
        }
    }

    waitForDeleteButtonDisabled() {
        return this.waitForElementDisabled(this.deleteButton, appConst.mediumTimeout);
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

    async waitAndClickOnSave() {
        try {
            await this.waitForElementEnabled(this.saveButton, appConst.mediumTimeout);
            await this.clickOnElement(this.saveButton);
            return await this.pause(500);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_wizard_save_btn');
            throw new Error('Error during clicking on Save, screenshot: ' + screenshot + ' ' + err);
        }
    }

    async clickOnDeleteButton() {
        try {
            await this.clickOnElement(this.deleteButton)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_delete_wizard');
            throw new Error('Error during clicking on Delete button, screenshot: ' + screenshot + ' ' + err);
        }
    }

    async isItemInvalid(displayName) {
        try {
            let selector = lib.tabItemByDisplayName(displayName);
            let result = await this.getAttribute(selector, 'class');
            return result.includes('invalid');
        } catch (err) {
            throw new Error('tabItem: ' + err);
        }
    }

    waitUntilInvalidIconAppears(displayName) {
        let selector = lib.tabItemByDisplayName(displayName);
        return this.getBrowser().waitUntil(() => {
            return this.getAttribute(selector, 'class').then(result => {
                return result.includes('invalid');
            });
        }, {timeout: 10000, timeoutMsg: "Group-wizard:invalid-icon should be displayed"});

    }

    waitUntilInvalidIconDisappears(displayName) {
        let selector = lib.tabItemByDisplayName(displayName);
        return this.getBrowser().waitUntil(() => {
            return this.getAttribute(selector, 'class').then(result => {
                return !result.includes('invalid');
            })
        }, {timeout: appConst.mediumTimeout, timeoutMsg: "Invalid icon should not be displayed", interval: 500});
    }

    hotKeySave() {
        return this.getBrowser().status().then(status => {
            return this.getBrowser().keys(['Control', 's']);
        })
    }

    hotKeyDelete() {
        return this.getBrowser().status().then(status => {
            return this.getBrowser().keys(['Control', 'Delete']);
        })
    }
}

module.exports = {WizardPanel, XPATH};


