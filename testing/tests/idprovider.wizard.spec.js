/**
 * Created on 5/30/2017.
 * verifies the xp-apps#201 (options not filtered, when the name of ID provider has been typed)
 * https://github.com/enonic/xp-apps/issues/201
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');

describe("Id Provider wizard - validation and inputs", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === "undefined") {
        webDriverHelper.setupBrowser();
    }

    it("WHEN 'IdProvider' wizard is opened THEN red circle should be present, because required input is empty",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            await testUtils.openIdProviderWizard();
            let isRedIconPresent = await idProviderWizard.waitUntilInvalidIconAppears('<Unnamed Id Provider>');
            assert.isTrue(isRedIconPresent, "red circle should be present in the tab, because required input(name) is empty");
        });

    it("WHEN 'New' button has been pressed AND 'Id Provider' menu-item has been clicked THEN required inputs should be loaded in the wizard",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            await testUtils.openIdProviderWizard();
            let result = await idProviderWizard.isDisplayNameInputVisible();
            assert.isTrue(result, "display name input should be present");
            result = await idProviderWizard.isDescriptionInputDisplayed();
            assert.isTrue(result, "description input should be present");
            result = await idProviderWizard.waitForSaveButtonDisabled();
            assert.isTrue(result, "Save button should be disabled");
            result = await idProviderWizard.isAuthApplicationsOptionsFilterInputDisplayed();
            assert.isTrue(result, "'Auth Applications Options Filter' input should be present");
            result = await idProviderWizard.isPermissionsOptionsFilterInputDisplayed();
            assert.isTrue(result, "'Permissions Options Filter' input should be present");
        });

    it("GIVEN 'Id Provider' wizard is opened WHEN 'Standard ID Provider' has been selected THEN 'Provider Options Filter' gets not visible",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            await testUtils.openIdProviderWizard();
            await idProviderWizard.filterOptionsAndSelectApplication(appConst.ID_PROVIDERS.STANDARD_ID_PROVIDER);
            let result = await idProviderWizard.isAuthApplicationsOptionsFilterInputDisplayed();
            assert.isFalse(result, "'Provider Options Filter' input gets not visible");
        });

    it("GIVEN wizard for new provider is opened and `Standard ID Provider` is selected WHEN the application has been removed THEN 'Provider Options Filter' input gets visible",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            await testUtils.openIdProviderWizard();
            //1. Select 'Standard ID Provider' option:
            await idProviderWizard.filterOptionsAndSelectApplication(appConst.ID_PROVIDERS.STANDARD_ID_PROVIDER);
            //2. remove the selected application:
            await idProviderWizard.removeAuthApplication();
            let result = await idProviderWizard.isAuthApplicationsOptionsFilterInputDisplayed();
            assert.isTrue(result, "'Provider Options Filter' input gets displayed");
        });

    it("WHEN new 'Id Provider Wizard' is opened THEN three default three roles should be present",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            await testUtils.openIdProviderWizard();
            await idProviderWizard.clickOnPermissionsTabItem();
            //three default ACL entry should be displayed:
            let result = await idProviderWizard.getPermissions();
            assert.equal(result.length, 3);
            assert.equal(result[0], appConst.ROLES_DISPLAY_NAME.AUTHENTICATED);
            assert.equal(result[1], appConst.ROLES_DISPLAY_NAME.ADMINISTRATOR);
            assert.equal(result[2], appConst.ROLES_DISPLAY_NAME.USERS_ADMINISTRATOR);
        });

    it("GIVEN wizard for 'Id Provider Wizard' is opened WHEN default permissions for 'Everyone' role has been added THEN 'Permissions Options Filter' input should be displayed",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            await testUtils.openIdProviderWizard();
            await idProviderWizard.filterOptionsAndSelectPermission("Everyone");
            let result = await idProviderWizard.isPermissionsOptionsFilterInputDisplayed();
            assert.isTrue(result, "'Permissions Options Filter' input should not be displayed");
            let perm = await idProviderWizard.getPermissions();
            assert.equal(perm[0], appConst.ROLES_DISPLAY_NAME.AUTHENTICATED);
            assert.equal(perm[1], appConst.ROLES_DISPLAY_NAME.ADMINISTRATOR);
            assert.equal(perm[2], appConst.ROLES_DISPLAY_NAME.USERS_ADMINISTRATOR);
            assert.equal(perm[3], appConst.ROLES_DISPLAY_NAME.EVERYONE);
        });

    it("GIVEN new wizard for 'Id Provider Wizard' is opened WHEN name has been typed THEN red icon gets not visible",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            await testUtils.openIdProviderWizard();
            await idProviderWizard.typeDisplayName("test");
            let isRedIconNotPresent = await idProviderWizard.waitUntilInvalidIconDisappears("test");
            assert.isTrue(isRedIconNotPresent, "red circle gets not visible in the tab, because  required input(name) is filled");
            // Save button gets enabled:
            await idProviderWizard.waitForSaveButtonEnabled();
            //Delete button should be disabled:
            await idProviderWizard.waitForDeleteButtonDisabled;
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});



