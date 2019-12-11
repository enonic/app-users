/**
 * Created on 20/03/2018.
 *
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const userItemsBuilder = require('../libs/userItems.builder.js');
const UserBrowsePanel = require('../page_objects/browsepanel/userbrowse.panel');
const IdProviderWizard = require('../page_objects/wizardpanel/idprovider.wizard');
const testUtils = require('../libs/test.utils');
const appConst = require('../libs/app_const');
const SaveBeforeCloseDialog = require('../page_objects/save.before.close.dialog');
const ProviderConfigDialog = require('../page_objects/wizardpanel/provider.configurator.dialog');

describe('Id Provider, provider-dialog specification', function () {
    this.timeout(appConst.TIMEOUT_SUITE);
    webDriverHelper.setupBrowser();

    it(`GIVEN wizard for new Id Provider is opened WHEN Provider-configuration has required inputs THEN 'Save' button should be disabled AND 'Save Before' dialog should appear after 'Close' has been clicked`,
        async () => {
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', 'First Selenium App', null);
            let userBrowsePanel = new UserBrowsePanel();
            let idProviderWizard = new IdProviderWizard();
            //1. Open new ID Provider wizard and type the data:
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            //2. Save button should be disabled, because  Provider-configuration has required inputs:
            await idProviderWizard.waitForSaveButtonDisabled();
            //3. Click on close-icon:
            await userBrowsePanel.doClickOnCloseTabButton(testIdProvider.displayName);
            testUtils.saveScreenshot('application_save_before_close_present1');
            let saveBeforeCloseDialog = new SaveBeforeCloseDialog();
            //"Save before close" dialog should appear:
            await saveBeforeCloseDialog.waitForDialogOpened();
        });

    it(`GIVEN Provider-configuration dialog is opened WHEN required inputs in Provider-dialog are filled THEN the Id Provider is getting valid`,
        async () => {
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', 'First Selenium App', null);
            let idProviderWizard = new IdProviderWizard();
            let providerConfigDialog = new ProviderConfigDialog();
            //1. Open new id provider wizard, type the data:
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            await idProviderWizard.pause(700);
            //2. Open app-configuration dialog and fill required inputs:
            await providerConfigDialog.openDialogFillRequiredInputs('domain', 'id', 'secret');
            //3. ID Provider gets valid in the wizard:
            let result = await idProviderWizard.isItemInvalid(testIdProvider.displayName);
            testUtils.saveScreenshot('id_provider_is_getting_valid');
            assert.isFalse(result, 'Red icon should not be present at the wizard');
        });

    it(`GIVEN wizard for new Id Provider is opened AND required inputs in provider-configuration dialog are filled WHEN Save and close the wizard THEN 'Save Before' dialog should not appear`,
        async () => {
            let saveBeforeCloseDialog = new SaveBeforeCloseDialog();
            let name = userItemsBuilder.generateRandomName('provider');
            let testIdProvider = userItemsBuilder.buildIdProvider(name, 'test Id provider', 'First Selenium App', null);
            let idProviderWizard = new IdProviderWizard();
            let userBrowsePanel = new UserBrowsePanel();
            let providerConfigDialog = new ProviderConfigDialog();
            //1. Open new id provider wizard, type the data:
            await testUtils.openIdProviderWizard(testIdProvider);
            await idProviderWizard.typeData(testIdProvider);
            await idProviderWizard.pause(700);
            //2. Open app-configuration dialog and fill required inputs:
            await providerConfigDialog.openDialogFillRequiredInputs('domain', 'id', 'secret');
            //3. Save button should be enabled:
            await idProviderWizard.waitAndClickOnSave();
            await idProviderWizard.waitForSpinnerNotVisible();
            //4. Click on close-icon:
            await userBrowsePanel.doClickOnCloseTabButton(testIdProvider.displayName);
            await idProviderWizard.pause(500);
            testUtils.saveScreenshot("idprovider_wizard_modal_dialog_should_be_closed");
            let result = await saveBeforeCloseDialog.isDialogLoaded();
            assert.isFalse(result, "`Save before close` dialog should not appear");
        });

    beforeEach(() => testUtils.navigateToUsersApp());
    afterEach(() => testUtils.doCloseUsersApp());
    before(() => {
        return console.log('specification starting: ' + this.title);
    });
});

