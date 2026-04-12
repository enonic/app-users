/**
 * Created on 16.03.2018.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const testUtils = require('../libs/test.utils');
const userItemsBuilder = require('../libs/userItems.builder.js');
const appConst = require('../libs/app_const');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');
const Oauth0IdProviderConfiguratorDialog = require('../page_objects/wizardpanel/provider-config/oauth0.idprovider.config');

describe("Id Provider wizard - checks unsaved changes in wizards", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    const APP_ADFS_PROVIDER_NAME = appConst.ID_PROVIDERS.APP_ADFS_PROVIDER;
    const APP_OAUTH0_PROVIDER_NAME = appConst.ID_PROVIDERS.APP_OAUTH0_PROVIDER;

    // Id Provider wizard - Confirmation about unsaved changes when no changes were made #689
    it("GIVEN wizard for new Id Provider is opened WHEN no changes in the wizard AND 'close' icon has been pressed THEN Confirmation dialog must not be loaded",
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Click on New, select  'Id Provider' in the modal dialog:
            await testUtils.openIdProviderWizard();
            await userBrowsePanel.pause(700);
            // 2. Close the tab (no any data were typed):
            await userBrowsePanel.doClickOnCloseTabButton("<Unnamed Id Provider>");
            await userBrowsePanel.pause(500);
            await testUtils.saveScreenshot('provider_save_before1');
            // 3. Verify that Confirmation modal dialog does not load:
            let result = await confirmationDialog.isDialogLoaded();
            //there are no unsaved changes, so dialog should not be present.
            assert.ok(result === false, "Confirmation dialog must not be loaded");
        });

    it("GIVEN description input has been filled in WHEN 'close tab icon' has been pressed THEN Confirmation dialog should appear",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            // 1. Click on New, select  'Id Provider' in the modal dialog:
            await testUtils.openIdProviderWizard();
            // 2. Fill in the description input:
            await idProviderWizard.typeDescription('description');
            // 3. Click on 'close tab' icon:
            await userBrowsePanel.doClickOnCloseTabButton("<Unnamed Id Provider>");
            await testUtils.saveScreenshot('provider_save_before2');
            // 4. Verify - save before close dialog should appear!
            await confirmationDialog.waitForDialogLoaded();
        });

    it("GIVEN name and idProvider inputs have been filled in WHEN 'close' icon has been pressed THEN 'Confirmation' dialog should appear",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            let name = userItemsBuilder.generateRandomName('provider');
            let userBrowsePanel = new UserBrowsePanel();
            let idProvider = userItemsBuilder.buildIdProvider(name, 'test adfs Id provider', APP_ADFS_PROVIDER_NAME, null);
            // 1. Wizard for new provider has been opened:
            await testUtils.openIdProviderWizard(idProvider);
            // 2. type the data:
            await idProviderWizard.typeData(idProvider);
            await testUtils.saveScreenshot('provider_should_be_selected');
            // 3. Click on close wizard icon:
            await userBrowsePanel.doClickOnCloseTabButton(idProvider.displayName);
            let confirmationDialog = new ConfirmationDialog();
            // 4. Verify that 'Confirmation' dialog should appear, otherwise exception will be thrown:
            await confirmationDialog.waitForDialogLoaded();
        });

    it("GIVEN new id provider has been saved WHEN 'close' icon has been clicked THEN 'Confirmation dialog' should not appear",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            let name = userItemsBuilder.generateRandomName('provider');
            let idProvider = userItemsBuilder.buildIdProvider(name, 'test adfs Id provider', APP_ADFS_PROVIDER_NAME, null);

            // 1. Open new id provider wizard and fill in the required fields:
            await testUtils.openIdProviderWizard(idProvider);
            await idProviderWizard.typeData(idProvider);

            // 2. Save the id provider:
            await idProviderWizard.waitAndClickOnSave();
            await idProviderWizard.waitForNotificationMessage();
            await idProviderWizard.pause(1000);

            // 3. Close the saved wizard tab:
            await userBrowsePanel.doClickOnCloseTabButton(idProvider.displayName);
            await idProviderWizard.pause(400);

            // 4. Verify that confirmation dialog is not loaded after save:
            let isLoaded = await confirmationDialog.isDialogLoaded();
            assert.ok(isLoaded === false, 'Confirmation dialog should not be loaded, because all changes were saved');
        });

    it("GIVEN existing id provider with app config is opened WHEN 'close' icon has been clicked without edits THEN 'Confirmation dialog' should not appear",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let confirmationDialog = new ConfirmationDialog();
            let providerConfig = new Oauth0IdProviderConfiguratorDialog();
            let name = userItemsBuilder.generateRandomName('provider');
            let idProvider = userItemsBuilder.buildIdProvider(name, 'test oauth Id provider', APP_OAUTH0_PROVIDER_NAME, null);

            // 1. Create and save a provider with application config:
            await testUtils.openIdProviderWizard(idProvider);
            await idProviderWizard.typeData(idProvider);
            await providerConfig.openConfigurator();
            await providerConfig.typeInClientIdInput('1234567');
            await providerConfig.clickOnAddProxyButton();
            await providerConfig.typeInProxyHostInput('http://proxy.com');
            await providerConfig.clickOnApplyButton();
            await idProviderWizard.waitAndClickOnSave();
            await idProviderWizard.waitForNotificationMessage();
            await userBrowsePanel.closeTabAndWaitForGrid(idProvider.displayName);

            // 2. Reopen the saved provider and close it without making any edits:
            await testUtils.selectAndOpenIdProvider(idProvider.displayName);
            await userBrowsePanel.doClickOnCloseTabButton(idProvider.displayName);
            await idProviderWizard.pause(400);

            // 3. Verify that confirmation dialog is not loaded:
            let isLoaded = await confirmationDialog.isDialogLoaded();
            assert.ok(isLoaded === false, 'Confirmation dialog should not be loaded when no changes were made');
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
