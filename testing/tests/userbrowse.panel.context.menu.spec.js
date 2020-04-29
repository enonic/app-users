const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const GridContextMenu = require('../page_objects/browsepanel/grid.context.menu');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('userbrowse.panel.context.menu.spec - User Browse Panel Context Menu specification', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it("GIVEN navigate to the browse panel WHEN do right click on the 'Roles' folder THEN 'New role' menu item should be first",
        async () => {
            let gridContextMenu = new GridContextMenu();
            let userBrowsePanel = new UserBrowsePanel();
            //1. Do right click on Roles-folder:
            await userBrowsePanel.rightClickOnRowByDisplayName(appConst.ROLES);
            await gridContextMenu.waitForContextMenuVisible();
            let items = await gridContextMenu.getGridContextMenuItems();
            assert.equal(items[0], 'New Role', "New Role menu item should be first");
            //2.'Delete menu item should be disabled,otherwise exception will be thrown in 3 seconds:
            await gridContextMenu.waitForDeleteMenuItemDisabled();
            //3. 'Edit' menu item should be disabled, otherwise exception will be thrown in 3 seconds:
            await gridContextMenu.waitForEditMenuItemDisabled();
        });

    it('GIVEN navigate to the browse panel WHEN do right click on the `System` folder THEN `New...` menu item should be first',
        async () => {
            let gridContextMenu = new GridContextMenu();
            let userBrowsePanel = new UserBrowsePanel();
            //Do right click on 'System Id Provider'
            await userBrowsePanel.rightClickOnRowByDisplayName('System Id Provider');
            await gridContextMenu.waitForContextMenuVisible();
            let items = await gridContextMenu.getGridContextMenuItems();
            assert.equal(items[0], 'New...', "'New...' menu item should be first");
        });

    it('WHEN right click on the `Anonymous` user THEN `Delete` menu item should be disabled ',
        async () => {
            let gridContextMenu = new GridContextMenu();
            let userBrowsePanel = new UserBrowsePanel();
            await testUtils.findAndSelectItem('anonymous');
            //Do right click on 'Anonymous User'
            await userBrowsePanel.rightClickOnRowByDisplayName('Anonymous User');
            await gridContextMenu.waitForContextMenuVisible();
            testUtils.saveScreenshot('anonymous_context_menu');
            let result = await gridContextMenu.waitForDeleteMenuItemDisabled();
            assert.isTrue(result, 'Delete menu item should be disabled');
        });

    it('WHEN right click on `su` user THEN `Delete` menu item should be disabled',
        async () => {
            let gridContextMenu = new GridContextMenu();
            let userBrowsePanel = new UserBrowsePanel();
            await testUtils.findAndSelectItem(appConst.SUPER_USER_NAME);
            //Do right click on 'Super User'
            await userBrowsePanel.rightClickOnRowByDisplayName(appConst.SUPER_USER_DISPLAY_NAME);
            await gridContextMenu.waitForContextMenuVisible();
            testUtils.saveScreenshot('su_context_menu');
            let result = await gridContextMenu.waitForDeleteMenuItemDisabled();
            assert.isTrue(result, 'Delete menu item should be disabled');
        });

    it("WHEN right click on 'system.auditlog' role THEN `Delete` menu item should be disabled",
        async () => {
            let gridContextMenu = new GridContextMenu();
            let userBrowsePanel = new UserBrowsePanel();
            await testUtils.findAndSelectItem("system.auditlog");
            //1. Do right click on 'system.auditlog' role
            await userBrowsePanel.rightClickOnRowByDisplayName("Audit Log");
            await gridContextMenu.waitForContextMenuVisible();
            testUtils.saveScreenshot('auditlog_context_menu');
            //2. Verify that 'Delete' menu item is disabled:
            await gridContextMenu.waitForDeleteMenuItemDisabled();
        });

    it('GIVEN navigate to the browse panel WHEN right click on the `System` folder THEN `Delete` menu item should be disabled ',
        async () => {
            let gridContextMenu = new GridContextMenu();
            let userBrowsePanel = new UserBrowsePanel();
            //1. Do right click on System Id Provider:
            await userBrowsePanel.rightClickOnRowByDisplayName('System Id Provider');
            await gridContextMenu.waitForContextMenuVisible();
            //2. Verify that 'Delete' menu item is disabled:
            await gridContextMenu.waitForDeleteMenuItemDisabled();
            //3. 'Edit' and 'New...' should be enabled:
            testUtils.saveScreenshot('system_provider_context_menu');
            let isDisabled = await gridContextMenu.isEditMenuItemDisabled();
            assert.isFalse(isDisabled, "'Edit' menu item should be enabled");
            isDisabled = await gridContextMenu.isNewMenuItemDisabled();
            assert.isFalse(isDisabled, "'New...' menu item should be enabled");
        });

    it('GIVEN navigate to the browse panel WHEN right click on the `Users` folder THEN `New User` menu item should be first',
        async () => {
            let gridContextMenu = new GridContextMenu();
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.clickOnExpanderIcon('/system');
            //Do right click on 'Users'
            await userBrowsePanel.rightClickOnRowByDisplayName('Users');
            await gridContextMenu.waitForContextMenuVisible();
            let items = await gridContextMenu.getGridContextMenuItems();
            assert.equal(items[0], 'New User', 'New User menu item should be first');
        });

    it('GIVEN `/system` folder is expanded WHEN right click on the `Groups` folder THEN `New User Group` menu item should be first',
        async () => {
            let gridContextMenu = new GridContextMenu();
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.clickOnExpanderIcon('/system');
            //Do right click on 'Groups'
            await userBrowsePanel.rightClickOnRowByDisplayName('Groups');
            await gridContextMenu.waitForContextMenuVisible();
            let items = await gridContextMenu.getGridContextMenuItems();
            testUtils.saveScreenshot("groups_context_menu");
            assert.equal(items[0], 'New User Group', "`New User Group` menu item should be first");
        });

    it('GIVEN existing Id Provider(empty) WHEN right click on the provider THEN `Delete` menu item should be enabled ',
        async () => {
            let gridContextMenu = new GridContextMenu();
            let userBrowsePanel = new UserBrowsePanel();
            let idProvider = userItemsBuilder.buildIdProvider(userItemsBuilder.generateRandomName('provider'), 'test Id provider3');
            //1. Open the wizard and save new provider:
            await testUtils.openWizardAndSaveIdProvider(idProvider);
            await userBrowsePanel.doClickOnCloseTabAndWaitGrid(idProvider.displayName);
            testUtils.saveScreenshot("provider1_saved");
            //2. Go to browse panel and do right click on the provider:
            await userBrowsePanel.rightClickOnRowByDisplayName(idProvider.displayName);
            await gridContextMenu.waitForContextMenuVisible();
            let result = await gridContextMenu.isDeleteMenuItemDisabled();
            testUtils.saveScreenshot("provider_context_menu");
            assert.isFalse(result, "'Delete' menu item should be enabled, because the Id Provider is empty");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
