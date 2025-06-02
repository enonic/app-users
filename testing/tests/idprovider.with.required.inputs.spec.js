/**
 * Created on 20/03/2018.
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const userItemsBuilder = require('../libs/userItems.builder.js');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const ConfirmationDialog = require('../page_objects/confirmation.dialog');
const AdfsIdProviderConfiguratorDialog = require('../page_objects/wizardpanel/provider-config/adfs.idprovider.configurator.dialog');
const GroupWizard = require('../page_objects/wizardpanel/group.wizard');

describe('ADFS id-provider configurator dialog specification', function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    const APP_ADFS_ID_PROVIDER = appConst.ID_PROVIDERS.APP_ADFS_PROVIDER;
    let TEST_ADFS_ID_PROVIDER_NAME;
    const NOTIFICATION_MESSAGE = "The application selected for this id provider does not allow to create users.";
    const GROUP_NAME = userItemsBuilder.generateRandomName('group');

    it("WHEN app-provider with required inputs has been selected in the wizard THEN 'Save' button gets disabled",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            let name = userItemsBuilder.generateRandomName('provider');
            let idProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', APP_ADFS_ID_PROVIDER, null);
            // 1. Wizard for a new id-provider has been opened:
            await testUtils.openIdProviderWizard(idProvider);
            // 2. type a name:
            await idProviderWizard.typeDisplayName(name);
            // 3. Select an application with required inputs in provider-config:
            await idProviderWizard.filterOptionsAndSelectApplication(APP_ADFS_ID_PROVIDER);
            // 4. Verify that Save button gets disabled:
            await idProviderWizard.waitForSaveButtonDisabled();
        });

    it("GIVEN AdfsIdProviderConfiguratorDialog is opened WHEN  all required inputs has been filled in AND Apply button pressed in the dialog THEN 'Save' button gets enabled",
        async () => {
            let idProviderWizard = new IdProviderWizard();
            let name = userItemsBuilder.generateRandomName('provider');
            let idProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', APP_ADFS_ID_PROVIDER, null);
            // 1. Wizard for a new id-provider has been opened:
            await testUtils.openIdProviderWizard(idProvider);
            // 2. type a name:
            await idProviderWizard.typeDisplayName(name);
            // 3. Select an application with required inputs in provider-config:
            await idProviderWizard.filterOptionsAndSelectApplication(APP_ADFS_ID_PROVIDER);
            // 4. Open the configurator
            await idProviderWizard.clickOnEditAuthAppConfig();
            let providerConfigDialog = new AdfsIdProviderConfiguratorDialog();
            // 5. Fill in the required inputs:
            await providerConfigDialog.typeInDomainInput('test');
            await providerConfigDialog.typeInClientIdInput('id');
            await providerConfigDialog.typeInClientSecretInput('secret');
            // 6. Click on Apply button
            await providerConfigDialog.clickOnApplyButton();
            await providerConfigDialog.waitForClosed();
            // 7. Verify that Save button gets enabled:
            await idProviderWizard.waitForSaveButtonEnabled();
        });

    it(`GIVEN provider's data is filled in WHEN Provider-configuration has required inputs THEN 'Save' button should be disabled AND 'Confirmation' dialog should appear after 'Close' has been clicked`,
        async () => {
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', APP_ADFS_ID_PROVIDER, null);
            let userBrowsePanel = new UserBrowsePanel();
            let idProviderWizard = new IdProviderWizard();
            // 1. Open new ID Provider wizard and type the data:
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            // 2. Save button should be disabled, because  Provider-configuration has required inputs:
            await idProviderWizard.waitForSaveButtonDisabled();
            // 3. Click on close-icon:
            await userBrowsePanel.doClickOnCloseTabButton(testIdProvider.displayName);
            await testUtils.saveScreenshot('application_save_before_close_present1');
            let confirmationDialog = new ConfirmationDialog();
            // Verify - Confirmation dialog should appear:
            await confirmationDialog.waitForDialogLoaded();
        });

    it("GIVEN new ID provider with invalid configuration WHEN click on close icon THEN click on 'Yes' button in confirmation dialog THEN error notification message should appear",
        async () => {
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', APP_ADFS_ID_PROVIDER, null);
            let userBrowsePanel = new UserBrowsePanel();
            let idProviderWizard = new IdProviderWizard();
            // 1. Open new ID Provider wizard and select the provider with invalid configuration:
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            // 2. Click on close-icon:
            await userBrowsePanel.doClickOnCloseTabButton(testIdProvider.displayName);
            let confirmationDialog = new ConfirmationDialog();
            // 3. "Confirmation" dialog should appear:
            await confirmationDialog.waitForDialogLoaded();
            // 4. Click on 'Yes' button:
            await confirmationDialog.clickOnYesButton();
            // 5. Expected notification message should appear:
            await testUtils.saveScreenshot('provider_save_before_close_yes');
            let message = await idProviderWizard.waitForNotificationMessage();
            assert.equal(message, "Invalid configuration of the ID Provider.", "Expected notification message should appear");
        });

    it(`GIVEN Provider-configuration dialog is opened WHEN required inputs in Provider-dialog are filled THEN the Id Provider is getting valid`,
        async () => {
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', APP_ADFS_ID_PROVIDER, null);
            let idProviderWizard = new IdProviderWizard();
            let providerConfigDialog = new AdfsIdProviderConfiguratorDialog();
            // 1. Open new id provider wizard, type the data:
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            await idProviderWizard.pause(700);
            // 2. Open app-configuration dialog and fill required inputs:
            await providerConfigDialog.openDialogFillRequiredInputsAndApply('domain', 'id', 'secret');
            // 3. ID Provider gets valid in the wizard:
            let result = await idProviderWizard.isItemInvalid(testIdProvider.displayName);
            await testUtils.saveScreenshot('id_provider_is_getting_valid');
            assert.ok(result === false, 'Red icon should not be present at the wizard');
        });

    it(`GIVEN wizard for new Id Provider is opened AND required inputs in provider-configuration dialog are filled WHEN Save and close the wizard THEN 'Save Before' dialog should not appear`,
        async () => {
            let confirmationDialog = new ConfirmationDialog();
            TEST_ADFS_ID_PROVIDER_NAME = userItemsBuilder.generateRandomName('adfsprovider');
            let testIdProvider = userItemsBuilder.buildIdProvider(TEST_ADFS_ID_PROVIDER_NAME, 'test Id provider', APP_ADFS_ID_PROVIDER,
                null);
            let idProviderWizard = new IdProviderWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let providerConfigDialog = new AdfsIdProviderConfiguratorDialog();
            // 1. Open new id provider wizard, type the data:
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            await idProviderWizard.pause(700);
            // 2. Open app-configuration dialog and fill required inputs:
            await providerConfigDialog.openDialogFillRequiredInputsAndApply('domain', 'id', 'secret');
            // 3. 'Save' button should be enabled:
            await idProviderWizard.waitAndClickOnSave();
            await idProviderWizard.waitForSpinnerNotVisible();
            // 4. Click on close-icon:
            await userBrowsePanel.doClickOnCloseTabButton(testIdProvider.displayName);
            await idProviderWizard.pause(500);
            await testUtils.saveScreenshot('idprovider_wizard_should_be_closed');
            // 5. Verify that confirmation modal dialog should not be loaded:
            let result = await confirmationDialog.isDialogLoaded();
            assert.ok(result === false, 'Confirmation dialog should not appear, all changes were saved');
        });

    it(`GIVEN id provider with a configuration is selected WHEN Create New User menu item has been clicked THEN expected notification message should appear`,
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            await userBrowsePanel.pause(2000);
            // 1. Select an existing provider with configurator then click on Create User menu item in the modal dialog:
            await testUtils.selectIdProviderAndClickOnMenuItem(TEST_ADFS_ID_PROVIDER_NAME, 'User');
            // 2. Verify the actual notification message - The application does not allow to create users
            let actualMessages = await userBrowsePanel.waitForNotificationMessage();
            await testUtils.saveScreenshot('app_does_not_allow_users');
            assert.ok(actualMessages.includes(NOTIFICATION_MESSAGE), "The application does not allow to create users");
        });

    it(`GIVEN id provider with a configuration is selected WHEN Create New User Group menu item has been clicked THEN expected notification message should appear`,
        async () => {
            // 1. Select an existing provider with adfs-configurator then click on 'Create User Group' menu item in the modal dialog:
            await testUtils.selectIdProviderAndClickOnMenuItem(TEST_ADFS_ID_PROVIDER_NAME, 'User Group');
            let groupWizard = new GroupWizard();
            // 2. Group Wizard should be loaded:
            await groupWizard.waitForOpened();
            await groupWizard.typeDisplayName(GROUP_NAME);
            // 3. Save the group:
            await groupWizard.waitAndClickOnSave();
            await testUtils.saveScreenshot('group_saved_in_adfs_provider');
            // 4. Verify that group is saved:
            let messages = await groupWizard.waitForNotificationMessage();
            assert.ok(messages.includes(appConst.NOTIFICATION_MESSAGE.GROUP_WAS_CREATED),
                "Group was created - message should be displayed");
        });

    // Verify Error in group selector inside ID providers config form #940
    // https://github.com/enonic/app-users/issues/940
    it(`GIVEN ADFS Provider Config Dialog is opened WHEN existing group has been selected in the dialog THEN expected group should be present in selected options`,
        async () => {
            let userBrowsePanel = new UserBrowsePanel();
            let providerConfigDialog = new AdfsIdProviderConfiguratorDialog();
            // 1. Create new test group:
            let groupName = userItemsBuilder.generateRandomName('group')
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', APP_ADFS_ID_PROVIDER, null);
            let idProviderWizard = new IdProviderWizard();
            let groupWizard = new GroupWizard();
            await testUtils.clickOnSystemAndOpenGroupWizard();
            await groupWizard.typeDisplayName(groupName);
            await groupWizard.waitAndClickOnSave();
            await userBrowsePanel.doClickOnCloseTabButton(groupName);
            await userBrowsePanel.waitForUsersGridLoaded(appConst.shortTimeout);
            // 2. Unselect the system id provider(move the focus to the grid, then unselect the item in the grid):
            await userBrowsePanel.clickOnRowByName('system');
            await userBrowsePanel.clickOnRowByName('system');
            // 3. Open new id provider wizard, fill in the display name input, select the application :
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            await idProviderWizard.pause(700);
            // 4. Open app-configuration dialog and fill required inputs:
            await providerConfigDialog.openDialogFillRequiredInputs('domain', 'id', 'secret');
            // 5. Select a group:
            await providerConfigDialog.selectGroup(groupName);
            await testUtils.saveScreenshot('adfs_idprovider_config_group_selected');
            // 6. Verify the selected option:
            let actualGroups = await providerConfigDialog.getSelectedGroups();
            assert.equal(actualGroups[0], groupName, "Expected group should be present in selected options");
        });

    it(`GIVEN Provider Config Dialog is opened WHEN required inputs are not filled THEN Apply button should be disabled`,
        async () => {
            let providerConfigDialog = new AdfsIdProviderConfiguratorDialog();
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', APP_ADFS_ID_PROVIDER, null);
            let idProviderWizard = new IdProviderWizard();

            // 1. Open new id provider wizard, fill in the display name input, select the application :
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            await idProviderWizard.pause(700);
            // 2. Open the configuration dialog:
            await providerConfigDialog.openProviderConfigDialog();
            // 3. Verify that 'Apply' button is disabled
            await providerConfigDialog.waitForApplyButtonDisabled();
            // 4. Fill in the required inputs:
            await providerConfigDialog.typeInDomainInput('domain');
            await providerConfigDialog.typeInClientSecretInput('secret');
            await providerConfigDialog.typeInClientIdInput('id');
            // 5. Verify that 'Apply' button gets enabled
            await testUtils.saveScreenshot('adfs_idprovider_config_apply_enabled');
            await providerConfigDialog.waitForApplyButtonEnabled();
        });

    //Verifies Site/provider Configurator - incorrect validation after adding occurrences of required inputs #1964
    //https://github.com/enonic/lib-admin-ui/issues/1964
    it(`GIVEN Provider Config Dialog is opened AND all required inputs are filled in WHEN occurrence of required input has been added THEN 'Apply' button gets disabled`,
        async () => {
            let providerConfigDialog = new AdfsIdProviderConfiguratorDialog();
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', APP_ADFS_ID_PROVIDER, null);
            let idProviderWizard = new IdProviderWizard();
            // 1. Open new id provider wizard, fill in the display name input, select the application :
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            await idProviderWizard.pause(700);
            // 2. Open the configuration dialog:
            await providerConfigDialog.openProviderConfigDialog();
            // 3. Fill in the required inputs:
            await providerConfigDialog.typeInDomainInput('domain');
            await providerConfigDialog.typeInClientSecretInput('secret');
            await providerConfigDialog.typeInClientIdInput('id');
            // 4. Verify that 'Apply' button gets enabled:
            await providerConfigDialog.waitForApplyButtonEnabled();
            await providerConfigDialog.clickOnAddKeyButton();
            await testUtils.saveScreenshot('adfs_idprovider_config_apply_disabled_2');
            await providerConfigDialog.waitForApplyButtonDisabled();
        });

    // Verify issue https://github.com/enonic/lib-admin-ui/issues/1822
    // Site/Provider configurator - menu button is not displayed in occurrence view #1822
    it(`GIVEN occurrence of required input has been added WHEN 'Menu button' in the occurrence has been clicked AND 'Delete' item clicked THEN 'Apply' button gets disabled`,
        async () => {
            let providerConfigDialog = new AdfsIdProviderConfiguratorDialog();
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', APP_ADFS_ID_PROVIDER, null);
            let idProviderWizard = new IdProviderWizard();

            // 1. Open new id provider wizard, fill in the display name input, select the application :
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            await idProviderWizard.pause(700);
            // 2. Open the configuration dialog:
            await providerConfigDialog.openProviderConfigDialog();
            // 3. Fill in the required inputs:
            await providerConfigDialog.typeInDomainInput('domain');
            await providerConfigDialog.typeInClientSecretInput('secret');
            await providerConfigDialog.typeInClientIdInput('id');
            // 4. Click on 'Add' button, add the form:
            await providerConfigDialog.clickOnAddKeyButton();
            // 5. Click on 'Menu button' in the occurrence and expand the menu:
            await providerConfigDialog.clickOnOccurrenceMenuButton('site key');
            await testUtils.saveScreenshot('adfs_idprovider_config_occur_menu');
            // 6. Click on 'Delete' menu item:
            await providerConfigDialog.clickOnOccurrenceMenuItem('site key', 'Delete');
            await testUtils.saveScreenshot('adfs_idprovider_config_apply_enabled_2');
            // 7. Verify that 'Apply' button gets enabled after deleting the form with required inputs:
            await providerConfigDialog.waitForApplyButtonEnabled();
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});

