/**
 * Created on 14/02/2018
 * verifies the enonic/lib-admin-ui#254 (Users App - trim spaces in displayName input (Wizards))
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('user.trim.inputs.spec Save user, trim the password and display name', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it("GIVEN user wizard is opened WHEN user-name with white spaces has been typed and the user saved THEN name without spaces should be displayed in the grid",
        async () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let userName = userItemsBuilder.generateRandomName('user');
            let nameWithSpaces = '   ' + userName + '   ';
            let testUser = userItemsBuilder.buildUser(nameWithSpaces, '1q2w3e', userItemsBuilder.generateEmail(userName), null);
            //1. Open new user-wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            //2. Type the user-data:
            await userWizard.typeData(testUser);
            //3. Click on Save button and close the wizard:
            await testUtils.saveAndCloseWizard(testUser.displayName.trim());
            //4. Type displayName with spaces:
            await testUtils.typeNameInFilterPanel(testUser.displayName);
            testUtils.saveScreenshot("user_trimmed_name");
            let result = await userBrowsePanel.isItemDisplayed(nameWithSpaces);
            assert.isFalse(result, "name with spaces should not be displayed in the grid");
            result = await userBrowsePanel.isItemDisplayed(userName);
            assert.isTrue(result, "trimmed name should be displayed");
        });

    it("GIVEN user wizard is opened WHEN password with white space has been typed THEN 'Invalid password' validation message should be displayed",
        async () => {
            let userWizard = new UserWizard();
            let passwordWithSpaces = '   1q2w3e  ';
            let userName = userItemsBuilder.generateRandomName('user');
            let testUser = userItemsBuilder.buildUser(userName, passwordWithSpaces, userItemsBuilder.generateEmail(userName), null);
            await testUtils.clickOnSystemOpenUserWizard();
            await userWizard.typeDisplayName(testUser.displayName);
            await userWizard.typeEmail(testUser.email);
            //Type a password with white space:
            await userWizard.typePassword(passwordWithSpaces);
            //Save button gets disabled:
            await userWizard.waitForSaveButtonDisabled();
            testUtils.saveScreenshot("user_password_invalid");
            let validationMessage = await userWizard.getPasswordValidationMessage();
            assert.equal(validationMessage, 'Invalid password', "expected validation message should appear");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
