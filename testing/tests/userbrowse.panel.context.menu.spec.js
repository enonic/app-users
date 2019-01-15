const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const gridContextMenu = require('../page_objects/browsepanel/grid.context.menu');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('userbrowse.panel.context.menu.spec User Browse Panel Context Menu specification', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it('GIVEN navigate to the browse panel WHEN right click on the `Roles` folder THEN `New role` menu item should be first ',
        () => {
            return userBrowsePanel.rightClickOnRowByDisplayName(appConst.ROLES).then(() => {
                return gridContextMenu.waitForContextMenuVisible();
            }).then(() => {
                return gridContextMenu.getGridContextMenuItems();
            }).then(result => {
                assert.isTrue(result[0] == 'New Role');
            })
        });
    it('GIVEN navigate to the browse panel WHEN right click on the `System` folder THEN `New...` menu item should be first ',
        () => {
            return userBrowsePanel.rightClickOnRowByDisplayName('System Id Provider').then(() => {
                return gridContextMenu.waitForContextMenuVisible();
            }).then(() => {
                return gridContextMenu.getGridContextMenuItems();
            }).then(result => {
                assert.isTrue(result[0] == 'New...');
            })
        });
    it('WHEN right click on the `Anonymous` user THEN `Delete` menu item should be disabled ',
        () => {
            return testUtils.findAndSelectItem('anonymous').then(() => {
                return userBrowsePanel.rightClickOnRowByDisplayName('Anonymous User');
            }).then(() => {
                return gridContextMenu.waitForContextMenuVisible();
            }).then(() => {
                testUtils.saveScreenshot('anonymous_context_menu');
                return gridContextMenu.waitForDeleteMenuItemDisabled();
            }).then(result => {
                assert.isTrue(result, 'Delete menu item should be disabled');
            })
        });

    it('WHEN right click on the `su` user THEN `Delete` menu item should be disabled',
        () => {
            return testUtils.findAndSelectItem(appConst.SUPER_USER_NAME).then(() => {
                return userBrowsePanel.rightClickOnRowByDisplayName(appConst.SUPER_USER_DISPLAY_NAME);
            }).then(() => {
                return gridContextMenu.waitForContextMenuVisible();
            }).then(() => {
                testUtils.saveScreenshot('su_context_menu');
                return gridContextMenu.waitForDeleteMenuItemDisabled();
            }).then(result => {
                assert.isTrue(result, 'Delete menu item should be disabled');
            })
        });
    it('GIVEN navigate to the browse panel WHEN right click on the `System` folder THEN `Delete` menu item should be disabled ',
        () => {
            return userBrowsePanel.rightClickOnRowByDisplayName('System Id Provider').then(() => {
                return gridContextMenu.waitForContextMenuVisible();
            }).then(() => {
                return gridContextMenu.waitForDeleteMenuItemDisabled();
            }).then(() => {
                testUtils.saveScreenshot('system_context_menu');
                return assert.eventually.isFalse(gridContextMenu.isEditMenuItemDisabled(), "`Edit` menu item should be enabled");
            }).then(() => {
                return assert.eventually.isFalse(gridContextMenu.isNewMenuItemDisabled(), "`New..` menu item should be enabled");
            })
        });

    it('GIVEN navigate to the browse panel WHEN right click on the `Users` folder THEN `New User` menu item should be first ',
        () => {
            return userBrowsePanel.clickOnExpanderIcon('/system').then(() => {
                return userBrowsePanel.rightClickOnRowByDisplayName('Users');
            }).then(() => {
                return gridContextMenu.waitForContextMenuVisible();
            }).then(() => {
                return gridContextMenu.getGridContextMenuItems();
            }).then(result => {
                assert.isTrue(result[0] == 'New User');
            })
        });

    it('GIVEN `/system` folder is expanded WHEN right click on the `Groups` folder THEN `New User Group` menu item should be first ',
        () => {
            return userBrowsePanel.clickOnExpanderIcon('/system').then(() => {
                return userBrowsePanel.rightClickOnRowByDisplayName('Groups');
            }).then(() => {
                return gridContextMenu.waitForContextMenuVisible();
            }).then(() => {
                return gridContextMenu.getGridContextMenuItems();
            }).then(result => {
                testUtils.saveScreenshot("groups_context_menu");
                assert.isTrue(result[0] == 'New User Group');
            })
        });

    it('GIVEN existing Id Provider(empty) WHEN right click on the provider THEN `Delete` menu item should be enabled ',
        () => {
            let idProvider = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('provider'), 'test Id provider3');
            return testUtils.openWizardAndSaveIdProvider(idProvider).then(() => {
                return userBrowsePanel.doClickOnCloseTabAndWaitGrid(idProvider.displayName);
            }).pause(1000).then(() => {
                return userBrowsePanel.rightClickOnRowByDisplayName(idProvider.displayName);
            }).then(() => {
                return gridContextMenu.waitForContextMenuVisible();
            }).then(() => {
                return gridContextMenu.isDeleteMenuItemDisabled();
            }).then(result => {
                testUtils.saveScreenshot("store_context_menu");
                return assert.isFalse(result, "`Delete` menu item should be enabled, because the Id Provider is empty");
            });
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
})
;
