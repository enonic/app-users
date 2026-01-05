/**
 * Created on 06.11.2017.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe("User Wizard and 'Confirmation dialog'", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let TEST_USER;
    const PASSWORD = appConst.PASSWORD.MEDIUM;

    it("GIVEN user-wizard is opened AND display name has been typed WHEN close button pressed THEN Confirmation dialog should appear",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Open new user-wizard and type a name:
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeDisplayName('test-user');
            // 2. Click on close-icon:
            await userBrowsePanel.doClickOnCloseTabButton('test-user');
            await confirmationDialog.waitForDialogLoaded();
        });

    it("WHEN the user has been saved THEN the user should be present in the grid",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let userName = userItemsBuilder.generateRandomName('user');
            let roles = [appConst.ROLES_DISPLAY_NAME.CM_ADMIN, appConst.ROLES_DISPLAY_NAME.USERS_ADMINISTRATOR];
            TEST_USER = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), roles);
            await testUtils.addSystemUser(TEST_USER);
            await testUtils.typeNameInFilterPanel(userName);

            let result = await userBrowsePanel.isItemDisplayed(userName);
            assert.ok(result, "New user should be present in browse panel");
        });

    it("GIVEN existing user is opened WHEN display name has been changed AND 'Close' button pressed THEN Confirmation dialog should appear",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Select and open existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            // 2. Change the name:
            await userWizard.typeDisplayName('new-name');
            // 3. Click on close-icon
            await userBrowsePanel.doClickOnCloseTabButton('new-name');
            await confirmationDialog.waitForDialogLoaded();
        });

    it("GIVEN existing user is opened WHEN e-mail name has been changed AND `Close` button pressed THEN Confirmation dialog should appear",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Select and open existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            await userWizard.typeEmail('new@gmail.com');
            // 2. Click on close-icon abd verify Confirmation dialog
            await userBrowsePanel.doClickOnCloseTabButton(TEST_USER.displayName);
            await confirmationDialog.waitForDialogLoaded();
        });

    it("GIVEN existing user is opened WHEN one role has been removed AND `Close` button pressed THEN Confirmation dialog should appear",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Select and open existing user:
            await testUtils.selectUserAndOpenWizard(TEST_USER.displayName);
            await userWizard.removeRole(appConst.ROLES_DISPLAY_NAME.USERS_ADMINISTRATOR);
            // 2. Click on close-icon
            await userBrowsePanel.doClickOnCloseTabButton(TEST_USER.displayName);
            // Verify the Confirmation dialog:
            await confirmationDialog.waitForDialogLoaded();
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

