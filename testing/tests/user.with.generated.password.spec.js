/**
 * Created on 13.04.2018
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const LoginPage = require('../page_objects/login.page');
const LauncherPanel = require('../page_objects/launcher.panel');
const ChangePasswordDialog = require('../page_objects/wizardpanel/change.password.dialog');

describe("Create an user with generated password and do login with the user", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let TEST_USER;
    let USER_NAME;
    let PASSWORD;

    it("WHEN new 'user' with required roles has been added THEN the user should be searchable",
        async () => {
            let permissions = ['Administration Console Login', 'Content Manager App'];
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let changePasswordDialog = new ChangePasswordDialog();
            USER_NAME = userItemsBuilder.generateRandomName('user');
            TEST_USER = userItemsBuilder.buildUser(USER_NAME, null, userItemsBuilder.generateEmail(USER_NAME), permissions);
            await testUtils.navigateToUsersApp();
            // 1. Open new wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Type the data and click on 'Generate' button, save the generated password:
            PASSWORD = await userWizard.typeDataAndGeneratePassword(TEST_USER);
            // 4. Save the user:
            await userWizard.waitAndClickOnSave();
            await userWizard.waitForNotificationMessage();
            await userBrowsePanel.closeTabAndWaitForGrid(USER_NAME);
            // 5. Verify that user is created:
            await testUtils.typeNameInFilterPanel(USER_NAME);
            let isDisplayed = await userBrowsePanel.isItemDisplayed(USER_NAME);
            assert.ok(isDisplayed, 'new user should be present in the grid');
        });

    it("WHEN user name and 'generated' password have been typed AND 'login-button' pressed THEN user should be 'logged in'",
        async () => {
            let launcherPanel = new LauncherPanel();
            let loginPage = new LoginPage();
            await testUtils.doCloseUsersApp();
            // 1. Do log out:
            await launcherPanel.clickOnLogoutLink();
            // 2. Log in with the generated password
            await loginPage.doLogin(USER_NAME, PASSWORD);
            // 3. Check that user is logged in:
            await launcherPanel.waitForPanelDisplayed();
        });

    before(async () => {
        if (typeof browser !== 'undefined') {
            await testUtils.getBrowser().setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
        }
        return console.log('specification starting: ' + this.title);
    });
});
