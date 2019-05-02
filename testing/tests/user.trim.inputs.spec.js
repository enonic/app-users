/**
 * Created on 14/02/2018
 * verifies the enonic/lib-admin-ui#254 (Users App - trim spaces in displayName input (Wizards))
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');

describe('user.trim.inputs.spec Save user, trim the password and display name', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it('GIVEN user wizard is opened WHEN user-name with white spaces has been typed and the user saved THEN name without spaces should be displayed in the grid ',
        () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let userName = userItemsBuilder.generateRandomName('user');
            let nameWithSpaces = '   ' + userName + '   ';
            let testUser = userItemsBuilder.buildUser(nameWithSpaces, '1q2w3e', userItemsBuilder.generateEmail(userName), null);
            return testUtils.clickOnSystemOpenUserWizard().then(() => {
                return userWizard.typeData(testUser);
            }).then(() => {
                return testUtils.saveAndCloseWizard(testUser.displayName.trim());
            }).then(() => {
                return testUtils.typeNameInFilterPanel(testUser.displayName);
            }).then(() => {
                testUtils.saveScreenshot("user_trimmed_name");
                return assert.eventually.isFalse(userBrowsePanel.isItemDisplayed(nameWithSpaces),
                    "`name with spaces` should not be displayed in the grid");
            }).then(() => {
                return assert.eventually.isTrue(userBrowsePanel.isItemDisplayed(userName), "`trimmed name` should be displayed");
            })
        });

    it('GIVEN user wizard is opened WHEN password with white space has been typed THEN `Invalid password` validation message should be displayed ',
        () => {
            let userWizard = new UserWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let passwordWithSpaces = '   1q2w3e  ';
            let userName = userItemsBuilder.generateRandomName('user');
            let testUser = userItemsBuilder.buildUser(userName, passwordWithSpaces, userItemsBuilder.generateEmail(userName), null);
            return testUtils.clickOnSystemOpenUserWizard().then(() => {
                return userWizard.typeDisplayName(testUser.displayName);
            }).then(() => {
                return userWizard.typeEmail(testUser.email);
            }).then(() => {
                return userWizard.typePassword(passwordWithSpaces);
            }).then(() => {
                return userWizard.waitForSaveButtonDisabled();
            }).then(() => {
                testUtils.saveScreenshot("user_password_invalid");
                return userWizard.getPasswordValidationMessage();
            }).then(result => {
                return assert.isTrue(result == 'Invalid password', "correct validation message should be displayed");
            })
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
