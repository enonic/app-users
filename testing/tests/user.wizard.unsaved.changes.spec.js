/**
 * Created on 06.11.2017.
 */
const chai = require('chai');
const assert = chai.assert;
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
    let testUser;
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
            testUser = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), roles);
            await testUtils.addSystemUser(testUser);
            await testUtils.typeNameInFilterPanel(userName);

            let result = await userBrowsePanel.isItemDisplayed(userName);
            assert.isTrue(result, "New user should be present in browse panel");
        });

    it("GIVEN existing user is opened WHEN display name has been changed AND 'Close' button pressed THEN Confirmation dialog should appear",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Select and open existing user:
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            // 2. Change the name:
            await userWizard.typeDisplayName("new-name");
            // 3. Click on close-icon
            await userBrowsePanel.doClickOnCloseTabButton("new-name");
            await confirmationDialog.waitForDialogLoaded();
        });

    it("GIVEN existing user is opened WHEN e-mail name has been changed AND `Close` button pressed THEN Confirmation dialog should appear",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Select and open existing user:
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            await userWizard.typeEmail("new@gmail.com");
            // 2. Click on close-icon abd verify Confirmation dialog
            await userBrowsePanel.doClickOnCloseTabButton(testUser.displayName);
            await confirmationDialog.waitForDialogLoaded();
        });

    it("GIVEN existing user is opened WHEN one role has been removed AND `Close` button pressed THEN Confirmation dialog should appear",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Select and open existing user:
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            await userWizard.removeRole(appConst.ROLES_DISPLAY_NAME.USERS_ADMINISTRATOR);
            // 2. Click on close-icon
            await userBrowsePanel.doClickOnCloseTabButton(testUser.displayName);
            // Verify the Confirmation dialog:
            await confirmationDialog.waitForDialogLoaded();
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});

