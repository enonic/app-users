/**
 * Created on 5/31/2017.
 */
const page = require('../page');
const saveBeforeCloseDialog = require('../save.before.close.dialog');
const elements = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const itemBuilder = require('../../libs/userItems.builder');

const panel = {
    container: `//div[contains(@id,'UserBrowsePanel')]`,
    selectionToggler: `//button[contains(@id,'SelectionPanelToggler')]`,
    toolbar: `//div[contains(@id,'UserBrowseToolbar')]`,
    grid: `//div[@class='grid-canvas']`,
    searchButton: "//button[contains(@class, 'icon-search')]",
    hideFilterPanelButton: "//span[contains(@class, 'hide-filter-panel-button')]",
    appHomeButton: "//div[contains(@id,'TabbedAppBar')]/div[contains(@class,'home-button')]",

    rowByName: function (name) {
        return `//div[contains(@id,'NamesView') and child::p[contains(@class,'sub-name') and contains(.,'${name}')]]`
    },
    rowByDisplayName:
        displayName => `//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`,
    checkboxByName: function (name) {
        return `${elements.itemByName(name)}` +
               `/ancestor::div[contains(@class,'slick-row')]/div[contains(@class,'slick-cell-checkboxsel')]/label`
    },

    checkboxByDisplayName: function (displayName) {
        return `${elements.itemByDisplayName(displayName)}` +
               `/ancestor::div[contains(@class,'slick-row')]/div[contains(@class,'slick-cell-checkboxsel')]/label`
    },

    expanderIconByName: function (name) {
        return this.rowByName(name) +
               `/ancestor::div[contains(@class,'slick-cell')]/span[contains(@class,'collapse') or contains(@class,'expand')]`;

    },
    closeItemTabButton: function (name) {
        return `//div[contains(@id,'AppBar')]//li[contains(@id,'AppBarTabMenuItem') and child::a[@class='label' and text() ='${name}']]/button`;
    },
};
const userBrowsePanel = Object.create(page, {

    //Getters
    selectionToggler: {
        get: function () {
            return `${panel.container}` + `${panel.selectionToggler}`
        }
    },
    appHomeButton: {
        get: function () {
            return `${panel.appHomeButton}`;
        }
    },
    searchButton: {
        get: function () {
            return `${panel.toolbar}` + `${panel.searchButton}`;
        }
    },
    hideFilterPanelButton: {
        get: function () {
            return `//div[contains(@id,'PrincipalBrowseFilterPanel')]` + `${panel.hideFilterPanelButton}`;
        }
    },
    newButton: {
        get: function () {
            return `${panel.toolbar}/*[contains(@id, 'ActionButton') and child::span[contains(.,'New')]]`
        }
    },
    editButton: {
        get: function () {
            return `${panel.toolbar}/*[contains(@id, 'ActionButton') and child::span[text()='Edit']]`;
        }
    },

    deleteButton: {
        get: function () {
            return `${panel.toolbar}/*[contains(@id, 'ActionButton') and child::span[text()='Delete']]`;
        }
    },

    waitForPanelVisible: {
        value: function (ms) {
            return this.waitForVisible(`${panel.toolbar}`, ms).catch(err => {
                throw new Error('User browse panel was not loaded in ' + ms);
            });
        }
    },
    isItemDisplayed: {
        value: function (itemName) {
            return this.waitForVisible(`${panel.rowByName(itemName)}`, 1000).catch(err => {
                console.log("item is not displayed:" + itemName);
                return false;
            });
        }
    },
    waitForItemNotDisplayed: {
        value: function (itemName) {
            return this.waitForNotVisible(`${panel.rowByName(itemName)}`, 1000).catch(err => {
                console.log("item is still displayed:" + itemName);
                return false;
            });
        }
    },
    waitForFolderUsersVisible: {
        value: function () {
            return this.waitForVisible(`${panel.rowByName('users')}`, 1000).catch(() => {
                console.log("element is not visible: row with Users");
                throw new Error(`element was not found! Users folder was not found! `);
            });
        }
    },
    waitForUsersGridLoaded: {
        value: function (ms) {
            return this.waitForVisible(`${panel.grid}`, ms).then(() => {
                return this.waitForSpinnerNotVisible();
            }).then(() => {
                return console.log('user browse panel is loaded')
            }).catch(err => {
                this.saveScreenshot("err_load_grid");
                throw new Error('users browse panel was not loaded in: ' + ms);
            });
        }
    },
    clickOnSearchButton: {
        value: function () {
            return this.doClick(this.searchButton);
        }
    },
    clickOnHideFilterButton: {
        value: function () {
            return this.waitForVisible(this.hideFilterPanelButton, appConst.TIMEOUT_3).then(() => {
                return this.doClick(this.hideFilterPanelButton);
            }).catch(err => {
                this.saveScreenshot('err_click_on_hide_filter_button');
                throw new Error(err);
            })

        }
    },
    clickOnAppHomeButton: {
        value: function () {
            return this.doClick(this.appHomeButton).catch(err => {
                throw new Error('err: AppHome button ' + err);
            }).pause(500);
        }
    },
    clickOnNewButton: {
        value: function () {
            return this.waitForEnabled(this.newButton, appConst.TIMEOUT_3).then(() => {
                return this.doClick(this.newButton);
            }).catch(err => {
                throw new Error('New button is not enabled! ' + err);
            })
        }
    },
    clickOnEditButton: {
        value: function () {
            return this.waitForEnabled(this.editButton, appConst.TIMEOUT_3).then(() => {
                return this.doClick(this.editButton);
            }).catch(err => {
                this.saveScreenshot('err_browsepanel_edit');
                throw new Error('Edit button is not enabled! ' + err);
            })
        }
    },
    clickOnDeleteButton: {
        value: function () {
            return this.waitForEnabled(this.deleteButton, appConst.TIMEOUT_3).then(() => {
                return this.doClick(this.deleteButton);
            }).catch(err => {
                this.saveScreenshot('err_browsepanel_delete');
                throw new Error('Delete button should be enabled! ' + err);
            })
        }
    },
    isSearchButtonDisplayed: {
        value: function () {
            return this.isVisible(this.searchButton);
        }
    },
    waitForNewButtonEnabled: {
        value: function () {
            return this.waitForEnabled(this.newButton, appConst.TIMEOUT_3);
        }
    },

    waitForEditButtonEnabled: {
        value: function () {
            return this.waitForEnabled(this.editButton, appConst.TIMEOUT_3);
        }
    },
    waitForDeleteButtonEnabled: {
        value: function () {
            return this.waitForEnabled(this.deleteButton, appConst.TIMEOUT_3).catch(err => {
                return this.doCatch('err_delete_button_state', err);
            });
        }
    },
    waitForDeleteButtonDisabled: {
        value: function () {
            return this.waitForDisabled(this.deleteButton, appConst.TIMEOUT_3);
        }
    },

    isDeleteButtonEnabled: {
        value: function () {
            return this.isEnabled(this.deleteButton);
        }
    },
    isNewButtonEnabled: {
        value: function () {
            return this.isEnabled(this.newButton);
        }
    },
    isEditButtonEnabled: {
        value: function () {
            return this.isEnabled(this.editButton);
        }
    },
    clickOnRowByName: {
        value: function (name) {
            let nameXpath = panel.rowByName(name);
            return this.waitForVisible(nameXpath, appConst.TIMEOUT_3).then(() => {
                return this.doClick(nameXpath);
            }).pause(500).catch(err => {
                this.saveScreenshot('err_find_' + name);
                throw Error('Row with the name ' + name + ' was not found.  ' + err);
            })
        }
    },
    waitForRowByNameVisible: {
        value: function (name) {
            let nameXpath = panel.rowByName(name);
            return this.waitForVisible(nameXpath, appConst.TIMEOUT_3)
                .catch(err => {
                    this.saveScreenshot('err_find_' + name);
                    throw Error('Row with the name ' + name + ' is not visible after ' + 3000 + 'ms')
                })
        }
    },
    clickCheckboxAndSelectRowByDisplayName: {
        value: function (displayName) {
            let displayNameXpath = panel.checkboxByDisplayName(displayName);
            return this.waitForVisible(displayNameXpath, appConst.TIMEOUT_2).then(() => {
                return this.doClick(displayNameXpath);
            }).catch(err => {
                this.saveScreenshot('err_find_item');
                throw Error('Row with the displayName ' + displayName + ' was not found')
            })
        }
    },
    doClickOnCloseTabButton: {
        value: function (displayName) {
            let closeIcon = `${panel.closeItemTabButton(displayName)}`;
            return this.waitForVisible(closeIcon).then(() => {
                return this.doClick(closeIcon);
            }).catch(err => {
                this.saveScreenshot('err_closing_' + itemBuilder.generateRandomNumber());
                throw new Error('itemTabButton was not found! ' + displayName + '  ' + err);
            })

        }
    },
    doClickOnCloseTabAndWaitGrid: {
        value: function (displayName) {
            let closeIcon = `${panel.closeItemTabButton(displayName)}`;
            return this.waitForVisible(closeIcon).then(() => {
                return this.waitForEnabled(closeIcon, appConst.TIMEOUT_4);
            }).then(() => {
                return this.doClick(closeIcon);
            }).catch(err => {
                this.saveScreenshot('err_closing_' + itemBuilder.generateRandomNumber());
                throw new Error('itemTabButton was not found!' + displayName + "  " + err);
            }).pause(300).then(() => {
                return saveBeforeCloseDialog.isDialogPresent(1000);
            }).then(result => {
                if (result) {
                    this.saveScreenshot('err_save_close_item').then(() => {
                        console.log('save before close dialog must not be present');
                        throw new Error('`Save Before Close` dialog should not appear when try to close the ' + displayName);
                    });
                }
            }).then(() => {
                return this.waitForSpinnerNotVisible();
            }).then(() => {
                return this.waitForUsersGridLoaded(appConst.TIMEOUT_3);
            })
        }
    },
    clickOnExpanderIcon: {
        value: function (name) {
            let expanderIcon = panel.expanderIconByName(name);
            return this.doClick(expanderIcon);
        }
    },
    getGridItemDisplayNames: {
        value: function () {
            let selector = `${panel.container}` + `${elements.SLICK_ROW}` + `${elements.H6_DISPLAY_NAME}`;
            return this.getTextFromElements(selector);
        }
    },
    waitForSelectionTogglerVisible: {
        value: function () {
            let selector = `${panel.container}` + `${panel.selectionToggler}`;
            return this.getBrowser().waitUntil(function () {
                return this.getAttribute(selector, 'class').then(result => {
                    return result.includes('any-selected');
                })
            }, appConst.TIMEOUT_3, 'expected style not present after 3s');
        }
    },
    clickOnSelectionToggler: {
        value: function () {
            let selector = `${panel.container}` + `${panel.selectionToggler}`;
            return this.doClick(selector);
        }
    },

    isSelectionTogglerVisible: {
        value: function () {
            let selector = `${panel.container}` + `${panel.selectionToggler}`;
            return this.getAttribute(selector, 'class').then(result => {
                return result.includes('any-selected');
            });
        }
    },
    getNumberInSelectionToggler: {
        value: function () {
            let selector = `${panel.selectionToggler}` + `/span`;
            return this.getText(selector);
        }
    },
    doCatch: {
        value: function (screenshotName, errString) {
            this.saveScreenshot(screenshotName);
            throw new Error(errString);
        }
    },
    rightClickOnRowByDisplayName: {
        value: function (displayName) {
            const selector = panel.rowByDisplayName(displayName);
            return this.waitForVisible(selector, appConst.TIMEOUT_3).then(() => {
                return this.doRightClick(selector);
            }).pause(400).catch(() => {
                this.saveScreenshot(`err_find_${displayName}`);
                throw Error(`Row with the name ${displayName} was not found`);
            })
        }
    },
    hotKeyNew: {
        value: function () {
            return this.getBrowser().status().then(status => {
                if (status.value.os.name.toLowerCase().includes('wind') || status.value.os.name.toLowerCase().includes('linux')) {
                    return this.getBrowser().keys(['Control', 'Alt', 'n']);
                }
                if (status.value.os.name.toLowerCase().includes('mac')) {
                    return this.getBrowser().keys(['Command', 'Alt', 'n']);
                }
            })
        }
    },
    hotKeyEdit: {
        value: function () {
            return this.getBrowser().keys(['F4']);
        }
    },
    hotKeyDelete: {
        value: function () {
            return this.getBrowser().status().then(status => {
                if (status.value.os.name.toLowerCase().includes('wind') || status.value.os.name.toLowerCase().includes('linux')) {
                    return this.getBrowser().keys(['Control', 'Delete']);
                }
                if (status.value.os.name.toLowerCase().includes('mac')) {
                    return this.getBrowser().keys(['Command', 'Delete']);
                }
            })
        }
    },
});
module.exports = userBrowsePanel;


