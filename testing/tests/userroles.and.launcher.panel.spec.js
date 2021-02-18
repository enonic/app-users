/**
 * Created on 20.03.2018.
 * Verifies:
 * Applications and Users links should not be present on the LauncherPanel, when an user has no Administrator role
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

describe('Checks links in Launcher Panel when an user has no administrator role', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();
    let testUser;
    let userName;
    let PASSWORD = appConst.PASSWORD.MEDIUM;

    it("WHEN new user with required roles has been added THEN the user should be searchable",
        async () => {
            let roles = ['Administration Console Login', 'Content Manager App'];
            userName = userItemsBuilder.generateRandomName('user');
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            testUser = userItemsBuilder.buildUser(userName, PASSWORD, userItemsBuilder.generateEmail(userName), roles);
            await testUtils.navigateToUsersApp();
            //1. Open user-wizard and save the data:
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeData(testUser);
            await userWizard.waitAndClickOnSave();
            await userBrowsePanel.doClickOnCloseTabAndWaitGrid(userName);
            //2. Type the user-name in Filter Panel:
            await testUtils.typeNameInFilterPanel(userName);
            let result = await userBrowsePanel.isItemDisplayed(userName);
            assert.isTrue(result, 'new user should be filtered in the grid');
        });

    //Verifies the  https://github.com/enonic/xp-apps/issues/690
    it("WHEN an user has no Administrator-role THEN 'Applications' and 'Users' links must not be present in the launcher panel",
        async () => {
            let launcherPanel = new LauncherPanel();
            let loginPage = new LoginPage();
            await testUtils.doCloseUsersApp();
            await launcherPanel.clickOnLogoutLink();
            //1. Do login with just created user:
            await loginPage.doLogin(userName, PASSWORD);
            await launcherPanel.waitForPanelDisplayed();
            testUtils.saveScreenshot("user_has_no_admin");

            let isDisplayed = await launcherPanel.isApplicationsLinkDisplayed();
            await assert.isFalse(isDisplayed, 'Applications link should not be displayed, because the user has no Admin-role');
            isDisplayed = await launcherPanel.isUsersLinkDisplayed();
            await assert.isFalse(isDisplayed, 'Users link should not be displayed, because the user has no Admin-role');
        });

    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
