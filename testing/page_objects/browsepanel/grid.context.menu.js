/**
 * Created on 12/01/2017.
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const lib = require('../../libs/elements');

const XPATH = {
    container: `//ul[contains(@id,'TreeGridContextMenu')]`,
    deleteMenuItem: `//li[contains(@id,'MenuItem') and text()='Delete']`,
    editMenuItem: `//li[contains(@id,'MenuItem') and text()='Edit']`,
    newMenuItem: `//li[contains(@id,'MenuItem') and text()='New...']`,
    newRoleMenuItem: `//li[contains(@id,'MenuItem') and text()='New Role']`,
};

class GridContextMenu extends Page {

    async waitForContextMenuVisible() {
        try {
            await this.waitUntilDisplayed(XPATH.container, appConst.mediumTimeout);
            return await this.pause(200);
        } catch (err) {
            await this.handleError('Tree grid context menu was not loaded', 'err_grid_context_menu', err);
        }
    }

    waitForDeleteMenuItemDisabled() {
        return this.getBrowser().waitUntil(() => {
            return this.getAttribute(XPATH.container + XPATH.deleteMenuItem, 'class').then(result => {
                return result.includes('disabled');
            });
        }, {timeout: appConst.mediumTimeout, timeoutMsg: 'Grid context menu - Delete menu item is not disabled after 3 seconds'});
    }

    waitForEditMenuItemDisabled() {
        let selector = XPATH.container + XPATH.editMenuItem;
        return this.getBrowser().waitUntil(() => {
            return this.getAttribute(selector, 'class').then(result => {
                return result.includes('disabled');
            })
        }, {timeout: appConst.mediumTimeout, timeoutMsg: 'Grid context menu - Edit menu item is not enabled after 3 seconds'});
    }

    async waitForMenuItemEnabled(menuItem) {
        try {
            let locator = XPATH.container + lib.menuItemByName(menuItem);
            await this.getBrowser().waitUntil(async () => {
                let text = await this.getAttribute(locator, 'class');
                return !text.includes('disabled');
            }, {timeout: appConst.shortTimeout, timeoutMsg: 'Context menu item should be enabled'});
        } catch (err) {
            await this.handleError('The grid-context menu item should be enabled', 'err_menu_item_enabled_check', err);
        }
    }

    async waitForMenuItemDisabled(menuItem) {
        try {
            let locator = XPATH.container + lib.menuItemByName(menuItem);
            await this.getBrowser().waitUntil(async () => {
                let text = await this.getAttribute(locator, 'class');
                return text.includes('disabled');
            }, {timeout: appConst.shortTimeout, timeoutMsg: 'Context menu item should be enabled'});
        } catch (err) {
            await this.handleError('The grid-context menu item should be disabled', 'err_menu_item_disabled_check', err);
        }
    }

    // returns array with menu-items
    getGridContextMenuItems() {
        let selector = XPATH.container + lib.LI_MENU_ITEM;
        return this.getTextInElements(selector);
    }

    async clickOnMenuItem(menuItem) {
        try {
            let menuItemLocator = XPATH.container + lib.menuItemByName(menuItem);
            await this.waitUntilDisplayed(menuItemLocator, appConst.mediumTimeout);
            let elements = await this.getDisplayedElements(menuItemLocator);
            await elements[0].click();
            await this.pause(300);
        } catch (err) {
            await this.handleError(`Grid Context Menu - Clicked on the item: '${menuItem}'`, 'err_grid_context_menu_click_item', err);
        }
    }
}

module.exports = GridContextMenu;

