/**
 * Created on 27/06/2017.
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');

describe("User Browse panel, toolbar spec", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it("WHEN 'su' user has been selected THEN Delete button should be disabled",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await testUtils.findAndSelectItem('su');
            //'`Delete' button gets disabled`
            await userBrowsePanel.waitForDeleteButtonDisabled();
            // 'Edit' button should be enabled'
            await userBrowsePanel.waitForEditButtonEnabled();
        });

    it("WHEN 'Anonymous' user has been selected THEN Delete button should be disabled",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await testUtils.findAndSelectItem('anonymous');
            await userBrowsePanel.waitForDeleteButtonDisabled();
            // 'Edit button should be enabled'
            await userBrowsePanel.waitForEditButtonEnabled();
        });

    it("WHEN no any items are selected THEN all buttons should have correct states",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.waitForNewButtonEnabled();
            await userBrowsePanel.waitForDeleteButtonDisabled();
            //Edit button should be disabled:
            await userBrowsePanel.waitForEditButtonDisabled();
        });

    it("WHEN 'System Id Provider' has been selected THEN all buttons should have correct states",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.clickOnRowByName('/system');
            await userBrowsePanel.waitForNewButtonEnabled();
            // 'Delete' button should be disabled, because this is the 'System' Id provider!
            await userBrowsePanel.waitForDeleteButtonDisabled();
            await userBrowsePanel.waitForEditButtonEnabled();
        });

    it("WHEN 'Roles' has been selected THEN all buttons should have correct states",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.clickOnRowByName('roles');
            await userBrowsePanel.waitForNewButtonEnabled();
            // Delete button should be disabled
            await userBrowsePanel.waitForDeleteButtonDisabled();
            // Edit button should be disabled
            await userBrowsePanel.waitForEditButtonDisabled();
        });

    it("GIVEN 'System Id Provider' is expanded WHEN 'Users' has been selected THEN all buttons should have correct states",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.clickOnExpanderIcon("/system");
            await userBrowsePanel.waitForFolderUsersVisible();
            await userBrowsePanel.clickOnRowByName('users');
            await userBrowsePanel.waitForNewButtonEnabled();
            // Delete button should be disabled
            await userBrowsePanel.waitForDeleteButtonDisabled();
            // Edit button should be disabled
            await userBrowsePanel.waitForEditButtonDisabled();
        });

    it("GIVEN 'System Id Provider' is expanded WHEN 'Groups' has been selected THEN all buttons should have correct states",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.clickOnExpanderIcon("/system");
            await userBrowsePanel.waitForFolderUsersVisible();
            await userBrowsePanel.clickOnRowByName('groups');
            await userBrowsePanel.waitForNewButtonEnabled();
            // Delete button should be disabled
            await userBrowsePanel.waitForDeleteButtonDisabled();
        });

    // Forbid deletion of system roles #324
    it("WHEN a system role has been selected THEN 'Delete' button should be disabled",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let roleName = 'system.everyone';
            await testUtils.findAndSelectItem(roleName);
            // Delete button should be disabled
            await userBrowsePanel.waitForDeleteButtonDisabled();
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        if (typeof browser !== 'undefined') {
            await testUtils.getBrowser().setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
        }
        return console.log('specification starting: ' + this.title);
    });
});






