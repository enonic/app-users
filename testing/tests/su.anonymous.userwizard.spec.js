/**
 * Created on 11.04.2018.
 * Verifies: xp-apps#617 Allow empty email for SU and Anonymous
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');

describe("su and anonymous users specification: empty email is allowed, validation lets empty email through when saving.", function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it("WHEN 'su' is opened THEN email input should be hidden AND 'Delete' button should be disabled",
        async () => {
            let userWizard = new UserWizard();
            //1. Select and open SU:
            await testUtils.selectUserAndOpenWizard(appConst.SUPER_USER_NAME);
            let result = await userWizard.isEmailInputDisplayed();
            assert.isFalse(result, 'email-input should not be displayed');
            let isInvalid = await userWizard.isItemInvalid(appConst.SUPER_USER_DISPLAY_NAME);
            assert.isFalse(isInvalid, 'red icon should not be displayed in the wizard');
            //2.'Save' button should be enabled:
            await userWizard.waitForSaveButtonEnabled();
            //3. 'Delete button should be disabled, because `su` is selected'. Unable to delete 'su' user
            await userWizard.waitForDeleteButtonDisabled();
        });

    it("WHEN 'anonymous' is opened THEN email input should be hidden AND Delete button should be disabled",
        async () => {
            let userWizard = new UserWizard();
            //1. Select and open Anonymous User:
            await testUtils.selectUserAndOpenWizard(appConst.ANONYMOUS_USER_NAME);
            let result = await userWizard.isEmailInputDisplayed();
            assert.isFalse(result, 'email-input should not be displayed');
            //2. Red circle should not be present in the wizard:
            let isInvalid = await userWizard.isItemInvalid(appConst.ANONYMOUS_USER_DISPLAY_NAME);
            assert.isFalse(isInvalid, 'red icon should not be displayed in the wizard');
            //3. 'Save button should be enabled'
            await userWizard.waitForSaveButtonEnabled();
            //4. 'Delete button should be disabled', unable to delete 'anonymous' user
            await userWizard.waitForDeleteButtonDisabled();
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});
