/**
 * Created on 5/31/2017.
 */
const Page = require('../page');
const ConfirmationDialog = require('../confirmation.dialog');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const itemBuilder = require('../../libs/userItems.builder');

const xpath = {
    container: "//div[contains(@id,'UserBrowsePanel')]",
    selectionToggler: "//button[contains(@id,'SelectionPanelToggler')]",
    selectionControllerCheckBox: "//div[contains(@id,'SelectionController')]",
    toolbar: "//div[contains(@id,'UserBrowseToolbar')]",
    grid: "//div[contains(@class,'grid-canvas')]",
    treeGridToolbar: `//div[contains(@id,'TreeGridToolbar')]`,
    searchButton: "//button[contains(@class, 'icon-search')]",
    hideFilterPanelButton: "//span[contains(@class, 'hide-filter-panel-button')]",
    appHomeButton: "//div[contains(@id,'TabbedAppBar')]/div[contains(@class,'home-button')]",
    rowByName: function (name) {
        return `//div[contains(@id,'NamesView') and child::p[contains(@class,'sub-name') and contains(.,'${name}')]]`
    },
    rowByDisplayName:
        displayName => `//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`,
    checkboxByName: function (name) {
        return `${lib.itemByName(name)}` +
               `/ancestor::div[contains(@class,'slick-row')]/div[contains(@class,'slick-cell-checkboxsel')]/label`
    },

    checkboxByDisplayName: function (displayName) {
        return `${lib.itemByDisplayName(displayName)}` +
               `/ancestor::div[contains(@class,'slick-row')]/div[contains(@class,'slick-cell-checkboxsel')]/label`
    },

    expanderIconByName: function (name) {
        return this.rowByName(name) +
               `/ancestor::div[contains(@class,'slick-cell')]/span[contains(@class,'collapse') or contains(@class,'expand')]`;

    },
    closeItemTabButton: function (name) {
        return `//div[contains(@id,'AppBar')]//li[contains(@id,'AppBarTabMenuItem') and child::a[@class='label' and text() ='${name}']]/button`;
    },
    itemTabByDisplayName:
        displayName => `//div[contains(@id,'AppBar')]//li[contains(@id,'AppBarTabMenuItem') and child::a[@class='label' and text() ='${displayName}']]`,

};

class UserBrowsePanel extends Page {
    get newButton() {
        return xpath.toolbar + "/*[contains(@id, 'ActionButton') and child::span[contains(.,'New')]]";
    }

    get selectionToggler() {
        return xpath.container + xpath.selectionToggler;
    }

    get appHomeButton() {
        return xpath.appHomeButton;
    }

    get searchButton() {
        return xpath.toolbar + xpath.searchButton;
    }

    get hideFilterPanelButton() {
        return "//div[contains(@id,'PrincipalBrowseFilterPanel')]" + xpath.hideFilterPanelButton;
    }

    get editButton() {
        return `${xpath.toolbar}/*[contains(@id, 'ActionButton') and child::span[text()='Edit']]`;
    }


    get deleteButton() {
        return `${xpath.toolbar}/*[contains(@id, 'ActionButton') and child::span[text()='Delete']]`;
    }

    get selectionControllerCheckBox() {
        return xpath.treeGridToolbar + xpath.selectionControllerCheckBox;
    }

    waitForPanelVisible(ms) {
        return this.waitForElementDisplayed(xpath.toolbar, ms).catch(err => {
            throw new Error('User browse panel was not loaded in ' + ms);
        });
    }

    clickOnNewButton() {
        return this.waitForElementEnabled(this.newButton, appConst.TIMEOUT_3).catch(err => {
            throw new Error("New button is not enabled!" + err);
        }).then(() => {
            return this.clickOnElement(this.newButton);
        });
    }

    waitForUsersGridLoaded(ms) {
        return this.waitForElementDisplayed(xpath.grid, ms).then(() => {
            return this.waitForSpinnerNotVisible();
        }).then(() => {
            return console.log('user browse panel is loaded')
        }).catch(err => {
            this.saveScreenshot("err_load_grid");
            throw new Error('users browse panel was not loaded in: ' + ms + " " + err);
        });
    }

    isItemDisplayed(itemName) {
        return this.waitForElementDisplayed(xpath.rowByName(itemName), appConst.TIMEOUT_2).catch(err => {
            console.log("item is not displayed:" + itemName + +" " + err);
            return false;
        });
    }

    waitForItemNotDisplayed(itemName) {
        return this.waitForElementNotDisplayed(xpath.rowByName(itemName), appConst.TIMEOUT_2).catch(err => {
            console.log("item is still displayed:" + itemName);
            return false;
        });
    }

    clickOnRowByName(name) {
        let nameXpath = xpath.rowByName(name);
        return this.clickOnElement(nameXpath, appConst.TIMEOUT_3).catch(err => {
            this.saveScreenshot('err_find_' + name);
            throw Error('Row with the name ' + name + ' was not found.  ' + err);
        }).then(() => {
            return this.pause(500);
        });
    }

    waitForFolderUsersVisible() {
        return this.waitForElementDisplayed(xpath.rowByName('users'), appConst.TIMEOUT_2).catch(() => {
            console.log("element is not visible: row with Users");
            throw new Error(`Users folder was not found! ` + err);
        });
    }

    clickOnSearchButton() {
        return this.clickOnElement(this.searchButton);
    }

    clickOnHideFilterButton() {
        return this.clickOnElement(this.hideFilterPanelButton).catch(err => {
            this.saveScreenshot('err_click_on_hide_filter_button');
            throw new Error(err);
        })
    }

    clickOnAppHomeButton() {
        return this.clickOnElement(this.appHomeButton).catch(err => {
            throw new Error('err: AppHome button ' + err);
        }).then(() => {
            return this.pause(500);
        })
    }

    clickOnEditButton() {
        return this.waitForEditButtonEnabled().then(() => {
            return this.clickOnElement(this.editButton);
        }).catch(err => {
            this.saveScreenshot('err_browsepanel_edit');
            throw new Error('Error when clicking on Edit button ! ' + err);
        })
    }

    clickOnDeleteButton() {
        return this.clickOnElement(this.deleteButton).catch(err => {
            this.saveScreenshot('err_browsepanel_delete_button');
            throw new Error('Error when clicking on Delete button ! ' + err);
        })
    }

    isSearchButtonDisplayed() {
        return this.isElementDisplayed(this.searchButton);
    }

    waitForNewButtonEnabled() {
        return this.waitForElementEnabled(this.newButton, appConst.TIMEOUT_3);
    }

    waitForEditButtonEnabled() {
        return this.waitForElementEnabled(this.editButton, appConst.TIMEOUT_3);
    }

    waitForDeleteButtonEnabled() {
        return this.waitForElementEnabled(this.deleteButton, appConst.TIMEOUT_3).catch(err => {
            this.saveScreenshot("err_delete_button_not_enabled");
            throw new Error('Delete button is not enabled ! ' + err);
        });
    }

    waitForDeleteButtonDisabled() {
        return this.waitForElementDisabled(this.deleteButton, appConst.TIMEOUT_3);
    }

    isEditButtonEnabled() {
        return this.waitForElementEnabled(this.editButton, appConst.TIMEOUT_2);
    }

    waitForEditButtonDisabled() {
        return this.waitForElementDisabled(this.editButton, appConst.TIMEOUT_2);
    }

    waitForRowByNameVisible(name) {
        let nameXpath = xpath.rowByName(name);
        return this.waitForElementDisplayed(nameXpath, appConst.TIMEOUT_3).catch(err => {
            this.saveScreenshot('err_find_' + name);
            throw Error('Row with the name ' + name + ' is not visible in ' + 3000 + 'ms')
        })
    }

    clickCheckboxAndSelectRowByDisplayName(displayName) {
        let displayNameXpath = xpath.checkboxByDisplayName(displayName);
        return this.waitForElementDisplayed(displayNameXpath, appConst.TIMEOUT_2).then(() => {
            return this.clickOnElement(displayNameXpath);
        }).catch(err => {
            this.saveScreenshot('err_find_item');
            throw Error('Row with the displayName ' + displayName + ' was not found')
        })
    }

    doClickOnCloseTabButton(displayName) {
        let closeIcon = `${xpath.closeItemTabButton(displayName)}`;
        return this.waitForElementDisplayed(closeIcon, appConst.TIMEOUT_4).then(() => {
            return this.clickOnElement(closeIcon);
        }).catch(err => {
            this.saveScreenshot('err_closing_' + itemBuilder.generateRandomNumber());
            throw new Error('itemTabButton was not found! ' + displayName + '  ' + err);
        })
    }

    hotKeyNew() {
        return this.browser.status().then(status => {
            if (status.os.name.toLowerCase().includes('wind') || status.os.name.toLowerCase().includes('linux')) {
                return this.browser.keys(['Control', 'Alt', 'n']);
            }
            if (status.os.name.toLowerCase().includes('mac')) {
                return this.browser.keys(['Command', 'Alt', 'n']);
            }
        })
    }

    hotKeyEdit() {
        return this.browser.keys(['F4']);
    }

    hotKeyDelete() {
        return this.browser.status().then(status => {
            if (status.os.name.toLowerCase().includes('wind') || status.os.name.toLowerCase().includes('linux')) {
                return this.browser.keys(['Control', 'Delete']);
            }
            if (status.os.name.toLowerCase().includes('mac')) {
                return this.browser.keys(['Command', 'Delete']);
            }
        })
    }

    //Click on existing Tab-Item and navigates to the opened wizard:
    async clickOnTabBarItem(displayName) {
        let tabItem = xpath.itemTabByDisplayName(displayName);
        await this.waitForElementDisplayed(tabItem, appConst.TIMEOUT_3);
        return await this.clickOnElement(tabItem);
    }

    async doClickOnCloseTabAndWaitGrid(displayName) {
        try {
            let closeIcon = xpath.closeItemTabButton(displayName);
            await this.waitForElementDisplayed(closeIcon, appConst.TIMEOUT_2);
            await this.waitForElementEnabled(closeIcon, appConst.TIMEOUT_2);
            await this.clickOnElement(closeIcon);
        } catch (err) {
            this.saveScreenshot('err_closing_' + itemBuilder.generateRandomNumber());
            throw new Error('Item Tab Button was not found!' + displayName + "  " + err);
        }
        await this.pause(300);
        let confirmationDialog = new ConfirmationDialog();
        let isLoaded = await confirmationDialog.isDialogLoaded();
        if (isLoaded) {
            this.saveScreenshot('err_save_close_item');
            console.log('confirmation dialog must not be loaded');
            throw new Error('Confirmation dialog should not appear when try to close the ' + displayName);
        }
        await this.waitForSpinnerNotVisible();
        return await this.waitForUsersGridLoaded(appConst.TIMEOUT_3);
    }

    clickOnExpanderIcon(name) {
        let expanderIcon = xpath.expanderIconByName(name);
        return this.clickOnElement(expanderIcon);
    }

    getGridItemDisplayNames() {
        let selector = xpath.container + lib.SLICK_ROW + lib.H6_DISPLAY_NAME;
        return this.getTextInElements(selector);
    }

    waitForSelectionTogglerVisible() {
        let selector = xpath.container + xpath.selectionToggler;
        return this.getBrowser().waitUntil(() => {
            return this.getAttribute(selector, 'class').then(result => {
                return result.includes('any-selected');
            })
        }, appConst.TIMEOUT_3, 'expected style not present after 3s');
    }

    //Click on Show/Hide selections
    async clickOnSelectionToggler() {
        let selector = xpath.container + xpath.selectionToggler;
        await this.clickOnElement(selector);
        return await this.pause(1000);
    }

    isSelectionTogglerVisible() {
        let selector = xpath.container + xpath.selectionToggler;
        return this.getAttribute(selector, 'class').then(result => {
            return result.includes('any-selected');
        });
    }

    getNumberInSelectionToggler() {
        let selector = xpath.selectionToggler + `/span`;
        return this.getText(selector);
    }

    rightClickOnRowByDisplayName(displayName) {
        const selector = xpath.rowByDisplayName(displayName);
        return this.waitForElementDisplayed(selector, appConst.TIMEOUT_3).then(() => {
            return this.doRightClick(selector);
        }).catch(err => {
            this.saveScreenshot(`err_find_${displayName}`);
            throw Error(`Row with the name ${displayName} was not found  ` + err);
        })
    }

    //Wait for Selection Controller checkBox gets 'partial', then returns true, otherwise exception will be thrown
    async waitForSelectionControllerPartial() {
        let selector = this.selectionControllerCheckBox + "//input[@type='checkbox']";
        await this.getBrowser().waitUntil(async () => {
            let text = await this.getAttribute(selector, "class");
            return text.includes('partial');
        }, appConst.TIMEOUT_2, "Selection Controller checkBox should displayed as partial");
        return true;
    }

    // returns true if 'Selection Controller' checkbox is selected:
    isSelectionControllerSelected() {
        let locator = this.selectionControllerCheckBox + "//input[@type='checkbox']";
        return this.isSelected(locator);
    }

    async clickOnSelectionControllerCheckbox() {
        try {
            await this.clickOnElement(this.selectionControllerCheckBox);
            return await this.pause(300);
        } catch (err) {
            this.saveScreenshot('err_click_on_selection_controller');
            throw new Error('error when click on selection_controller ' + err);
        }
    }
}

module.exports = UserBrowsePanel;
