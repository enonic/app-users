/**
 * Created on 12/01/2017.
 */
const page = require('../page');
const elements = require('../../libs/elements');
const appConst = require('../../libs/app_const');

var menuXpath = {
    container: `//ul[contains(@id,'TreeGridContextMenu')]`,
    contextMenuItems: `//li[contains(@id,'MenuItem')]`,
    deleteMenuItem: `//li[contains(@id,'MenuItem') and text()='Delete']`,
    editMenuItem: `//li[contains(@id,'MenuItem') and text()='Edit']`,
    newMenuItem: `//li[contains(@id,'MenuItem') and text()='New...']`,

}
var gridContextMenu = Object.create(page, {

    waitForContextMenuVisible: {
        value: function () {
            return this.waitForVisible(`${menuXpath.container}`, appConst.TIMEOUT_3).catch((err)=> {
                this.saveScreenshot('err_grid_context_menu');
                throw new Error(`tree grid context menu is not visible ` + err);
            });
        }
    },

    waitForDeleteMenuItemDisabled: {
        value: function () {
            return this.getBrowser().waitUntil(()=> {
                return this.getBrowser().getAttribute(`${menuXpath.deleteMenuItem}`, 'class').then(result=> {
                    return result.includes('disabled');
                });
            }, 2000).then(()=> {
                return true;
            }).catch((err)=> {
                this.saveScreenshot('err_delete_context_menu');
                throw new Error(`Delete button should be disabled ` + err);
            });
        }
    },

    isEditMenuItemDisabled: {
        value: function () {
            return this.getAttribute(`${menuXpath.editMenuItem}`, 'class').then(result=> {
                return result.includes('disabled');
            });
        }
    },
    isDeleteMenuItemDisabled: {
        value: function () {
            return this.getAttribute(`${menuXpath.deleteMenuItem}`, 'class').then(result=> {
                return result.includes('disabled');
            });
        }
    },
    isNewMenuItemDisabled: {
        value: function () {
            return this.getAttribute(`${menuXpath.newMenuItem}`, 'class').then(result=> {
                return result.includes('disabled');
            });
        }
    },

    getGridContextMenuItems: {
        value: function () {
            let selector = `${menuXpath.container}` + `${menuXpath.contextMenuItems}`;
            return this.getText(selector);
        }
    },
    clickOnMenuItem: {
        value: function (itemName) {
            //TODO finish it 
            var nameXpath = menuXpath.itemByName(itemName);
            return this.waitForVisible(nameXpath, appConst.TIMEOUT_3).then(()=> {
                return this.doClick(nameXpath);
            }).pause(500).catch((err)=> {
                this.saveScreenshot('err_find_' + itemName);
                throw Error('Item was not ' + itemName + ' was not found')
            })
        }
    },
});
module.exports = gridContextMenu;


