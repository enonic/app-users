/**
 * Created on 12/01/2017.
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: `//ul[contains(@id,'TreeGridContextMenu')]`,
    contextMenuItems: `//li[contains(@id,'MenuItem')]`,
    deleteMenuItem: `//li[contains(@id,'MenuItem') and text()='Delete']`,
    editMenuItem: `//li[contains(@id,'MenuItem') and text()='Edit']`,
    newMenuItem: `//li[contains(@id,'MenuItem') and text()='New...']`,
    newRoleMenuItem: `//li[contains(@id,'MenuItem') and text()='New Role']`,
};

class GridContextMenu extends Page {

    waitForContextMenuVisible() {
        return this.waitForElementDisplayed(XPATH.container, appConst.TIMEOUT_3).catch(err => {
            this.saveScreenshot('err_grid_context_menu');
            throw new Error(`tree grid context menu is not loaded ` + err);
        });
    }

    waitForDeleteMenuItemDisabled() {
        return this.getBrowser().waitUntil(() => {
            return this.getAttribute(XPATH.container + XPATH.deleteMenuItem, 'class').then(result => {
                return result.includes('disabled');
            });
        }, 2000, 'Grid context menu - Delete menu item is not disabled after 3 seconds');
    }

    waitForEditMenuItemDisabled() {
        let selector = XPATH.container + XPATH.editMenuItem;
        return this.getBrowser().waitUntil(() => {
            return this.getAttribute(selector, 'class').then(result => {
                return result.includes('disabled');
            })
        }, appConst.TIMEOUT_3, 'Grid context menu - Edit menu item is not enabled after 3 seconds');
    }

    isEditMenuItemDisabled() {
        return this.getAttribute(XPATH.container + XPATH.editMenuItem, 'class').then(result => {
            return result.includes('disabled');
        });
    }

    isNewRoleMenuItemDisabled() {
        return this.getAttribute(XPATH.container + XPATH.newRoleMenuItem, 'class').then(result => {
            return result.includes('disabled');
        });
    }

    isDeleteMenuItemDisabled() {
        return this.getAttribute(XPATH.deleteMenuItem, 'class').then(result => {
            return result.includes('disabled');
        });
    }

    isNewMenuItemDisabled() {
        return this.getAttribute(XPATH.container + XPATH.newMenuItem, 'class').then(result => {
            return result.includes('disabled');
        });
    }

    //returns array with menu-items
    getGridContextMenuItems() {
        let selector = XPATH.container + XPATH.contextMenuItems;
        return this.getTextInElements(selector);
    }

    clickOnMenuItem(menuItem) {
        //TODO finish it
        let nameXpath = XPATH.itemByName(menuItem);
        return this.waitForElementDisplayed(nameXpath, appConst.TIMEOUT_3).then(() => {
            return this.clickOnElement(nameXpath);
        }).then(() => {
            return this.pause(500);
        }).catch(err => {
            this.saveScreenshot('err_find_' + menuItem);
            throw Error('Item  ' + menuItem + ' was not found. ' + err);
        })
    }
}

module.exports = GridContextMenu;

