/**
 * Created on 20.03.2018.
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

describe('Checks links in Launcher Panel when an user has no administrator role', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let TEST_USER;
    let userName;
    const PASSWORD = appConst.PASSWORD.MEDIUM;

    it("WHEN new user with required roles has been added THEN the user should be searchable",
        async () => {
            let roles = ['Administration Console Login', 'Content Manager App'];
            userName = userItemsBuilder.generateRandomName('user');
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            TEST_USER = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), roles);
            await testUtils.navigateToUsersApp();
            // 1. Open user-wizard and save the data:
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(TEST_USER);
            await userWizard.waitAndClickOnSave();
            await userWizard.waitForNotificationMessage();
            await userBrowsePanel.closeTabAndWaitForGrid(userName);
            // 2. Type the user-name in Filter Panel:
            await testUtils.typeNameInFilterPanel(userName);
            let result = await userBrowsePanel.isItemDisplayed(userName);
            assert.ok(result, 'new user should be filtered in the grid');
        });

    // Verifies the  https://github.com/enonic/xp-apps/issues/690
    it("WHEN an user has no Administrator-role THEN 'Applications' and 'Users' links must not be present in the launcher panel",
        async () => {
            let launcherPanel = new LauncherPanel();
            let loginPage = new LoginPage();
            await testUtils.doCloseUsersApp();
            await launcherPanel.clickOnLogoutLink();
            // 1. Do login with the just created user:
            await loginPage.doLogin(userName, PASSWORD);
            await launcherPanel.waitForPanelDisplayed();
            await testUtils.saveScreenshot('user_has_no_admin');
            // 2. Verify that 'Applications' link is not visible:
            let isDisplayed = await launcherPanel.isApplicationsLinkDisplayed();
            await assert.ok(isDisplayed === false, 'Applications link should not be displayed, because the user has no Admin-role');
            // 3. Verify that 'Users' link is not visible:
            isDisplayed = await launcherPanel.isUsersLinkDisplayed();
            await assert.ok(isDisplayed === false, 'Users link should not be displayed, because the user has no Admin-role');
        });

    before(async () => {
        if (typeof browser !== 'undefined') {
            await testUtils.getBrowser().setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
        }
        return console.log('specification starting: ' + this.title);
    });
});
