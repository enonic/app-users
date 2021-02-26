/**
 * Created on 26/02/2021.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userItemsBuilder = require('../libs/userItems.builder.js');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const AdfsIdProviderConfiguratorDialog = require('../page_objects/wizardpanel/asfs.provider.config');

describe('ADFS Id Provider, tests for provider configuration dialog with item set', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    //Verifies:https://github.com/enonic/app-users/issues/533
    //Empty form in the ID Provider config #533
    it("GIVEN provider's data is filled WHEN Provider-configuration has been opened THEN required inputs should be loaded",
        async () => {
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', 'Second Selenium App', null);
            let userBrowsePanel = new UserBrowsePanel();
            let idProviderWizard = new IdProviderWizard();
            let providerConfig = new AdfsIdProviderConfiguratorDialog();
            //1. Open new ID Provider wizard and type the data:
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            //2. Open the configurator dialog:
            await providerConfig.openConfigurator();
            //3. Verify that the modal dialog is loaded:
            await providerConfig.waitForClientIdInputDisplayed();
            await providerConfig.waitForAuthorizationUrlInputDisplayed();
        });

    it("GIVEN Provider-configuration is opened WHEN 'Add Proxy' button has been clicked THEN proxy form should be loaded",
        async () => {
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', 'Second Selenium App', null);
            let userBrowsePanel = new UserBrowsePanel();
            let idProviderWizard = new IdProviderWizard();
            let providerConfig = new AdfsIdProviderConfiguratorDialog();
            //1. Open new ID Provider wizard and type the data:
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            //2. Open the configurator dialog:
            await providerConfig.openConfigurator();
            //3. Click on Add Proxy button
            await providerConfig.clickOnAddProxyButton();
            //4. Verify that proxy form is loaded:
            await providerConfig.waitForProxyHostInputDisplayed();
        });

    it("GIVEN all required inputs have been filed in configurator dialog WHEN 'Apply' button has been pressed THEN 'Save' button gets enabled",
        async () => {
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', 'Second Selenium App', null);
            let idProviderWizard = new IdProviderWizard();
            let providerConfig = new AdfsIdProviderConfiguratorDialog();
            //1. Open new ID Provider wizard and type the data:
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            //2. Open the configurator dialog:
            await providerConfig.openConfigurator();
            await providerConfig.typeInClientIdInput("1234567");
            //3. Click on 'Add Proxy' button
            await providerConfig.clickOnAddProxyButton();
            //4. type a text in the required host-input
            await providerConfig.typeInProxyHostInput("http://proxy.com");
            //5.Click on 'Apply' button
            await providerConfig.clickOnApplyButton();
            //6. Save the provider:
            await idProviderWizard.waitAndClickOnSave();
            let message = await idProviderWizard.waitForNotificationMessage();
            assert.equal(message, appConst.PROVIDER_CREATED_NOTIFICATION, "'Id provider was created' - this message should appear");

        });
    //TODO add tests to verify issue https://github.com/enonic/lib-admin-ui/issues/1822
    //TODO add tests to verify issue https://github.com/enonic/lib-admin-ui/issues/1815

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});

