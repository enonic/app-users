/**
 * Created on 14/02/2018
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const LauncherPanel = require('../page_objects/launcher.panel');
const LoginPage = require('../page_objects/login.page');

describe('user.trim.inputs.spec Save user, trim the password and display name', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    const PASSWORD = appConst.PASSWORD.MEDIUM;
    let TEST_USER;

    // verifies the enonic/lib-admin-ui#254 (Users App - trim spaces in displayName input (Wizards))
    it("GIVEN user wizard is opened WHEN user-name with white spaces has been typed and the user saved THEN name without spaces should be displayed in the grid",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let userName = userItemsBuilder.generateRandomName('user');
            let nameWithSpaces = '   ' + userName + '   ';
            let testUser = userItemsBuilder.buildUser(nameWithSpaces, PASSWORD, userItemsBuilder.generateEmail(userName), null);
            // 1. Open new user-wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Type the user-data:
            await userWizard.typeData(testUser);
            // 3. Click on Save button and close the wizard:
            await testUtils.saveAndCloseWizard(testUser.displayName.trim());
            // 4. Type displayName with spaces:
            await testUtils.typeNameInFilterPanel(testUser.displayName);
            await testUtils.saveScreenshot('user_trimmed_name');
            // 5. Verify that spaces are trimmed in the display name:
            let isDisplayed = await userBrowsePanel.isItemDisplayed(nameWithSpaces);
            assert.ok(isDisplayed === false, "name with spaces should not be displayed in the grid");
            // 6.  User-name without spaces is displayed in the path:
            isDisplayed = await userBrowsePanel.isItemDisplayed(userName);
            assert.ok(isDisplayed, "trimmed name should be displayed");
        });

    it("GIVEN a password starting and ending with spaces has been typed WHEN Save button pressed THEN the user should be saved",
        async () => {
            let userWizard = new UserWizard();
            let passwordWithSpaces = appConst.PASSWORD.WITH_SPACES;
            let userName = userItemsBuilder.generateRandomName('user');
            let roles = [appConst.ROLES_DISPLAY_NAME.CM_ADMIN, appConst.ROLES_DISPLAY_NAME.ADMIN_CONSOLE];
            TEST_USER = userItemsBuilder.buildUser(userName, passwordWithSpaces, userItemsBuilder.generateEmail(userName), roles);
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeDisplayName(TEST_USER.displayName);
            await userWizard.typeEmail(TEST_USER.email);
            await userWizard.addRoles(roles);
            await userWizard.clickOnSetPasswordButton();
            // Type a password with spaces:
            await userWizard.typePassword(passwordWithSpaces);
            await userWizard.waitAndClickOnSave();
            let message = await userWizard.waitForNotificationMessage();
            assert.equal(message, appConst.NOTIFICATION_MESSAGE.USER_WAS_CREATED, 'Expected notification should appear');
            await userWizard.waitForChangePasswordButtonDisplayed();
        });

    it("WHEN trimmed password have been typed in the login page AND 'login-button' pressed THEN the user should be 'logged in'",
        async () => {
            let launcherPanel = new LauncherPanel();
            let loginPage = new LoginPage();
            let trimmedPassword = appConst.PASSWORD.WITH_SPACES.trim();
            await testUtils.doCloseUsersApp();
            // 1. Do log out:
            await launcherPanel.clickOnLogoutLink();
            // 2. Log in with the generated password
            await loginPage.doLogin(TEST_USER.displayName, trimmedPassword);
            await testUtils.saveScreenshot('trimmed_pass_logged_in')
            // 3. Check that user is logged in:
            await launcherPanel.waitForPanelDisplayed();
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
