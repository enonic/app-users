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

describe('user.trim.inputs.spec Save user, trim the password and display name', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    let PASSWORD = appConst.PASSWORD.MEDIUM;

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
            await testUtils.saveScreenshot("user_trimmed_name");
            // 5. Verify that spaces are trimmed in the display name:
            let isDisplayed = await userBrowsePanel.isItemDisplayed(nameWithSpaces);
            assert.ok(isDisplayed === false, "name with spaces should not be displayed in the grid");
            // 6.  User-name without spaces is displayed in the path:
            isDisplayed = await userBrowsePanel.isItemDisplayed(userName);
            assert.ok(isDisplayed, "trimmed name should be displayed");
        });

    it("GIVEN user wizard is opened WHEN password starting and ending with a space has been typed THEN Save button gets enabled",
        async () => {
            let userWizard = new UserWizard();
            let passwordWithSpaces = appConst.PASSWORD.WITH_SPACES;
            let userName = userItemsBuilder.generateRandomName('user');
            let testUser = userItemsBuilder.buildUser(userName, passwordWithSpaces, userItemsBuilder.generateEmail(userName), null);
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeDisplayName(testUser.displayName);
            await userWizard.typeEmail(testUser.email);
            // Type a password with white space:
            await userWizard.typePassword(passwordWithSpaces);
            // Save button gets enabled:
            await testUtils.saveScreenshot('user_password_spaces');
            await userWizard.waitForSaveButtonEnabled();
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});
