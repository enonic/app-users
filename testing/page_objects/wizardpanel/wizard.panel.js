/**
 * Created on 5/30/2017.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const {Key} = require('webdriverio');
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
            await this.handleError('Save button should be enabled', 'err_save_button', err);
        }
    }

    isSaveButtonEnabled() {
        return this.isElementEnabled(this.saveButton);
    }

    waitForSaveButtonDisabled() {
        return this.waitForElementDisabled(this.saveButton, appConst.mediumTimeout);
    }

    waitForDeleteButtonDisabled() {
        return this.waitForElementDisabled(this.deleteButton, appConst.mediumTimeout);
    }

    async typeDisplayName(displayName) {
        try {
            await this.typeTextInInput(this.displayNameInput, displayName);
            await this.pause(500);
        } catch (err) {
            await this.handleError('Wizard panel, display name input', 'err_displayName_input', err);
        }
    }

    clearDisplayNameInput() {
        return this.clearInputText(this.displayNameInput);
    }

    isDisplayNameInputVisible() {
        return this.isElementDisplayed(this.displayNameInput);
    }

    async waitAndClickOnSave() {
        try {
            await this.waitForSaveButtonEnabled();
            await this.clickOnElement(this.saveButton);
            return await this.pause(700);
        } catch (err) {
            await this.handleError('Click on Save button', 'err_click_save_button', err);
        }
    }

    async clickOnDeleteButton() {
        try {
            await this.clickOnElement(this.deleteButton)
        } catch (err) {
            await this.handleError('Wizard toolbar - Click on Delete button', 'err_click_delete_button', err);
        }
    }

    async isItemInvalid(displayName) {
        try {
            let selector = lib.tabItemByDisplayName(displayName);
            let result = await this.getAttribute(selector, 'class');
            return result.includes('invalid');
        } catch (err) {
            await this.handleError('tabItem invalid check', 'err_tabItem_invalid_check', err);
        }
    }

    async waitUntilInvalidIconDisplayed(displayName) {
        let selector = lib.tabItemByDisplayName(displayName);
        return await this.browser.waitUntil(async () => {
            let result = await this.getAttribute(selector, 'class');
            return result.includes('invalid');
        }, {timeout: appConst.mediumTimeout, timeoutMsg: 'invalid-icon should be displayed in the wizard'});
    }

    waitUntilInvalidIconDisappears(displayName) {
        let selector = lib.tabItemByDisplayName(displayName);
        return this.getBrowser().waitUntil(() => {
            return this.getAttribute(selector, 'class').then(result => {
                return !result.includes('invalid');
            })
        }, {timeout: appConst.mediumTimeout, timeoutMsg: "Invalid icon should not be displayed", interval: 500});
    }

    async hotKeySave() {
        const isMacOS = await this.isMacOS();
        const keyCombination = isMacOS ? [Key.Command, 's'] : [Key.Ctrl, 's'];
        return await this.getBrowser().keys(keyCombination);
    }

    async hotKeyDelete() {
        const isMacOS = await this.isMacOS();
        const keyCombination = isMacOS ? [Key.Command, Key.Delete] : [Key.Ctrl, Key.Delete];
        return await this.getBrowser().keys(keyCombination);
    }
}

module.exports = {WizardPanel, XPATH};


