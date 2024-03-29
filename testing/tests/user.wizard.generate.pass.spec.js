/**
 * Created on 12.04.2018.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const UserWizard = require('../page_objects/wizardpanel/user.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');

describe("User Wizard generate password spec", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it("WHEN 'User' wizard is opened THEN 'generate' and 'show' links should be displayed",
        async () => {
            let userWizard = new UserWizard();
            // 1. Open new user-wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            let isDisplayed = await userWizard.isGenerateDisplayed();
            await testUtils.saveScreenshot('generate_password_link');
            assert.ok(isDisplayed, "generate password link should be displayed");
            isDisplayed = await userWizard.isShowLinkDisplayed();
            assert.ok(isDisplayed, "show-link should be displayed");
        });

    it("GIVEN user-wizard is opened WHEN 'Generate' link has been pressed THEN new password should be generated",
        async () => {
            let userWizard = new UserWizard();
            // 1. Open new user-wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Click on 'generate':
            await userWizard.clickOnGenerateLink();
            await testUtils.saveScreenshot('generate_password_link_clicked');
            let result = await userWizard.getTextInPasswordInput();
            assert.ok(result.length > 0, "new password should be generated");
        });

    it("GIVEN user-wizard is opened WHEN 'Show' password link has been clicked THEN 'Hide' link should appear",
        async () => {
            let userWizard = new UserWizard();
            // 1. Open new user-wizard:
            await testUtils.clickOnSystemOpenUserWizard();
            // 2. Click on Show Password button:
            await userWizard.clickOnShowPasswordLink();
            await testUtils.saveScreenshot('show_password_link_clicked');
            let result = await userWizard.isHidePasswordLinkDisplayed();
            assert.ok(result, "'Hide' link gets displayed");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});
