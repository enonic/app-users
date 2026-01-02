/**
 * Created on 11.04.2018.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');

describe("su and anonymous users specification: empty email is allowed, validation lets empty email through when saving.", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it("WHEN 'su' is opened THEN email input should be hidden AND 'Delete' button should be disabled",
        async () => {
            let userWizard = new UserWizard();
            // 1. Select and open SU:
            await testUtils.selectUserAndOpenWizard(appConst.SUPER_USER_NAME);
            let result = await userWizard.isEmailInputDisplayed();
            assert.ok(result === false, 'email-input should not be displayed');
            let isInvalid = await userWizard.isItemInvalid(appConst.SUPER_USER_DISPLAY_NAME);
            assert.ok(isInvalid === false, 'red icon should not be displayed in the wizard');
            // 2.'Save' button should be enabled:
            await userWizard.waitForSaveButtonEnabled();
            // 3. 'Delete button should be disabled, because `su` is selected'. Unable to delete 'su' user
            await userWizard.waitForDeleteButtonDisabled();
        });

    // Verifies: It shouldn't be possible to unassign system.administrator role from su user
    // https://github.com/enonic/app-users/issues/1227
    // https://github.com/enonic/app-users/issues/1311
    it.skip(
        "WHEN 'su' is opened THEN Administrator role should be displayed in the roles form AND 'remove' icon should not be displayed here",
        async () => {
            let userWizard = new UserWizard();
            // 1. Select and open SU:
            await testUtils.selectUserAndOpenWizard(appConst.SUPER_USER_NAME);
            // 2. Verify that only one role is displayed in the roles form:
            let actualRoles = await userWizard.getSelectedRoles();
            assert.equal(actualRoles[0], appConst.ROLES_DISPLAY_NAME.ADMINISTRATOR,
                "system Administrator role should be present in the roles form");
            assert.equal(actualRoles.length, 1, "One role should be displayed in the roles form");
            // 3. Verify that remove role icon is not displayed in the form:
            await userWizard.waitForRemoveRoleIconNotDisplayed(appConst.ROLES_DISPLAY_NAME.ADMINISTRATOR);
        });

    it("WHEN 'anonymous' user is opened THEN email input should be hidden AND Delete button should be disabled",
        async () => {
            let userWizard = new UserWizard();
            // 1. Select and open Anonymous User:
            await testUtils.selectUserAndOpenWizard(appConst.ANONYMOUS_USER_NAME);
            let result = await userWizard.isEmailInputDisplayed();
            assert.ok(result === false, 'email-input should not be displayed');
            // 2. Red circle should not be present in the wizard:
            let isInvalid = await userWizard.isItemInvalid(appConst.ANONYMOUS_USER_DISPLAY_NAME);
            assert.ok(isInvalid === false, 'red icon should not be displayed in the wizard');
            // 3. 'Save button should be enabled'
            await userWizard.waitForSaveButtonEnabled();
            // 4. 'Delete button should be disabled', unable to delete 'anonymous' user
            await userWizard.waitForDeleteButtonDisabled();
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
