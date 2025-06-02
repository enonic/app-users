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

describe("Id Provider wizard - checks unsaved changes in wizards", function () {
    this.timeout(appConst.TIMEOUT_SUITE);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    const APP_ADFS_PROVIDER_NAME = appConst.ID_PROVIDERS.APP_ADFS_PROVIDER;

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

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(async () => {
        await testUtils.getBrowser().maximizeWindow();
        return console.log('specification starting: ' + this.title);
    });
});

