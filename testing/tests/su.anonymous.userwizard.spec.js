/**
 * Created on 11.04.2018.
 * Verifies: xp-apps#617 Allow empty email for SU and Anonymous
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');

describe('`su and anonymous users spec`: empty email is allowed, validation lets empty email through when saving.', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it('WHEN `su` is opened THEN email input should be hidden AND Delete button should be disabled',
        () => {
            let userWizard = new UserWizard();
            return testUtils.selectUserAndOpenWizard(appConst.SUPER_USER_NAME).then(() => {
                return userWizard.isEmailInputDisplayed();
            }).then(result => {
                assert.isFalse(result, 'email-input should not be present');
            }).then(() => {
                return userWizard.isItemInvalid(appConst.SUPER_USER_DISPLAY_NAME);
            }).then(isInvalid => {
                assert.isFalse(isInvalid, 'red icon should not be displayed in the wizard');
            }).then(() => {
                return userWizard.waitForSaveButtonEnabled();
            }).then(isEnabled => {
                assert.isTrue(isEnabled, 'Save button should be enabled');
            }).then(() => {
                //unable to delete 'su' user
                return userWizard.waitForDeleteButtonDisabled();
            }).then(disabled => {
                assert.isTrue(disabled, 'Delete button should be disabled, because `su` is selected');
            })
        });

    it('WHEN `anonymous` is opened THEN email input should be hidden AND Delete button should be disabled',
        () => {
            let userWizard = new UserWizard();
            return testUtils.selectUserAndOpenWizard(appConst.ANONYMOUS_USER_NAME).then(() => {
                return userWizard.isEmailInputDisplayed();
            }).then((result) => {
                assert.isFalse(result, 'email-input should not be present');
            }).then(() => {
                return userWizard.isItemInvalid(appConst.ANONYMOUS_USER_DISPLAY_NAME);
            }).then((isInvalid) => {
                assert.isFalse(isInvalid, 'red icon should not be displayed on the wizard');
            }).then(() => {
                return userWizard.waitForSaveButtonEnabled();
            }).then(isEnabled => {
                assert.isTrue(isEnabled, 'Save button should be enabled');
            }).then(() => {
                //unable to delete 'anonymous' user
                return userWizard.waitForDeleteButtonDisabled();
            }).then(disabled => {
                assert.isTrue(disabled, 'Delete button should be disabled');
            })
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
