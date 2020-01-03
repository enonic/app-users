/**
 * Created on 06.11.2017.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const SaveBeforeClose = require('../page_objects/save.before.close.dialog');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe("User Wizard and 'Save Before Close dialog'", function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testUser;

    it("GIVEN user-wizard is opened AND display name has been typed WHEN close button pressed THEN Save Before Close dialog should appear",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeClose = new SaveBeforeClose();
            //1. Open new user-wizard and type a name:
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeDisplayName('test-user');
            //2. Click on close-icon:
            await userBrowsePanel.doClickOnCloseTabButton("test-user");
            await saveBeforeClose.waitForDialogOpened();
        });

    it("WHEN the user has been saved THEN the user should be present in the grid",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let userName = userItemsBuilder.generateRandomName("user");
            let roles = [appConst.roles.CM_ADMIN, appConst.roles.USERS_ADMINISTRATOR];
            testUser = userItemsBuilder.buildUser(userName, "1q2w3e", userItemsBuilder.generateEmail(userName), roles);
            await testUtils.addSystemUser(testUser);
            await testUtils.typeNameInFilterPanel(userName);

            let result = await userBrowsePanel.isItemDisplayed(userName);
            assert.isTrue(result, "New user should be present in browse panel");
        });

    it("GIVEN existing user is opened WHEN display name has been changed AND 'Close' button pressed THEN Save Before Close dialog should appear",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeClose = new SaveBeforeClose();
            //1. Select and open existing user:
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            //2. Change the name:
            await userWizard.typeDisplayName("new-name");
            //3. Click on close-icon
            await userBrowsePanel.doClickOnCloseTabButton("new-name");
            await saveBeforeClose.waitForDialogOpened();
        });

    it("GIVEN existing user is opened WHEN e-mail name has been changed AND `Close` button pressed THEN Save Before Close dialog should appear",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeClose = new SaveBeforeClose();
            //1. Select and open existing user:
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            await userWizard.typeEmail("new@gmail.com");
            //2. Click on close-icon
            await userBrowsePanel.doClickOnCloseTabButton(testUser.displayName);
            await saveBeforeClose.waitForDialogOpened();
        });

    it("GIVEN existing user is opened WHEN one role has been removed AND `Close` button pressed THEN Save Before Close dialog should appear",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let saveBeforeClose = new SaveBeforeClose();
            //1. Select and open existing user:
            await testUtils.selectUserAndOpenWizard(testUser.displayName);
            await userWizard.removeRole(appConst.roles.USERS_ADMINISTRATOR);
            //2. Click on close-icon
            await userBrowsePanel.doClickOnCloseTabButton(testUser.displayName);
            await saveBeforeClose.waitForDialogOpened();
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});

