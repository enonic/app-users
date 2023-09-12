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
            await this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
            return await this.pause(400);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_grid_context_menu');
            throw new Error(`tree grid context menu is not loaded, screenshot: ` + screenshot + '  ' + err);
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


    isEditMenuItemDisabled() {
        return this.getAttribute(XPATH.container + XPATH.editMenuItem, 'class').then(result => {
            return result.includes('disabled');
        });
    }

    async isNewRoleMenuItemDisabled() {
        let result = await this.getAttribute(XPATH.container + XPATH.newRoleMenuItem, 'class');
        return result.includes('disabled');
    }

    async isDeleteMenuItemDisabled() {
        let result = await this.getAttribute(XPATH.deleteMenuItem, 'class');
        return result.includes('disabled');
    }

    async isNewMenuItemDisabled() {
        let result = await this.getAttribute(XPATH.container + XPATH.newMenuItem, 'class');
        return result.includes('disabled');
    }

    // returns array with menu-items
    getGridContextMenuItems() {
        let selector = XPATH.container + lib.LI_MENU_ITEM;
        return this.getTextInElements(selector);
    }

    async clickOnMenuItem(menuItem) {
        try {
            let menuItemLocator = XPATH.container + lib.menuItemByName(menuItem);
            await this.waitForElementDisplayed(menuItemLocator, appConst.mediumTimeout);
            await this.clickOnElement(menuItemLocator);
            await this.pause(500);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_menu_item');
            throw Error('Menu Item, screenshot  ' + screenshot + ' ' + err);
        }
    }
}

module.exports = GridContextMenu;

