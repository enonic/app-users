/**
 * Created on 12/01/2017.
 */
const Page = require('../page');
const elements = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: `//ul[contains(@id,'TreeGridContextMenu')]`,
    contextMenuItems: `//li[contains(@id,'MenuItem')]`,
    deleteMenuItem: `//li[contains(@id,'MenuItem') and text()='Delete']`,
    editMenuItem: `//li[contains(@id,'MenuItem') and text()='Edit']`,
    newMenuItem: `//li[contains(@id,'MenuItem') and text()='New...']`,
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
            return this.getAttribute(XPATH.deleteMenuItem, 'class').then(result => {
                return result.includes('disabled');
            });
        }, 2000).then(() => {
            return true;
        }).catch(err => {
            this.saveScreenshot('err_delete_context_menu_item');
            throw new Error(`Grid context menu - Delete menu item should be disabled ` + err);
        });
    }

    isEditMenuItemDisabled() {
        return this.getAttribute(XPATH.editMenuItem, 'class').then(result => {
            return result.includes('disabled');
        });
    }

    isDeleteMenuItemDisabled() {
        return this.getAttribute(XPATH.deleteMenuItem, 'class').then(result => {
            return result.includes('disabled');
        });
    }

    isNewMenuItemDisabled() {
        return this.getAttribute(XPATH.newMenuItem, 'class').then(result => {
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
            throw Error('Item  ' + menuItem + ' was not found')
        })
    }

};
module.exports = GridContextMenu;

