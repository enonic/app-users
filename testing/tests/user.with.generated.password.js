/**
 * Created on 13.04.2018.*
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const LoginPage = require('../page_objects/login.page');
const LauncherPanel = require('../page_objects/launcher.panel');

describe("Create an user with generated password and log in the user", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let testUser;
    let userName;
    let PASSWORD;

    it("WHEN new 'user' with roles has been added THEN the user should be searchable",
        async () => {
            let permissions = ['Administration Console Login', 'Content Manager App'];
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            userName = userItemsBuilder.generateRandomName('user');
            testUser = userItemsBuilder.buildUser(userName, null, userItemsBuilder.generateEmail(userName), permissions);
            await testUtils.navigateToUsersApp();
            // 1. Open new wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Type the data and click on Generate button:
            await userWizard.typeDataAndGeneratePassword(testUser);
            // 3. Get the generated password:
            PASSWORD = await userWizard.getTextInPasswordInput();
            // 4. Save the user:
            await userWizard.waitAndClickOnSave();
            await userBrowsePanel.closeTabAndWaitForGrid(userName);
            // 5. Verify that user is created:
            await testUtils.typeNameInFilterPanel(userName);
            let result = await userBrowsePanel.isItemDisplayed(userName);
            assert.isTrue(result, 'new user should be present in the grid');
        });

    it("WHEN user name and 'generated' password have been typed AND 'login-button' pressed THEN user should be 'logged in'",
        async () => {
            let launcherPanel = new LauncherPanel();
            let loginPage = new LoginPage();
            await testUtils.doCloseUsersApp();
            // 1. Do log out:
            await launcherPanel.clickOnLogoutLink();
            // 2. Log in with the generated password
            await loginPage.doLogin(userName, PASSWORD);
            // 3. Check that user is logged in:
            await launcherPanel.waitForPanelDisplayed();
        });

    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});
