/**
 * Created on 26/02/2021.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const userItemsBuilder = require('../libs/userItems.builder.js');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const AdfsIdProviderConfiguratorDialog = require('../page_objects/wizardpanel/provider-config/asfs.provider.config');

describe('ADFS Id Provider, tests for provider configuration dialog with item set', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    const AUTH_APP_NAME_ADFS = 'Second Selenium App';

    it("GIVEN name and app-provider has been selected WHEN there are required inputs in app-config THEN 'Save' button should be disabled",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            let name = userItemsBuilder.generateRandomName('provider');
            let idProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', AUTH_APP_NAME_ADFS, null);
            // 1. Wizard for a new id-provider has been opened:
            await testUtils.openIdProviderWizard(idProvider);
            // 2. type the name:
            await idProviderWizard.typeDisplayName(name);
            // 3. Select an application(ADFS provider wit required inputs)
            await idProviderWizard.filterOptionsAndSelectApplication(AUTH_APP_NAME_ADFS);
            // 4. Verify that Save button is disabled when required inputs are not filled:
            await testUtils.saveScreenshot('id_prov_wizard_save_disabled');
            await idProviderWizard.waitForSaveButtonDisabled();
        });

    // Verifies:https://github.com/enonic/app-users/issues/533
    // Empty form in the ID Provider config #533
    it("GIVEN provider's data is filled WHEN Provider-configuration has been opened THEN required inputs should be loaded",
        async () => {
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', AUTH_APP_NAME_ADFS, null);
            let idProviderWizard = new IdProviderWizard();
            let providerConfig = new AdfsIdProviderConfiguratorDialog();
            // 1. Open new ID Provider wizard and type the data:
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            // 2. Open the configurator dialog:
            await providerConfig.openConfigurator();
            // 3. Verify that the modal dialog is loaded:
            await providerConfig.waitForClientIdInputDisplayed();
            await providerConfig.waitForAuthorizationUrlInputDisplayed();
        });

    it("GIVEN Provider-configuration is opened WHEN 'Add Proxy' button has been clicked THEN proxy form should be loaded",
        async () => {
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', 'Second Selenium App', null);
            let idProviderWizard = new IdProviderWizard();
            let providerConfig = new AdfsIdProviderConfiguratorDialog();
            // 1. Open new ID Provider wizard and type the data:
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            // 2. Open the configurator dialog:
            await providerConfig.openConfigurator();
            // 3. Click on Add Proxy button
            await providerConfig.clickOnAddProxyButton();
            // 4. Verify that proxy form is loaded:
            await providerConfig.waitForProxyHostInputDisplayed();
        });

    it("GIVEN all required inputs have been filed in configurator dialog WHEN 'Apply' button has been pressed THEN 'Save' button gets enabled",
        async () => {
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', 'Second Selenium App', null);
            let idProviderWizard = new IdProviderWizard();
            let providerConfig = new AdfsIdProviderConfiguratorDialog();
            // 1. Open new ID Provider wizard and type the data:
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            // 2. Open the configurator dialog:
            await providerConfig.openConfigurator();
            let clientId = '1234567';
            await providerConfig.typeInClientIdInput(clientId);
            // 3. Click on 'Add Proxy' button
            await providerConfig.clickOnAddProxyButton();
            // 4. type a text in the required host-input
            await providerConfig.typeInProxyHostInput('http://proxy.com');
            // 5.Click on 'Apply' button
            await providerConfig.clickOnApplyButton();
            // 6. Save the provider:
            await idProviderWizard.waitAndClickOnSave();
            let message = await idProviderWizard.waitForNotificationMessage();
            // 'Id provider was created'
            assert.equal(message, appConst.NOTIFICATION_MESSAGE.PROVIDER_CREATED, "Expected message should appear");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});

